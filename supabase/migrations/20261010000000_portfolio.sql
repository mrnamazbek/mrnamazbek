begin;

create table public.site_profiles (
  id text primary key default 'main',
  name text not null, short_name text not null, role text not null,
  location text not null, bio text not null, headline text not null,
  availability text not null, career_started_at date not null,
  resume_url text not null, email text not null, secondary_email text not null,
  work_email text not null, links jsonb not null check (jsonb_typeof(links) = 'object'),
  philosophy text not null, signature_url text not null, avatar_url text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.experiences (
  id text primary key, role text not null, organization text not null,
  period text not null, location text not null, kind text not null,
  highlights text[] not null default '{}', technologies text[] not null default '{}',
  current boolean not null default false, position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.education (
  id text primary key, degree text not null, institution text not null,
  period text not null, description text not null, note text,
  status text not null check (status in ('current', 'completed', 'planned')),
  position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.certifications (
  id text primary key, title text not null, issuer text not null,
  issued text, credential_id text, skills text[] not null default '{}',
  position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.skill_groups (
  id text primary key, category text not null, technologies text[] not null default '{}',
  position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.projects (
  id text primary key, slug text not null unique, name text not null,
  description text not null, url text not null, homepage text, language text,
  tags text[] not null default '{}', stars integer not null default 0 check (stars >= 0),
  forks integer not null default 0 check (forks >= 0), featured boolean not null default false,
  updated_at timestamptz not null, source text not null check (source in ('github', 'manual')),
  captured_at date not null, position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.books (
  id text primary key, title text not null, author text not null,
  cover_url text not null, isbn text not null, summary text not null,
  description text not null, tags text[] not null default '{}',
  status text not null check (status in ('reading', 'to-read', 'completed')),
  alt text not null, position integer not null default 0, published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.posts (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null, description text not null, date date not null,
  tags text[] not null default '{}', canonical_url text not null, image text,
  reading_time text not null, body text not null, position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

-- External feeds have heterogeneous schemas; their original payload and provenance stay intact.
create table public.content_snapshots (
  key text primary key,
  payload jsonb not null check (jsonb_typeof(payload) in ('object', 'array')),
  as_of text,
  published boolean not null default false,
  created_at timestamptz not null default now(), modified_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 10 and 5000),
  created_at timestamptz not null default now()
);

create table public.contact_rate_limits (
  key text primary key check (char_length(key) between 10 and 256),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

-- Ordering indexes cover the published-page reads, without indexing every content field.
create index experiences_published_position on public.experiences(position) where published;
create index education_published_position on public.education(position) where published;
create index certifications_published_position on public.certifications(position) where published;
create index skill_groups_published_position on public.skill_groups(position) where published;
create index projects_published_position on public.projects(position) where published;
create index books_published_position on public.books(position) where published;
create index posts_published_date on public.posts(date desc) where published;
create index contact_messages_created_at on public.contact_messages(created_at desc);
create index contact_rate_limits_updated_at on public.contact_rate_limits(updated_at);

create function public.touch_content_modified_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.modified_at = now();
  return new;
end;
$$;
revoke all on function public.touch_content_modified_at() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_profiles', 'experiences', 'education', 'certifications', 'skill_groups',
    'projects', 'books', 'posts', 'content_snapshots'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from public, anon, authenticated', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to service_role', table_name);
    execute format('create policy published_read on public.%I for select to anon, authenticated using (published = true)', table_name);
    execute format('create trigger touch_modified_at before update on public.%I for each row execute function public.touch_content_modified_at()', table_name);
  end loop;
end;
$$;

alter table public.contact_messages enable row level security;
alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_messages, public.contact_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.contact_messages, public.contact_rate_limits to service_role;
-- No browser-role policies or writes are granted for private contact data.

-- An upsert locks each throttle key, so limits remain atomic across Vercel instances.
create function public.consume_contact_rate_limit(
  p_key text,
  p_limit integer default 5,
  p_window_seconds integer default 3600
) returns table (allowed boolean, retry_after integer)
language plpgsql security definer set search_path = '' as $$
declare
  current_time_at timestamptz := clock_timestamp();
  window_start timestamptz;
  consumed integer;
begin
  if p_key is null or char_length(p_key) not between 10 and 256
    or p_limit is null or p_limit not between 1 and 10000
    or p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'Invalid rate limit configuration' using errcode = '22023';
  end if;

  insert into public.contact_rate_limits as limits (key, window_started_at, request_count, updated_at)
  values (p_key, current_time_at, 1, current_time_at)
  on conflict (key) do update set
    request_count = case
      when limits.window_started_at <= current_time_at - make_interval(secs => p_window_seconds) then 1
      else least(limits.request_count + 1, p_limit + 1)
    end,
    window_started_at = case
      when limits.window_started_at <= current_time_at - make_interval(secs => p_window_seconds) then current_time_at
      else limits.window_started_at
    end,
    updated_at = current_time_at
  returning request_count, window_started_at into consumed, window_start;

  allowed := consumed <= p_limit;
  retry_after := case when allowed then 0 else greatest(1,
    ceil(extract(epoch from window_start + make_interval(secs => p_window_seconds) - current_time_at))::integer)
  end;
  return next;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text, integer, integer) to service_role;

comment on table public.contact_rate_limits is 'HMAC throttle keys only; no raw IP addresses. Expired rows may be removed after 48 hours.';
comment on table public.contact_messages is 'Private inbound messages, submitted only through the validated server route.';
comment on column public.projects.updated_at is 'Repository update time from GitHub, distinct from content modified_at.';

commit;
