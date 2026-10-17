# Portfolio architecture

The live site is one Next.js App Router application on Vercel, with PostgreSQL in Supabase's Frankfurt region. There is no Neon dependency. Next.js server components render the public pages; small client components handle navigation, themes, filters, forms, animation, and lab tools. Next.js Route Handlers provide the backend.

## Where to add features

| Directory | Responsibility |
| --- | --- |
| `src/app` | Shared document metadata, APIs, sitemap, and global error recovery |
| `src/app/(classic)` | Classic pages and chrome at the original public URLs |
| `src/app/v2` | Liquid Glass pages and their own layout/error boundaries at `/v2` |
| `src/app/studio`, `src/features/studio` | Founder’s Engineering Lab preview routes, local workbenches, and their isolated scene/scroll runtime |
| `src/components/liquid-glass` | Scoped glass shell, optical surfaces, collections, and original 3D sculpture |
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

Add a Classic page as `src/app/(classic)/<name>/page.tsx`; the route group keeps its public URL at `/<name>` and supplies `ClassicFrame`. Add its navigation link to `src/components/layout/site-header.tsx` and its indexed URL to `src/app/sitemap.ts`. Add the glass counterpart as `src/app/v2/<name>/page.tsx`, using `GlassSurface` and a scoped CSS module, then link it in `src/components/liquid-glass/shell.tsx`. New pages should export metadata and compose existing feature components.

The root layout supplies only the shared document and scroll enhancement. Keep edition-specific chrome inside the relevant layout. V2 currently uses canonical links to its Classic counterparts and `noindex, follow` while the designs coexist; do not add duplicate V2 URLs to the sitemap without deliberately changing that indexing policy. Edition-switch links are native anchors so each design starts with its own document; navigation inside an edition uses Next links.

Read content through `src/lib/content` rather than calling Supabase from a browser component. Both editions share these readers, schemas, approved photos, and API routes. Keep browser interaction in a small component with `"use client"`; keep independent server reads parallel.

For a new content type, define its TypeScript contract and Zod schema, add a separate SQL migration with Row Level Security, add its published-only repository reader, and supply a versioned fallback if appropriate. Do not rewrite an already-applied migration. New editorial records default to drafts; `position` controls collection order. Supabase's Table Editor is the current content editing interface.

## Data and backend boundaries

Public content is selected using the Supabase publishable key under database policies. Keys remain on the server. Privileged contact writes use a separate server secret. Neither private contact table grants access to anonymous or authenticated browser roles. See [DATA.md](DATA.md) for schema, editing, and feed refresh details.

`POST /api/contact` accepts a name, email, message, and empty honeypot. It checks origin, body size, field lengths, and durable database quotas before storing the message. A success means the message is in Supabase; it does not mean an email was delivered. Review messages in the private `contact_messages` table. Database failures return an honest unavailable response with an email fallback in the form.

`GET /api/github?category=<name>` queries a fixed GitHub endpoint and caches validated public, non-fork repositories for an hour. It does not accept arbitrary upstream URLs. `GET /api/health` reports application liveness only. Content reads validate database payloads and fall back to checked-in public content on an outage; a successful empty collection remains empty. Server reads use an eight-second timeout, so outages do not leave pages waiting indefinitely.

`GET /api/signals` validates and caches the original currency and weather providers on the server, preserves their timestamps, and retains successful sources when another provider fails. The browser calls this same-origin endpoint. Public career examples and the existing private-workspace link remain on `/about`; the portfolio does not fetch that private workspace. Legacy single-page bookmarks redirect to the corresponding new pages.

## Presentation

The Classic design uses shared color, spacing, and typography tokens in `src/app/globals.css`. Theme preference persists locally. CSS and IntersectionObserver handle reveal effects. The desktop hero loads the owner's DDCNB robot and Spline runtime only when needed; mobile, reduced-motion, unsupported WebGL and load failures receive small local posters of the same model. Manual pointer-driven rendering supports pause and stops off-screen or in hidden tabs. The original particle torus remains a separate reusable component. No browser needs a 3D scene to navigate or read content. Project exploration, native capabilities disclosures and magnetic actions live in separate typed components with scoped CSS.

