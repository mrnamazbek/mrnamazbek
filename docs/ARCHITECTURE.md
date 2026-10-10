# Portfolio architecture

The live site is one Next.js App Router application on Vercel, with PostgreSQL in Supabase's Frankfurt region. There is no Neon dependency. Next.js server components render the public pages; small client components handle navigation, themes, filters, forms, animation, and lab tools. Next.js Route Handlers provide the backend.

## Where to add features

| Directory | Responsibility |
| --- | --- |
| `src/app` | Pages, route metadata, errors, and API endpoints |
| `src/components/layout` | Shared navigation and footer |
| `src/components/ui` | Reusable visual primitives and motion |
| `src/components/content`, `home`, `lab` | Feature-specific components and interactive tools |
| `src/lib/content` | Validated content reads and local fallback |
| `src/lib/server` | Contact validation, throttling, and GitHub integration |
| `src/lib/supabase` | Server-only database client construction |
| `src/types` | Content contracts independent of database row names |
| `src/content` | Versioned public content and fallback snapshots |
| `supabase` | SQL migrations, seed, and database policy tests |
| `tests/unit`, `tests/e2e` | Backend contracts and browser flows |

Add a personal page as `src/app/<name>/page.tsx`, exporting its metadata and composing existing UI primitives. Add its link to `src/components/layout/site-header.tsx` and its URL to `src/app/sitemap.ts`. Read content through the repository rather than calling Supabase from a browser component. Keep browser interaction in a small component with `"use client"`.

For a new content type, define its TypeScript contract and Zod schema, add a separate SQL migration with Row Level Security, add its published-only repository reader, and supply a versioned fallback if appropriate. Do not rewrite an already-applied migration. New editorial records default to drafts; `position` controls collection order. Supabase's Table Editor is the current content editing interface.

## Data and backend boundaries

Public content is selected using the Supabase publishable key under database policies. Keys remain on the server. Privileged contact writes use a separate server secret. Neither private contact table grants access to anonymous or authenticated browser roles. See [DATA.md](DATA.md) for schema, editing, and feed refresh details.

`POST /api/contact` accepts a name, email, message, and empty honeypot. It checks origin, body size, field lengths, and durable database quotas before storing the message. A success means the message is in Supabase; it does not mean an email was delivered. Review messages in the private `contact_messages` table. Database failures return an honest unavailable response with an email fallback in the form.

`GET /api/github?category=<name>` queries a fixed GitHub endpoint and caches validated public, non-fork repositories for an hour. It does not accept arbitrary upstream URLs. `GET /api/health` reports application liveness only. Content reads validate database payloads and fall back to checked-in public content on an outage; a successful empty collection remains empty. Server reads use an eight-second timeout, so outages do not leave pages waiting indefinitely.

`GET /api/signals` validates and caches the original currency and weather providers on the server, preserves their timestamps, and retains successful sources when another provider fails. The browser calls this same-origin endpoint. Public career examples and the existing private-workspace link remain on `/about`; the portfolio does not fetch that private workspace. Legacy single-page bookmarks redirect to the corresponding new pages.

## Presentation

The design uses shared color, spacing, and typography tokens in `src/app/globals.css`. Theme preference persists locally. CSS and IntersectionObserver handle reveal effects. The desktop hero loads the owner's DDCNB robot and Spline runtime only when needed; mobile, reduced-motion, unsupported WebGL and load failures receive small local posters of the same model. Manual pointer-driven rendering supports pause and stops off-screen or in hidden tabs. The original particle torus remains a separate reusable component. No browser needs a 3D scene to navigate or read content. Project exploration, native capabilities disclosures and magnetic actions live in separate typed components with scoped CSS.

Personal social links use `SocialProfileLink` for a small hover/focus preview. Touch visitors tap once to preview and again to open the original link. Escape or tapping outside dismisses it; cards stay inside the viewport and respect reduced motion. Saved public profile details live in `src/content/social-profiles.ts`; update that catalog and the published images in `assets/social` when a profile changes. The LinkedIn card uses the site's identity monogram. These are curated previews, without live follower counts, authenticated embeds, third-party scripts, or browser requests to social platforms. Profile links still work as ordinary links without JavaScript.

The lab preserves the existing practical tools as isolated components. Regex work runs in a disposable worker with a timeout; generated Docker configuration and Airflow code download locally. Cost estimates are labeled illustrative and can be adjusted. External trend datasets show their capture dates and methodology.

## Development and deployment

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, and fill in the selected project's values. `npm run dev` starts development. `npm run check` validates code and unit contracts; `npm run build` followed by `npm run test:e2e` exercises the production app. Environment files and build output are ignored by Git.

Vercel project: `namazbek-portfolio`, under `namazbeks-projects`. Supabase project: `namazbek-portfolio`, reference `dzhocayirqikadcysunr`. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `SITE_URL` for production. Keep the secret typed as a sensitive environment variable. Give previews their own database or explicitly chosen credentials. `vercel.json` selects Next.js and Frankfurt functions near the database.

For a release, build and test locally, create a production deployment with `vercel deploy --prod --skip-domain`, verify its pages, APIs, and database behavior, then promote that exact deployment. CLI deployment works independently of Git integration. For automatic releases, connect this repository in Vercel and select the desired production branch. The GitHub profile README and legacy static source remain in the repository for history; Vercel serves only the Next.js application.

After adding a custom domain, update `SITE_URL` in Vercel and redeploy so social previews and the sitemap use the canonical origin. The contact handler supports `CONTACT_ALLOWED_ORIGINS` for explicitly allowed additional origins.
