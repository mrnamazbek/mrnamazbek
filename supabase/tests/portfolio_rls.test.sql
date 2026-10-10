begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(20);

select ok((select bool_and(c.relrowsecurity)
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in (
    'site_profiles','experiences','education','certifications','skill_groups',
    'projects','books','posts','content_snapshots','contact_messages','contact_rate_limits'
  )), 'Every portfolio table has RLS enabled');
select ok(has_table_privilege('anon', 'public.posts', 'SELECT'), 'Anonymous published-content reads are granted');
select ok(has_table_privilege('authenticated', 'public.posts', 'SELECT'), 'Authenticated published-content reads are granted');
select ok(not has_table_privilege('anon', 'public.posts', 'INSERT'), 'Anonymous content writes are denied');
select ok(not has_table_privilege('authenticated', 'public.posts', 'UPDATE'), 'Authenticated content edits are denied');
select ok(not has_table_privilege('anon', 'public.contact_messages', 'SELECT'), 'Anonymous contacts are private');
select ok(not has_table_privilege('authenticated', 'public.contact_messages', 'SELECT'), 'Authenticated contacts are private');
select ok(not has_table_privilege('anon', 'public.contact_messages', 'INSERT'), 'Contact writes must use the server route');
select ok(not has_table_privilege('anon', 'public.contact_rate_limits', 'SELECT'), 'Throttle keys are private');
select ok(not has_function_privilege('anon', 'public.consume_contact_rate_limit(text,integer,integer)', 'EXECUTE'), 'Anonymous throttle RPC is denied');
select ok(not has_function_privilege('authenticated', 'public.consume_contact_rate_limit(text,integer,integer)', 'EXECUTE'), 'Authenticated throttle RPC is denied');
select ok(has_function_privilege('service_role', 'public.consume_contact_rate_limit(text,integer,integer)', 'EXECUTE'), 'Server throttle RPC is granted');

insert into public.posts(slug,title,description,date,canonical_url,reading_time,body,published)
values ('rls-test-draft','Draft','Draft',current_date,'https://example.com/draft','1 min','Draft',false),
       ('rls-test-public','Published','Published',current_date,'https://example.com/public','1 min','Published',true);
set local role anon;
select is((select count(*)::integer from public.posts where slug = 'rls-test-draft'), 0, 'Anonymous role cannot read drafts');
reset role;
set local role authenticated;
select is((select count(*)::integer from public.posts where slug = 'rls-test-draft'), 0, 'Authenticated role cannot read drafts');
reset role;
set local role anon;
select is((select count(*)::integer from public.posts where slug = 'rls-test-public'), 1, 'Anonymous role can read a published article');
reset role;

delete from public.contact_rate_limits where key = 'rls-test-throttle';
select is((select allowed from public.consume_contact_rate_limit('rls-test-throttle', 1, 3600)), true, 'First request is accepted');
select is((select allowed from public.consume_contact_rate_limit('rls-test-throttle', 1, 3600)), false, 'Request exceeding the quota is rejected');
select ok((select retry_after between 1 and 3600 from public.consume_contact_rate_limit('rls-test-throttle', 1, 3600)), 'Rejected request has a retry time');
update public.contact_rate_limits set window_started_at = now() - interval '2 hours' where key = 'rls-test-throttle';
select is((select allowed from public.consume_contact_rate_limit('rls-test-throttle', 1, 3600)), true, 'Expired fixed window resets');
select throws_ok($$select * from public.consume_contact_rate_limit('rls-test-throttle', 0, 3600)$$,
  '22023', 'Invalid rate limit configuration', 'Invalid throttle configuration is rejected');

select * from finish();
rollback;