Personal social links use `SocialProfileLink` for a small hover/focus preview. Touch visitors tap once to preview and again to open the original link. Escape or tapping outside dismisses it; cards stay inside the viewport and respect reduced motion. Saved public profile details live in `src/content/social-profiles.ts`; update that catalog and the published images in `assets/social` when a profile changes. The LinkedIn card uses the approved formal portrait. These are curated previews, without live follower counts, authenticated embeds, third-party scripts, or browser requests to social platforms. Profile links still work as ordinary links without JavaScript.

The Liquid Glass edition uses scoped `--lg-*`/`--v2-*` tokens, reusable `GlassSurface` primitives, and its own `nb-glass-theme` preference; Classic uses `nb-theme`. The pinned Liqui Design kernel enhances small navigation and filter controls with real refraction in Chromium. Readable frosted content panels and browser fallbacks retain the same hierarchy. Reduced transparency and forced colors use solid surfaces. The original Three.js glass sculpture imports its renderer only for eligible visible desktop visitors, bounds pixel and frame budgets, renders on demand, and disposes GPU resources and subscriptions on unmount. Mobile, reduced motion, and GPU failures retain an inline poster. Source studies, libraries actually shipped, and model candidates are documented in [LIQUID_GLASS_RESEARCH.md](LIQUID_GLASS_RESEARCH.md).

`src/components/lab/lab-content.tsx` composes the same Lab data and tools for both editions. The contact form also remains shared: pending and failed submissions preserve the visitor’s message, confirmed success clears it, and controls remain disabled until hydration. Without JavaScript, the form offers a direct email link instead of a native GET submission.

The lab preserves the existing practical tools as isolated components. Regex work runs in a disposable worker with a timeout; generated Docker configuration and Airflow code download locally. Cost estimates are labeled illustrative and can be adjusted. External trend datasets show their capture dates and methodology.

## Founder’s Engineering Lab preview

`/studio` is a separate, English editorial preview with four chapters, six workbenches at `/studio/modules/[slug]`, and `/studio/connect`. These pages use self-canonical metadata and `noindex, follow`; they are absent from the sitemap. Unknown slugs and unmatched Studio addresses use Studio’s own recovery surface. Classic `/` and V2 `/v2` retain their own layouts. Studio has not been promoted to the root route.

The Server layout reads the approved profile through `getProfile`. `StudioShell` mounts one persistent `SceneHost` before the header and main content. `StudioRuntime` provides stable mutable scene signals and a shared velocity MotionValue. Its conditional `ReactLenis` is a sibling of the route content, so changing motion policy does not unmount a workbench or a contact draft. The shared root scroll controller skips the exact Studio namespace. Eligible desktop visitors get one owned GSAP ticker/Lenis bridge; coarse pointers, reduced motion, forced colors and hidden pages use native scrolling. Effects remove their own listeners, observers and ticker callbacks rather than modifying unrelated animation owners.

Landing-only ScrollTrigger and ResizeObserver instances follow story geometry, including a resized live preview. The header observes a viewport-height-derived pixel band and refreshes its observer on resize and story mount. Explicit chapter links from nested routes record one allowlisted destination, then use native `scrollIntoView` and focus the section with `preventScroll`. This intent is consumed once and cancelled by unrelated navigation, history and unmount. Browser Back/Forward behavior remains native: fragment entries return to the fragment destination, while ordinary entries restore the prior reading position.

