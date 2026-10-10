# Content and Supabase

The site reads published content through server components using `src/lib/content`. Components depend on domain types from `src/types/content.ts`, rather than database rows. Supabase keys and queries stay in server-only modules.

## Local content

The checked-in JSON files under `src/content` are a deterministic public fallback when Supabase is unconfigured, unavailable, or returns invalid content. Zod validates both local and database content. A successful database query returning an empty collection is respected; removing all published articles does not resurrect them from the fallback. `getSiteContent()` includes `source` and a per-section `sources` map so monitoring can distinguish local, Supabase, and mixed reads. Content reads disable repeated retries and use the server client's request timeout, so an unavailable database can fall back promptly. Expected database failures are logged without credentials or query payloads.

The profile, six roles, three education records (including the planned TUM goal), eleven certifications, seven skill groups, six books, and three complete articles were migrated from the original site. The original article text and February trend notes are also preserved under `src/content/articles`. `posts.json` contains the rendered article source, with unavailable original hero images set to `null`. Edit the JSON content used by the fallback, then run `npm run db:seed:generate` to validate it and regenerate the corresponding SQL seed. This command writes SQL locally and does not apply it to a database.

The project catalog contains 24 original public repositories verified through the GitHub API on 10 October 2026. Forks and archived repositories were excluded. Stars and forks are captured statistics, not live activity. The legacy `mock_repos.json` is not used by the new content repository.

External datasets retain their original keys and source metadata under `src/content/snapshots`. Keep the ranking's `as_of`, each feature's `month` and `captured_at`, and the audience's methodology visible. Wikimedia page views are an audience proxy, not active users. The empty Telegram snapshot remains empty rather than inventing posts. These dated snapshots continue to work if upstream services are down.

## Scheduled feed synchronization

The existing Python exporters still write `assets/*.json`. `npm run content:sync` validates the six known feed files and atomically replaces their matching local copies in `src/content/snapshots`. It performs no database writes, even when Supabase credentials are configured. The build calls this local-only command before bundling the site, so generated feeds cannot leave the fallback copies stale. The two `feature:monthly` commands also synchronize their selected local snapshots after generation.

To also update Supabase, explicitly run `npm run content:sync:database`. This command reads `.env.local` when present, requires server credentials, and upserts only the `content_snapshots` table. An upload failure exits unsuccessfully and never claims the database was updated. Validation of every selected file happens before any local copy or database write. Original JSON fields are retained, including provenance fields that future exporters add.

Each scheduled exporter should select its own feeds with `--only`, preventing another workflow's older checkout from overwriting a newer database snapshot:

| Exporter | Scoped synchronization |
| --- | --- |
| Monthly feature | `npm run content:sync -- --only=monthlyFeature,featureHistory` |
| Weekly audience | `npm run content:sync -- --only=audience` |
| DB rankings | `npm run content:sync -- --only=rankings` |
| Telegram | `npm run content:sync -- --only=telegram` |
| Keyword updates | `npm run content:sync -- --only=keywords` |

Use `content:sync:database` instead of `content:sync` for an explicitly configured scheduled database upload. Configure `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or the legacy service-role alias) in the workflow's repository secrets; never echo them. Commit both the exported asset and its matching checked-in snapshot file. The catalog in `src/lib/content/snapshot-catalog.ts` is the single allowlist shared by reads and synchronization. The feature schema accepts all three generator variants: impact estimator, tradeoff matrix, and roadmap planner. Telegram timestamps and view counts remain nullable when its public export lacks that metadata. The feed importer never writes profile, book, project, certification, or article tables.

Editorial article changes use a separate flow: `src/content/posts.json` is the new checked-in article source, while `blog/*.md` and `src/content/articles/*.md` preserve the original manuscripts and demo context. Editing an archived manuscript alone does not republish an article. Update the corresponding JSON article or its Supabase `posts` row, then regenerate a reviewed seed only if you intend to change that database record. All three migrated bodies match the original Markdown exactly; their links are absolute and their missing hero images remain `null`, so `/writing` introduces no relative image or download paths to repair.

## Schema and initialization

Apply `supabase/migrations/20261010000000_portfolio.sql`, then `supabase/seed.sql`, to the selected Supabase project. Use the Supabase SQL editor or the CLI linked to that project. The migration is a first-time schema migration. The seed is idempotent: it updates its matching public-content IDs and does not delete added rows or modify private messages. Review the target project before applying a seed to avoid overwriting later editorial changes.

Content lives in separate profile, experience, education, certification, skill, project, book, and article tables. Heterogeneous external feeds live in `content_snapshots` with a stable key and original JSON payload. New editorial records are drafts by default (`published = false`). Collections use `position` for ordering; articles are displayed by publication date. `modified_at` tracks editorial edits separately from repository update times.

All tables enable Row Level Security. Anonymous and authenticated roles receive SELECT only for published content, with no content-write grant. Contact messages and rate-limit keys receive no browser-role grants or policies. Explicit grants also work when automatic table exposure is disabled. These controls follow [Supabase's RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) and [server-key guidance](https://supabase.com/docs/guides/database/secure-data).

Copy `.env.example` to `.env.local` and provide the project's URL, publishable key, and server secret key. Legacy anon and service-role aliases are supported by the server client. Never expose the privileged key through a `NEXT_PUBLIC_` variable or commit an environment file. Configure the same server variables in Vercel for the production and preview environments that should use this database.

## Contact writes and maintenance

The validated contact route writes `contact_messages` with a server credential and calls `consume_contact_rate_limit(p_key, p_limit, p_window_seconds)`. This RPC returns one `{ allowed, retry_after }` row. Each fixed-window quota is consumed atomically in PostgreSQL, including requests handled by different Vercel instances. HMAC keys are stored instead of raw IP addresses. Only the server role can execute the RPC.

Periodically remove old throttle records through trusted database maintenance:

```sql
delete from public.contact_rate_limits
where updated_at < now() - interval '48 hours';
```

Apply the contact-message retention period appropriate for the site's inbox. There is no automatic message deletion or outbound notification in this migration.

## Verification

`supabase/tests/portfolio_rls.test.sql` checks content visibility, draft privacy, write denial, private contacts, RPC access, quota enforcement, retry times, and window reset. Run it with `supabase test db` against a local Supabase instance after applying the migration and seed. The test rolls back its fixture records. The project's TypeScript/build checks validate the checked-in content schema and server repository.