The scene is original procedural geometry: a bounded transmission torus, matte plates and 32 instanced points. It uses one R3F canvas, demand rendering, DPR capped at 1.5, and a 256-pixel/four-sample transmission buffer. It imports no model, HDR, Spline export or network font. R3F owns the renderer, geometry and materials; Drei disposes its transmission render targets. Continuous pose/pointer/scroll work uses refs, MotionValues and existing vectors, without React state updates on each frame. The passive `canvas.__studioDiagnostics` snapshot counts all renderer passes and schedules no work. Settled scenes stop requesting frames; hidden mode permits at most one already queued frame to drain. A separate opt-in profiling build exposes commit counts; the normal build excludes that hook.

The owned SVG poster and semantic copy remain readable before enhancement and under reduced motion, forced colors, coarse touch, JavaScript denial or GPU failure. Context loss offers an in-place visual retry that preserves the contact draft. A rejected workbench chunk requires an explicitly labelled page reload and warns that reloading clears edits held in memory. A rejected scene chunk offers an explicitly labelled page reload to retry the visual. There is no automatic draft-clearing reload. Studio deliberately has no segment `loading.tsx`: the automatic streaming boundary hid the completed story without JavaScript. Scene and workbench loading/error fallbacks remain local to those enhancements.

The data-only registry has exactly six entries, each with a server-rendered read-only initial fixture. A separate literal lazy import map loads only the selected workbench; the matrix mounts at most one selected preview. Pure domain/fixture modules contain no React, graphics, storage or transport dependencies. Policy Workflow evaluates LAB-credit rules with deterministic identifiers; Data Explorer searches 19 invented notes and nine fictional roles; Architecture Inspector contains a fixed DAG, illustrative stage details, stack catalog and comparison table; Interface Lab holds scoped appearance, resilience and motion samples; Locale Inspector changes only an `en`/`ru`/`kk` sample and its preview metadata; Form Workbench manually advances synthetic validation and response fixtures. All demo data stays in memory. Unhydrated or failed enhancements leave the initial fixture and ordinary links available, with no editable fallback form or native query submission.

Studio’s real connect page reuses `src/components/contact-form.tsx` byte for byte. Its terminal accepts only help, clear and three enum intents; invalid/repeated query intents resolve to general contact. The selected intent appears in explanatory copy and never changes the four-field API payload. Local Form Workbench remains separate and makes no request or storage call. Real contact tests intercept the request before navigation; a success means saved in the existing destination store, never emailed. Ventures are explicitly unvalidated hypotheses. Source commerce placeholders and historical analytics/auth/CMS plans are excluded.

Release evidence and device limitations are recorded in [the Studio verification report](superpowers/reports/2026-10-17-founders-engineering-lab-verification.md). `scripts/measure-studio.mjs` requires a reachable Studio page and records the named GPU/browser, raw trace, frame samples, renderer counts, idle behavior and independently gzipped script accounting. Software renderer lifecycle evidence and mobile emulation are not physical device performance certification.

## Development and deployment

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, and fill in the selected project's values. `npm run dev` starts development. `npm run check` validates code and unit contracts; `npm run build` followed by `npm run test:e2e` exercises the production app. Environment files and build output are ignored by Git.

Vercel project: `namazbek-portfolio`, under `namazbeks-projects`. Supabase project: `namazbek-portfolio`, reference `dzhocayirqikadcysunr`. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `SITE_URL` for production. Keep the secret typed as a sensitive environment variable. Give previews their own database or explicitly chosen credentials. `vercel.json` selects Next.js and Frankfurt functions near the database.

For a release, build and test locally, create a production deployment with `vercel deploy --prod --skip-domain`, verify its pages, APIs, and database behavior, then promote that exact deployment. CLI deployment works independently of Git integration. For automatic releases, connect this repository in Vercel and select the desired production branch. The GitHub profile README and legacy static source remain in the repository for history; Vercel serves only the Next.js application.

After adding a custom domain, update `SITE_URL` in Vercel and redeploy so social previews and the sitemap use the canonical origin. The contact handler supports `CONTACT_ALLOWED_ORIGINS` for explicitly allowed additional origins.
