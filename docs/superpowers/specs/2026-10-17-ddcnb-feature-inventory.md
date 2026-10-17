# Founder’s Engineering Lab — legacy feature inventory

Date: 2026-10-17. Status: audit complete; implementation and runtime verification not started.

## Ownership, authority and evidence

- Role: Subagent 1, Legacy Repository Auditor.
- Objective: account for the entire authored application tree and retained experiments, distinguish implemented behavior from claims, and identify safe interactive capabilities for a personal engineering showcase.
- Owned document: `docs/superpowers/specs/2026-10-17-ddcnb-feature-inventory.md` in the portfolio repository. No other file is owned or changed by this role.
- Source: `/Users/namazbekbekzhanov/AntigravityProjects/ddcnb_site`, branch `develop`, HEAD `86d7ff363f4cef953c2a1b2e8392ff388db80733`. Source worktree was clean at inspection. The source checkout was not altered.
- Destination: `/Users/namazbekbekzhanov/AntigravityProjects/my_personal_website`, branch `main` at dispatch.
- Required source reading was completed in order: `AGENTS.md`, `DESIGN_SYSTEM.md`, `design-system/ddcnb-website/MASTER.md`, `docs/agents/AGENT_DESIGN_CONTRACT.md`, `docs/agents/MCP_USAGE.md`, `docs/agents/AGENT_HANDOFF.md`, then implementation. This is a static audit, not a UI change; no design-research service or other external API was called.
- Validation: file/route enumeration, static import reachability, behavior and handler inspection, locale key-set comparison, test/config inspection, tracked versus physical asset enumeration, source status checks, and an independent supporting read-only API/assets review. No build, development server, tests, crawler, old scripts, integration calls, installation, commit, push or deployment was run.
- Evidence notation: every `source/path:line` below is relative to the exact source checkout and immutable HEAD above. Line anchors identify the relevant implementation entry; they do not establish a successful live execution.

“Implemented local” means a concrete local handler/rendering path exists in source. “Remote adapter” means source can call a real service, whose configuration, availability and delivery were not exercised. “Simulation” means local state/timers or authored illustrations, not operational infrastructure. Proposed public widgets are specifications only.

## Verified scope and counts

| Item | Count / finding |
| --- | --- |
| Authored application TS/TSX | 107 files across `app`, `components`, `lib`, `i18n` |
| Page templates | 13, shared across three supported locales; 39 intended locale page URLs |
| Shared layouts / error surfaces | 3 layouts, 2 segment error boundaries, 1 root not-found component |
| API route | 1: `POST /api/contact` |
| Unlinked static HTML experiments | 2, directly addressable from `public/` |
| Components | 77 files: 76 TSX and 1 TS hook; 4 layout, 19 section, 9 motion, 5 theme, 2 Three, 38 UI |
| Translation catalogs | 3; each has 31 namespaces / 684 leaf messages; key sets match |
| Local news / fallback vacancies | 19 manually curated news records / 9 fallback roles |
| Authored browser test files | 12 retained; active Playwright configuration selects only 2 |
| Unit test files | 1, containing 4 source-contract tests |
| Tracked public assets | 118; 125 physical files were present, including local/ignored artifacts |
| Retained extracted files | 55 tracked files; historical source evidence/tooling, not live routes |

The substantive application is a public multilingual content site with sophisticated local motion, a policy simulator, searchable local news, an optional contact-delivery adapter, and a remote vacancies adapter. There is no implemented analytics product, transaction-processing system, procurement product, authentication system, application database, CMS, CV upload or document export. Technology names, service claims, metrics and security certifications in content are not proof that those systems are implemented in this repository.

## Complete route inventory

The route group `(marketing)` adds no URL segment. `L` means one of `ru`, `kz`, `en`; all three explicit URLs are listed to remove ambiguity. “Primary” refers to actual navigation wiring, not inferred importance.

| Route ID | Complete supported URLs | Source entry | Reachability and implementation | Feature IDs |
| --- | --- | --- | --- | --- |
| R00 | `/` | `proxy.ts:48`, `i18n/routing.ts:3` | Locale-negotiating entry through next-intl; configured fallback is Russian. Cookie/browser negotiation can select another supported locale. No independent root page. | F01 |
| R01 | `/ru`, `/kz`, `/en` | `app/[locale]/(marketing)/page.tsx:37` | Primary navigation. Hero → particle/stat story → six-service grid → 15-tile showcase → stack catalog → summary → CTA. Heavy sections are deferred. | F08–F15 |
| R02 | `/ru/about`, `/kz/about`, `/en/about` | `app/[locale]/(marketing)/about/page.tsx:27` | Primary navigation. Mission/model viewer, founder/values content, career CTA, ecosystem, event gallery, timeline, leadership. | F16–F22 |
| R03 | `/ru/services`, `/kz/services`, `/en/services` | `app/[locale]/(marketing)/services/page.tsx:1` | Primary navigation. Five-service sticky selector and authored SVG illustrations; no service-operation backend. | F23–F28 |
| R04 | `/ru/mission`, `/kz/mission`, `/en/mission` | `app/[locale]/(marketing)/mission/page.tsx:161` | Primary navigation. Four illustrated steps with scroll-growing spine. | F29 |
| R05 | `/ru/news`, `/kz/news`, `/en/news` | `app/[locale]/(marketing)/news/page.tsx:33` | Primary navigation. Local archive, filter/search/pagination and outbound source links, preceded by CSS 3D cube intro. | F33–F34 |
| R06 | `/ru/careers`, `/kz/careers`, `/en/careers` | `app/[locale]/(marketing)/careers/page.tsx:196` | Primary navigation; also about/CTA links. Real server vacancies adapter with local fallback; applications leave the site. | F35–F36 |
| R07 | `/ru/contact`, `/kz/contact`, `/en/contact` | `app/[locale]/(marketing)/contact/page.tsx:36` | Primary navigation. Validated form, local API request, explicit delivery/fallback/error states, office map and contact links. | F37–F38, F48 |
| R08 | `/ru/security`, `/kz/security`, `/en/security` | `app/[locale]/(marketing)/security/page.tsx:10` | Footer reachable; three privacy/terms/security labels all point here. Six static pillars/certification claims; no separate privacy or terms documents. | F32 |
| R09 | `/ru/digital`, `/kz/digital`, `/en/digital` | `app/[locale]/(marketing)/digital/page.tsx:11` | Routable, outside primary menu. Home showcase references bare `/digital`, whose locale wiring is defective; direct supported URLs are the reliable source route targets. Static architecture/table plus client simulation. | F30–F31 |
| R10 | `/ru/faq`, `/kz/faq`, `/en/faq` | `app/[locale]/(marketing)/faq/page.tsx:19` | Direct URL/test reachable; no incoming application navigation found. Six-question local accordion. | F39 |
| R11 | `/ru/ui-lab`, `/kz/ui-lab`, `/en/ui-lab` | `app/[locale]/(marketing)/ui-lab/page.tsx:437` | Unlinked experiment, still publicly routable. English hardcoded lab content, source/status claims, local hover previews/canvas, Bezier editor and shared office map. No operational MCP connection. | F40–F42 |
| R12 | `/ru/test-mcp`, `/kz/test-mcp`, `/en/test-mcp` | `app/[locale]/(marketing)/test-mcp/page.tsx:18` | Unlinked experiment, publicly routable. Russian hardcoded bento and pricing mockup; CTA buttons have no action. | F43 |
| R13 | `/ru/ecommerce`, `/kz/ecommerce`, `/en/ecommerce` | `app/[locale]/(marketing)/ecommerce/page.tsx:16` | Unlinked English placeholder; no catalog/cart/checkout/commerce integration. | F44 |
| R14 | `POST /api/contact` | `app/api/contact/route.ts:113` | Locale-independent actual API; called by R07. No other authored methods/API routes found. | F48 |
| R15 | `/temp-animated-icons.html` | `public/temp-animated-icons.html:204` | Unlinked public static document with CSS/SVG hover animation; outside locale shell. | F46 |
| R16 | `/labs/center-lottie-prototype.html` | `public/labs/center-lottie-prototype.html:429` | Unlinked public static three-choice CSS/text prototype; name does not imply a live Lottie renderer. Outside locale shell. | F46 |
| R17 | Unmatched/invalid addresses | `app/not-found.tsx:31` | Root not-found UI, URL-derived locale fallback, home/back controls. Not an additional page template. Unsupported locale behavior is not asserted without execution. | F45 |

### Locale, layout and navigation qualifications

- `i18n/routing.ts:3` configures `kz`, `ru`, `en`, Russian fallback and a `NEXT_LOCALE` cookie. `i18n/request.ts:4` imports the matching local catalog and falls back for an unrecognized request locale. `i18n/navigation.ts:4` supplies locale-aware navigation.
- `proxy.ts:62` matches only `/` and `/(kz|ru|en)/:path*`; `next.config.ts:20` contains no redirect or rewrite table. No alias route for `/analytics`, `/contacts`, `/about-us`, `/privacy`, `/terms`, a post detail route, or an application route was found.
- `[locale]` is dynamic; there is no authored whitelist guard using `notFound()` or `generateStaticParams()` in its layout. The 39 URLs above enumerate intended supported pages, not a claim that arbitrary locale strings have been tested/rejected.
- `components/layout/Header.tsx:271` links only home/about/services/mission/news/careers/contact. Locale switching uses `router.replace(pathname, { locale })` at `:312`, preserving the logical pathname; query/hash preservation is not explicitly authored.
- `components/sections/Showcase.tsx:18` contains four `/analytics` destinations although no analytics page exists. Its renderer imports ordinary `next/link` at `components/ui/hero-parallax.tsx:12` and passes bare paths at `:299`; this also affects otherwise implemented digital/security/services/about/contact targets. Treat this as a static navigation defect, not a verified working journey.
- Footer `/services#procurement` has no matching services anchor (`components/layout/Footer.tsx:58`, `components/sections/ServicesStickyCards.tsx:76`). Contact office IDs are supplied by the map, not independent pages. Home `#services`, `#about`, `#stats`, about `#mission`, `#timeline`, `#leadership`, news `#news-results`, and careers `#jobs-list` are section targets.
- `app/layout.tsx:7` sets root HTML language to Russian. The locale layout adds a language-bearing wrapper, mapping `kz` to HTML language `kk`, and localized metadata at `app/[locale]/layout.tsx:24`. This is partial language handling; do not present it as a completed accessibility audit.
- `app/[locale]/layout.tsx:49` installs theme/background/icon/translation/accessibility/motion/navigation providers. Marketing layout at `app/[locale]/(marketing)/layout.tsx:15` installs scrolling, progress, skip link, header, main and footer. Marketing and services-specific error boundaries are at `app/[locale]/(marketing)/error.tsx:6` and `services/error.tsx:5`; their copy is English.

## Capability inventory and safe widget proposals

All proposals below must use a visible “Seeded demo” or “Local simulation” label next to interactive outputs. “New enhancement” identifies an interaction the legacy source does not have. No source institution/person labels, production addresses/recipients, social activity IDs, original metrics, private datasets, employer IDs or production URLs may enter demo fixtures.

Boundary codes: **B0** owns/recreates visual assets, synthetic text only, no network; **B1** deterministic browser-memory fixtures resettable by the visitor; **B2** browser preference storage only under new portfolio keys; **B3** demonstration adapter with local responses and no transport; **B4** excluded/recorded as historical or missing scope. No code/asset transfer is authorized by a capability row alone; see licensing section.

| Stable ID | Original page / source evidence | Concrete capability | Current maturity / limitation | Proposed safe interactive showcase | Sanitized data / boundary |
| --- | --- | --- | --- | --- | --- |
| F01 | All locale pages; `i18n/routing.ts:3`, `app/[locale]/layout.tsx:24` | Shared locale routes, catalogs, metadata and route-preserving locale change | Implemented local routing/content. Three key sets match; copy is not uniformly localized. | Locale/metadata inspector showing the same seeded content in three languages | Invented product copy; no source organization identity. B0/B2 |
| F02 | All; `components/layout/Header.tsx:214`, `components/layout/NavPreview.tsx:131`, `components/layout/Footer.tsx:29` | Scroll-aware header, active pill, hover preview, mobile overlay, portal language dropdown, multi-column footer | Implemented local. Header previews are pointer-triggered; source lab preview also responds to focus. | Compact navigation workbench with pointer, keyboard and mobile states | Generic section names and local anchors. B0/B1 |
| F03 | All; `components/theme/ThemeProvider.tsx:16`, `components/ui/cinematic-theme-switcher.tsx:45` | Dark/light theme and animated switch | Implemented local, defaults dark; next-themes manages preference | Theme preview with side-by-side tokens and reduced-motion option | Portfolio tokens and new preference key. B0/B2 |
| F04 | All; `components/theme/IconSystemProvider.tsx:21`, `BgSystemProvider.tsx:26`, `components/ui/Icon.tsx:279` | Icon set selection by query/local storage/random assignment; stored background palette; semantic icon registry | Implemented local experiment; background setter has no user-facing switch found. A/B assignment is not analytics/experimentation telemetry. | Explicit icon/palette comparator with deterministic selection | Locally bundled rights-cleared icons, no random assignment or external icon fetch. B0/B2 |
| F05 | All; `components/theme/AccessibilityProvider.tsx:77`, `components/ui/AccessibilityPanel.tsx:55`, `styles/a11y.css:1` | Low-vision panel: 100/125/150/200% text, three schemes, spacing, grayscale, serif, reset; focus containment/return; storage; reduced-motion signals | Implemented local controls. System-wide compliance is not established. | Accessibility state inspector applied only to the sample surface | Generic sample text; new scoped preferences; respect system motion. B0/B2 |
| F06 | All; `components/layout/SmoothScroll.tsx:87`, `components/motion/TransitionLink.tsx:18`, `lib/scrollStore.ts:108` | Desktop Lenis/GSAP coordination, native touch mode, hash scroll, navigation scroll restoration/progress | Implemented local. PageTransition now routes instantly, despite stale wipe-animation comments. | Scroll choreography bench with native/reduced motion and state readout | Synthetic sections. Reuse destination's single scroll owner; do not mount another global controller. B0/B1 |
| F07 | Home/about/scenes; `components/ui/LazyOnVisible.tsx:16`, `LottieAnimation.tsx:35`, `SceneLoader.tsx:12` | Deferred mounting, reserved space, viewport-driven media, loaders/fallbacks | Implemented local patterns; failures/runtime timing not exercised | Loading-state workbench with local ready/loading/failure controls | Owned small local assets; no remote fault injection. B0/B1 |
| F08 | Home; `components/sections/Hero.tsx:33`, `:261`, `components/ui/splite.tsx:121` | Interactive Spline character, cursor tracking and optional texture replacement; local CTA section scroll | Implemented visual integration, viewport/motion gating. Not a chatbot/agent. Mobile comment mentions a poster, but hero JSX merely omits the scene at `:260`. | New owned cursor-reactive object with explicit load/fallback states | New neutral object/texture. Spline export cannot be passed directly to R3F; use native runtime or a separately rights-cleared converted GLB. B0/B1 |
| F09 | Home; `components/ui/ShaderBackground.tsx:402` | Three-based shader and morphing particles with low-power quality, viewport suspension, theme palette | Implemented visual renderer. Source has separate shader/particle canvases, not a data feed. | Small isolated particle field with density/motion controls | Procedural points, seeded positions, no branded masks. B0/B1 |
| F10 | Home; `components/three/LogoParticleReveal.tsx:619`, `:1055` | Scroll-driven particle morph through authored mask/procedural targets, stat/story reveal and static fallback | Implemented local scene; four stat values are translated content, not live analytics or measured counters | Scroll-scrubbable engineering story with owned geometric targets | Fictional counts clearly labeled; no copied institutional statistics/emblems. B0/B1 |
| F11 | Home; `components/sections/Services.tsx:18` | Six responsive service cards with glass tilt/stagger/hover styling | Static content with local visual interaction; arrow/status decoration does not implement a service or click action | Capability-card interaction sampler; optional local detail panel is new enhancement | Generic engineering categories. B0/B1 |
| F12 | Home; `components/sections/Showcase.tsx:18`, `components/ui/hero-parallax.tsx:25` | 15-item, three-row horizontal/3D parallax gallery and plain accessibility grid | Implemented visual pattern; navigation defects described above | Local pattern gallery with validated local destinations | Owned icons and generic tile copy. B0/B1 |
| F13 | Home; `components/sections/Technologies.tsx:75` | Categorized technology catalog: 5 project tools, 10 platform tools, 20 development tools, plus 3 static highlight cards | Static catalog with reveal/hover motion; no running integrations with those technologies | Interactive stack explorer; selecting a category is new enhancement | Public technology names only; no employer capability claims. B0/B1 |
| F14 | Home; `components/sections/About.tsx:19` | Mission/identity summary, local illustration and value cards | Static content with Lottie/reveal motion | Short personally authored engineering-principles cards | New narrative and owned illustration, no institution identity. B0 |
| F15 | Home; `components/sections/CTA.tsx:17`, `:106`, `components/ui/PartnerMarquee.tsx:12` | Contact/careers local routing and ambient partner-label marquee | Implemented navigation/presentation; no partnership workflow | Local next-demo launcher with scrolling neutral capability labels | No partner logos or implied endorsements. B0/B1 |
| F16 | About; `about/page.tsx:115`, `components/three/scene/BaseModelViewer.tsx:218` | GLB viewer, constrained drag orbit, recolored materials, lazy load, visibility-paused rendering and error fallback | Implemented R3F/Three viewer using local GLB and DRACO directory. Not CAD editing/export. | Owned-object model inspector with drag and load-state display | Newly owned/cleared geometry; no source medallion/brand textures. B0/B1 |
| F17 | About; `about/page.tsx:122`, `:156`, `:183` | Founder attribution, three value cards and career CTA | Static institutional content plus navigation | Personal project context and design decision cards | Replace all institutional provenance/certification language with verifiable personal authorship. B0 |
| F18 | About; `components/sections/EcosystemMap.tsx:30`, `:42` | Six-node diagram with SVG connections and pointer-depth movement | Authored illustrative topology; no monitoring, graph query or live integration health | Generic system-context explorer with local selected-node details (new enhancement) | Hub plus six fictional services; no infrastructure topology. B0/B1 |
| F19 | About; `components/sections/DDCEventGallery.tsx:33`, `:78`, `:101`, `:299` | Seven-item responsive image fan/grid, hover expansion, keyboard activation, lightbox, previous/next, escape close, outbound source | Implemented local gallery; original imagery/text/links concern real people/events | Owned project-process gallery and accessible lightbox | Original synthetic/owned images and invented captions; remove social links. B0/B1 |
| F20 | About; `components/sections/Timeline.tsx:16`, `components/ui/timeline.tsx:82` | Six-event timeline with viewport-active cards and scroll-growing track | Static historical content, local scroll interaction; no editing/history database | Project milestone timeline with optional selected-event details | Fictional project chronology or independently verified personal milestones. B0/B1 |
| F21 | About; `components/sections/Leadership.tsx:110`, `:574`, `components/ui/LeaderProfileModal.tsx:32` | Organization hierarchy, profile cards, modal photos/roles/bios, source-profile link | Implemented local content UI, not people directory backend. Modal lacks an authored focus trap comparable to the accessibility panel. | Generic team-role hierarchy with anonymous role-detail modal | “Engineer A”, “Designer B”, neutral avatars, no people photos/bios/links. B0/B1 |
| F22 | About; `components/sections/Leadership.tsx:400` | Expand/collapse five strategic pillars in hierarchy | Implemented local accordion; original strategy statements are static source content | Expandable engineering principles beside generic role tree | Newly authored principles. B0/B1 |
| F23 | Services; `components/sections/ServicesStickyCards.tsx:20`, `:53`, `:61`, `:243` | Five-step scroll selection, hover/focus preview, click-to-scroll, progress track; linear mobile/reduced-motion layout | Implemented local. Desktop story is 500vh; not a backend service console. | Compact service-story selector with explicit step controls | Generic five-step service model, no operational claims. B0/B1 |
| F24 | Services step 1; `components/sections/ServiceAnimatedVisuals.tsx:73` | Animated contact-center/headset/message SVG | Illustration only; no chat, call routing, case queue or voice integration | Local support-flow animation; clicking stages is new enhancement | Invented stages, no support number or real enquiries. B0/B1 |
| F25 | Services step 2; `ServiceAnimatedVisuals.tsx:134` | Animated procurement/network/checkmark SVG | Illustration only; no tender list, bidder access, ordering or procurement integration | Local approval-story diagram with selected stage (new enhancement) | Fake request IDs; no tenders/vendor data. B0/B1 |
| F26 | Services step 3; `ServiceAnimatedVisuals.tsx:161` | Animated data-processing packets and connections | Illustration only; no ETL execution, SQL engine, dbt model, lakehouse or source data | Small deterministic packet-path animation; step selection is new enhancement | Fictional nodes and events. B0/B1 |
| F27 | Services step 4; `ServiceAnimatedVisuals.tsx:246` | Animated server-rack/cloud SVG | Illustration only; no host metrics, Kubernetes control or deployment interface | Local infrastructure diagram with illustrative node details (new enhancement) | Invented services/status, no production topology. B0/B1 |
| F28 | Services step 5; `ServiceAnimatedVisuals.tsx:274` | Animated radar/shield/network-warning SVG | Illustration only; no fraud detection, incident telemetry or threat processing | Local event classification sketch if separately planned as new logic | Deterministic fake events; no source security rules or claims. B0/B1 |
| F29 | Mission; `mission/page.tsx:21`, `:44`, `:139` | Four Lottie-backed alternating steps; measured-height spine follows scroll; terminal-grid background | Implemented local story presentation; no workflow execution | Four-step project lifecycle story with position marker | Personally authored steps and owned motion assets. B0/B1 |
| F30 | Digital; `digital/page.tsx:16`, `:72`, `:151` | Three architecture cards, horizontally scrollable comparison table with 5 rows / 3 option columns and explanatory text | Static educational copy; no DLT/network/offline-clearing implementation | Generic architecture tradeoff table; toggling criteria is new enhancement | Invented nonfinancial options or clearly hypothetical policy properties. B0/B1 |
| F31 | Digital; `components/sections/DigitalTengeSimulator.tsx:22`, `:61`, `:71`, `:89` | Three scenario presets, amount/category/recipient inputs, four timed phases, allow/deny result, generated hash/index | Local simulation only. Checks exact seeded recipient, allowed category and positive amount. Random 40-hex output is labeled SHA-256 by UI although it is not SHA-256. No wallet, chain, contract, consensus, SDK or payment exists. | Deterministic policy sandbox with allowed/denied cases and honest local receipt | Generic recipient IDs, amount in demo units, categories; fixed-seed receipt labeled simulation. B1 |
| F32 | Security; `security/page.tsx:29`, `:114` | Six security pillar cards and two certification badges | Static claims/content, no scanner, compliance checker or verified certification evidence | Engineering-controls explanation; optional local accordion is new enhancement | Newly authored explanatory controls; remove certification/class claims. B0/B1 |
| F33 | News; `news/page.tsx:25`, `:41`, `:55`, `:195`, `lib/news/linkedin.ts:23` | Case-normalized text search over title/summary/terms, four categories + all, result counts, 6-per-page paging, reset/empty state and outbound source links | Implemented local over 19 curated records; no remote feed/CMS/sync. Record titles/summaries stay source-language across locales. | Seeded engineering-note browser with the same search/filter/paging/empty-state mechanics | 19 invented notes with categories, generic dates and owned thumbnails; local detail modal replaces social links. B1 |
| F34 | News; `components/sections/NewsCubeIntro.tsx:181`, `:200`, `:250` | Scroll-driven CSS 3D image cubes, opening/closing copy transforms and static first-render/reduced-motion alternative | Implemented visual scene, 300svh story; no WebGL/data dashboard | Owned-image cube intro with scrub and motion toggle | Cleared abstract images, generic captions. B0/B1 |
| F35 | Careers; `careers/page.tsx:62`, `:141`, `:178`, `:400` | Cached server vacancy fetch, response-to-card mapping, localized salary/date/department/location/type, nine fallback roles, external apply links | Real remote adapter, one-hour revalidation; upstream title remains source-language. No local search/filter, applicant form, candidate storage or CV upload. Fallback provenance is not visibly distinguished in source cards. | Seeded role browser with visible source-mode/failure toggle and local detail panel; filters are new enhancement | Invented roles, dates and salary ranges; no employer ID, URLs or source salaries. B1/B3 |
| F36 | Careers; `careers/page.tsx:229`, `CareerCenterSection.tsx:29`, `CareerCenterConverge.tsx:115`, `CareerWhyUsPath.tsx:25` | Culture/value cards, responsive choice of converging desktop letter/card scene versus linear fallback; connected spotlight path | Implemented motion/content; no HR workflow or career assessment | Engineering-values animation selector with static accessible variant | Newly authored values and cleared Lottie assets. B0/B1 |
| F37 | Contact; `contact/page.tsx:41`, `:60`, `:76`, `:205` | Client form validation, field errors, submitting/disabled state, POST, success/reset, mail-fallback and error feedback | Implemented client workflow; delivery is conditional on F48. No attachment/consent/storage/history workflow found. | Form-state laboratory: preview validated payload and choose simulated success/unavailable/failure | Prefilled “Demo Person”, `demo@example.invalid`, “Demo Company”, synthetic message; never send, invoke mail client or log real input. B1/B3 |
| F38 | Contact/ui-lab; `components/ui/kazakhstan-map.tsx:140`, `:270`, `:475` | SVG outline/pins, hover/focus previews, office cards and outbound mapping links | Local map interaction; static office data, not geocoding/maps API, live location or geolocation | Local geographic pin explorer or new abstract region map | Generic Hub A/B, no original address/phone/map queries; detail opens locally. Geography/outline reuse still needs provenance. B0/B1 |
| F39 | FAQ; `faq/page.tsx:16`, `:27`, `:65` | Six localized questions, one open index or none, animated expand/collapse | Implemented local accordion. Button lacks authored `aria-expanded`/panel association. | Seeded engineering FAQ with robust accessible disclosure semantics | New project questions and answers. B0/B1 |
| F40 | UI lab; `ui-lab/page.tsx:47`, `:169`, `:229`, `:522` | Eight tool-source status cards, six pattern hypotheses, four metric cards, twelve tech marks | Static experiment/research claims. “Live now” and “Restart” are hardcoded strings, not live connection checks; no command palette, MCP execution or dashboard backend. | Curated pattern catalog with visibly static example status; category filtering is new enhancement | Generic tool categories and fixture statuses; remove original metrics and agent-session commentary. B0/B1 |
| F41 | UI lab; `ui-lab/page.tsx:236`, `:352` | Pointer-reactive 2D canvas dot field; hover/focus preview switching and section links | Implemented local visual/interaction experiment. Some animation paths continue requestAnimationFrame under reduced motion. | Self-contained cursor/preview interaction bench with pause/static alternative | Procedural dots, generic navigation, no source claims. B0/B1 |
| F42 | UI lab; `ui-lab/page.tsx:619`, `components/ui/BezierText.tsx:188`, `:234` | Editable multi-segment SVG text path; toggle edit mode, drag anchors/control points, moving text; props configure speed/type/color | Implemented local editor. Exported `controls` metadata does not create a settings UI; no save/export/clipboard exists. Pointer-only handles and SVG animation need accessible/static alternatives. | Bezier playground with reset and keyboard-editable controls; numeric panel/export would be new enhancements | Generic text and deterministic initial path; memory-only curve. B0/B1 |
| F43 | Test MCP; `test-mcp/page.tsx:19`, `:58`, `:193` | Four bento tiles, animated beams, three pricing cards and home link | Visual mockup. Pricing buttons have no handler/href; no checkout/subscription/auth. Its monitoring/ML/security copy describes no implemented backend. | Component states sampler; make CTA visibly inert or open local explanation | Fictional plan labels/prices explicitly marked sample. No transaction. B0/B1 |
| F44 | Ecommerce; `ecommerce/page.tsx:11`, `:16` | Single card with title/description/body and static metadata | Placeholder only, English across locales | Record in archive as placeholder; no commerce demo inferred | B4; any commerce capability requires separate new scope |
| F45 | Error surfaces; `app/not-found.tsx:31`, marketing `error.tsx:6`, services `error.tsx:5` | Locale-aware 404 home/back; generic error reset/home; service load retry without forced reload | Implemented recovery UI; not executed here; segment errors use English copy | Local state switcher for loading/empty/error/retry/recovered views | Synthetic errors with safe user copy; never leak stack/provider output. B0/B1 |
| F46 | Public HTML; `public/temp-animated-icons.html:204`, `public/labs/center-lottie-prototype.html:429` | SVG/CSS animated-icon prototype; three-choice local CSS/text composition prototype | Retained static experiments, publicly addressable; not source routes or production Lottie automation | Recreate selected micro-interactions as optional small samples | Owned SVG/text only; do not embed whole archived documents. B0/B1 |
| F47 | Plans/retained namespaces; `INTEGRATION_PLAN.md:30`, `FULL_PLAN.md:32`, `messages/en.json:915` | Mentions analytics/currency/inflation dashboard, MDX news, monetary simulator and past scene variants | Documentation/translation-only or removed scope. No analytics route, time-series chart, MDX CMS, central-bank model, authenticated console or active `variant=B` branch found. | Exclude from inherited capabilities; explicitly propose separately if desired | B4; no invented claim that legacy implemented these systems |
| F48 | API; `app/api/contact/route.ts:6`, `:26`, `:68`, `:87`, `:113` | Same-origin JSON API, declared-body-length check, server schema, optional honeypot, timed delivery via webhook or mail provider, explicit no-store responses | Real optional server adapter. A false/missing webhook result allows mail-provider attempt; a thrown webhook error exits with 502. Unconfigured delivery returns 503 fallback. No persistence, rate limiter or guaranteed provider delivery is implemented. | Local request-boundary inspector with predefined 400/403/413/415/422/502/503/200 examples; no server transport | Fake body/headers only; no secrets, outbound addresses or configurable URLs. B3 |

### Candidate public modules, without inherited institutional claims

These are capability groupings for the next storyboard role, not a route/implementation decision. Each F-ID has one primary grouping; shared primitives are indexed separately below.

| Candidate module | Primary source features | Visitor value and truthful framing |
| --- | --- | --- |
| Interface Systems | F01–F07, F45 | Change locale/theme/accessibility/loading/scroll states and inspect local UI behavior |
| Motion and Scene Engineering | F08–F10, F12, F16, F34, F41–F42, F46 | Manipulate owned geometry, particles, curves, scroll and pointer choreography; demonstrate graceful static alternatives |
| Product Story Patterns | F11, F13–F15, F17–F30, F32, F36, F39–F40, F43 | Explore reusable navigation, service stories, maps, hierarchies, timelines and disclosure patterns with fictional content |
| Data Interaction Patterns | F33, F35, F38 | Search/filter/page seeded notes; inspect role-source fallback and local pin details. Source roles/map do not imply original search/filter APIs. |
| Workflow State Machines | F31, F37, F48 | Run a visibly local policy simulation or form/adapter-state demonstration; no financial action or message delivery |
| Historical Exclusions | F44, F47 | Document placeholders/plans as exclusions; do not convert them into shipped-feature claims |

F38 is indexed primarily under Data Interaction Patterns; its mention in Product Story Patterns refers only to the map presentation pattern. All future live outputs must display fixture provenance and offer a reset. Avoid a fake operational dashboard whose numbers appear live.

## Complete reusable component and hook ledger

All 77 component files are assigned below. “Shared” means imported in the live application graph; “experiment” means reachable only through experimental pages; neither means every export is used. Static import traversal from all App Router entry files reaches every component file except `card-sticky.tsx`. The separately configured `i18n/request.ts` is reached through next-intl configuration rather than a direct application import. This graph is not a tree-shaking or browser-bundle measurement.

| Component files (relative to `components/`) | Main owner feature / role and evidence |
| --- | --- |
| `layout/Header.tsx`, `layout/NavPreview.tsx`, `layout/Footer.tsx` | F02; navigation/hover preview/footer. Entries `Header.tsx:214`, `NavPreview.tsx:131`, `Footer.tsx:158` |
| `layout/SmoothScroll.tsx` | F06; Lenis/GSAP lifecycle, native modes, restoration; `:14` |
| `sections/Hero.tsx` | F08; hero orchestration/CTAs; `:33` |
| `sections/Services.tsx` | F11; six home cards; `:18` |
| `sections/Showcase.tsx` | F12; 15 gallery definitions; `:18` |
| `sections/Technologies.tsx` | F13; stack catalog; `:71` |
| `sections/About.tsx` | F14; home summary; `:19` |
| `sections/CTA.tsx` | F15; contact/career CTA; `:17` |
| `sections/EcosystemMap.tsx` | F18; illustrative six-node topology; `:42` |
| `sections/DDCEventGallery.tsx` | F19; responsive gallery/lightbox; `:78` |
| `sections/Timeline.tsx` | F20; six historical milestones; `:13` |
| `sections/Leadership.tsx` | F21/F22; hierarchy, profiles, pillars; `:110` |
| `sections/ServicesStickyCards.tsx` | F23; service selector/story; `:30` |
| `sections/ServiceAnimatedVisuals.tsx` | F24–F28; five SVG scene implementations and selector glyphs; `:73`, `:134`, `:161`, `:246`, `:274`, `:317` |
| `sections/PageIntro.tsx` | Shared intro composition used by F23/F29; `:19` |
| `sections/DigitalTengeSimulator.tsx` | F31; local policy simulation; `:43` |
| `sections/NewsCubeIntro.tsx` | F34; CSS cube story; `:250` |
| `sections/CareerCenterSection.tsx`, `sections/CareerCenterConverge.tsx`, `sections/CareerCultureValues.tsx`, `sections/CareerWhyUsPath.tsx` | F36; responsive culture scene selector, GSAP converge, linear values and spotlight path; `:29`, `:115`, `:28`, `:25` respectively |
| `motion/PageTransition.tsx`, `motion/TransitionLink.tsx`, `motion/ScrollProgress.tsx` | F06; immediate locale-aware navigation context/link and progress line; `:27`, `:15`, `:12` |
| `motion/MotionA11yConfig.tsx` | F05; shared Motion policy; `:30` |
| `motion/ScrollReveal.tsx`, `motion/AutoRevealingHeading.tsx`, `motion/RevealWords.tsx`, `motion/StaggerGroup.tsx` | Shared reveal presets, text splitting/stagger and reduced-motion/a11y paths; `:45`, `:22`, `:41`, `:28` |
| `motion/Magnetic.tsx` | Shared pointer attraction wrapper (hero/CTA); `:12` |
| `theme/ThemeProvider.tsx` | F03; dark/light provider; `:10` |
| `theme/IconSystemProvider.tsx`, `theme/BgSystemProvider.tsx` | F04; local/query-selected icon and background contexts; `:40`, `:31` |
| `theme/AccessibilityProvider.tsx` | F05; context/state/storage/classes/motion preference; `:77` |
| `theme/useScenePalette.ts` | F03/F09/F16; CSS variable readout and reactive palette hook; `:43`, `:90` |
| `three/LogoParticleReveal.tsx` | F10; vanilla Three particle scene/story; `:619`, `:1055` |
| `three/scene/BaseModelViewer.tsx` | F16; R3F GLB scene; `:218` |
| `ui/Button.tsx`, `ui/ShimmerButton.tsx`, `ui/liquid-glass-button.tsx` | Shared button variants, shimmer and hero MetalButton; `Button.tsx:14`, `ShimmerButton.tsx:18`, `liquid-glass-button.tsx:1` |
| `ui/GlassCard.tsx`, `ui/card.tsx`, `ui/Badge.tsx`, `ui/comet-card.tsx` | Shared glass/tilt, plain card, badge and pointer-perspective card; `:15`, `:1`, `:1`, `:29` respectively |
| `ui/Icon.tsx`, `ui/TechIcons.tsx`, `ui/AnimatedIcon.tsx`, `ui/DDCLogo.tsx` | F04/shared; semantic remote/local icon rendering, local SVGs, animation wrapper and institutional emblem. Icon entry `:279`; logo must be replaced |
| `ui/AccessibilityPanel.tsx` | F05; trigger/panel/options/focus management; `:18`, `:55` |
| `ui/cinematic-theme-switcher.tsx` | F03; switch with local particle feedback; `:16` |
| `ui/InteractiveDotGrid.tsx` | Shared background; name is stale: renders calm gradient div, no interactive canvas; `:6` |
| `ui/LazyOnVisible.tsx`, `ui/LottieAnimation.tsx`, `ui/SceneLoader.tsx` | F07; lazy mount, lazy/recolored/paused animation, loader/fallback; `:16`, `:23`, `:12` |
| `ui/ShaderBackground.tsx`, `ui/splite.tsx` | F09/F08; Three shader and native Spline wrapper; `:402`, `:121` |
| `ui/hero-parallax.tsx` | F12; parallax products and plain a11y grid; `:25` |
| `ui/3d-marquee.tsx`, `ui/PartnerMarquee.tsx` | Shared ambient image/label scrolling in footer/CTA; `:12`, `:12` |
| `ui/timeline.tsx`, `ui/LeaderProfileModal.tsx` | F20/F21; active milestone track and profile dialog; `:82`, `:32` |
| `ui/kazakhstan-map.tsx` | F38; SVG geographic outline, pins/previews/office cards; `:140` |
| `ui/BezierText.tsx` | F42; path editor, pointer handles, text animation; `:188` |
| `ui/BubbleText.tsx`, `ui/text-roll-hover.tsx`, `ui/text-stagger-hover.tsx`, `ui/typewriter-effect.tsx` | Shared hover text, rolling label, stagger split-text and typewriter components; `:15`, `:23`, `:119`, `:46` |
| `ui/animated-group.tsx`, `ui/TerminalGridBackground.tsx` | Shared reveal preset container and decorative grid; `:140`, `:26` |
| `ui/input.tsx`, `ui/textarea.tsx`, `ui/label.tsx` | F37; forwarded inputs, custom visual caret/field glow, textarea and label. Standard form fields, no authentication; `input.tsx:31`, `textarea.tsx:1`, `label.tsx:1` |
| `ui/bento-grid.tsx`, `ui/background-beams.tsx` | F43 experiment-only bento and decorative beams; `:3`, `:1` |
| `ui/card-sticky.tsx` | Dormant/unreferenced ContainerScroll/CardSticky utility; exported at `:76`. Retain as archive evidence, not a current feature |

### Support modules, style system and integration configuration

| Files | Actual responsibility / boundary |
| --- | --- |
| `lib/clientState.ts:17` | `useMounted`, `useMediaQuery`, `useDocumentClassFlag`, `useClientOnce`; hydration-safe client/environment reads, not server state |
| `lib/gsap.ts:1` | Shared GSAP/ScrollTrigger registration |
| `lib/scrollStore.ts:10` | Shared browser scroll/velocity/pointer-like scroll state and start/get functions, not telemetry transmission |
| `lib/utils.ts:1` | Class-name merge helper |
| `lib/mailto.ts:9` | URI-encoded local draft constructor; no email delivery |
| `lib/lottie/recolorBrandLottie.ts:1` | Local traversal/copy/recolor of animation colors/gradients against scene palette |
| `lib/news/linkedin.ts:1` | News record types/constants/19-record local index/source URL builder; no scraper/API sync |
| `i18n/routing.ts:3`, `i18n/navigation.ts:4`, `i18n/request.ts:4` | Locale definitions, navigation helpers, catalog loading; all three independently accounted for |
| `styles/tokens.css:1`, `app/globals.css:1`, `styles/a11y.css:1`, `styles/svgator-animations.css:1` | Design tokens; layout/theme/glass/font rules; low-vision override layer; CSS icon motion. These are patterns to adapt to destination tokens, not global stylesheets to copy wholesale |
| `types/global.d.ts:1` | Window Lenis typing; no business data contract |
| `next.config.ts:9`, `proxy.ts:28` | Static browser security headers and locale-request CSP nonce composition. CSP allows specified visual-service/runtime host classes; not authentication or endpoint delivery configuration |
| `package.json:24`, lockfile, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` | Dependency/build/type/lint/style/component-generator configuration. Presence of a package does not establish a user-facing feature |

## APIs, forms, auth, charts, exports and workflow truth

| Area | Actual source behavior | Safe migration implication |
| --- | --- | --- |
| Contact request | Browser validates four fields and POSTs them as JSON; server validates again; declared `Content-Length` limit is 24 KiB; per-delivery timeout is 8 seconds. Optional honeypot exists server-side; the current client schema does not submit that field. `app/api/contact/route.ts:6`, `:9`, `:41`, `:139`; contact `page.tsx:42` | Preserve educational validation/state transitions only; no legacy recipient/provider/transport |
| Delivery mode | Configured HTTPS webhook is tried first; mail provider is tried when first returns false. Success is provider `response.ok`; an exception returns 502, no config yields explicit 503 fallback. Browser opens an editable mail draft only for fallback. `route.ts:68`, `:87`, `:145`, `:154`; contact `page.tsx:93` | Never display “sent” in a local demo; use “simulated success” and show no-network boundary |
| Vacancies | Server contacts a fixed public recruiting API with one-hour cache; invalid/empty/failing response uses nine local fallback records. Apply is outbound navigation. `careers/page.tsx:141`, `:178`, `:400` | Demonstrate adapter modes with fixtures; do not call the old employer endpoint |
| News/content | Local index and copied public images, manually maintained. Search/paging happen in browser; external source posts are links. `news/page.tsx:41`, `lib/news/linkedin.ts:23`, `docs/news/LINKEDIN_CONTENT_WORKFLOW.md:41` | Use invented fixture records; no source post IDs or scrape workflow |
| Icon/runtime services | Iconify can fetch icon definitions; a profile glyph uses externally hosted image; Spline runtime may load WASM. `Icon.tsx:358`, `LeaderProfileModal.tsx:30`, `proxy.ts:41` | Distinguish asset delivery from business integrations; favor cleared local assets |
| Office maps | Hardcoded SVG geography/pins/cards with external mapping links; no remote tiles, geocoder, location tracking or maps API found. `kazakhstan-map.tsx:270`, `:475` | Remove old addresses and external map query destinations |
| Charts and tables | One real HTML comparison table in digital page; decorative SVG networks, fake stat cards and cube/motion scenes elsewhere. No charting/data-query analytics product or monetary-policy engine found | Any real chart/data dashboard is new work, explicitly scoped with seeded input |
| Auth and accounts | No login/register/OAuth/session/user role/permission backend, protected page, or account persistence in authored app/components/lib | Do not advertise authentication as inherited capability |
| Uploads and storage | No CV/file upload, database, candidate records, saved form history or CMS persistence | Use browser memory for proposed examples; no records retained by demo |
| Exports and sharing | No CSV/XLSX/PDF export, file download workflow, clipboard copy, Bezier export or share-link generator in authored app/components/lib | An export action would be a new enhancement and should use only visible seeded data |
| Transaction/procurement/security systems | Titles, content, technology logos and SVGs mention these domains; operational implementation is absent | No financial transaction, tender submission, real incident feed or compliance certificate may be implied |

### Credential and service-reference scan

No credential values were read or printed. Only filenames and variable names were inspected for environment inventory. `.env.example` was the only root `.env*` filename found; its values were not used. Developer tool connection metadata was not imported.

| Reference | Variable names only | Meaning |
| --- | --- | --- |
| `.env.example:3`–`:13` | `CONTACT_RECIPIENT_EMAIL`, `CONTACT_FROM_EMAIL`, `RESEND_API_KEY`, `CONTACT_WEBHOOK_URL` | Optional delivery configuration; reads in `app/api/contact/route.ts:69`, `:88`–`:90` |
| `.env.example:3`–`:13`, `docs/agents/MCP_USAGE.md` | `MOTION_TOKEN`, `ICONSCOUT_CLIENT_ID`, `ICONSCOUT_CLIENT_SECRET`, `ICONS8_API_KEY` | Asset/design tooling references, not evidence of runtime business integrations |
| `proxy.ts:29`, `i18n/routing.ts:12` | `NODE_ENV` | Environment mode/CSP/cookie behavior |
| `playwright.config.ts:7`, `:13`, `scripts/performance/measure.mjs:350`, `e2e/responsive-audit.spec.ts:26` | `CI`, `PLAYWRIGHT_BASE_URL`, `CHROME_EXECUTABLE`, `RESPONSIVE_AUDIT_DIR` | Local/CI test and measurement controls |

External host classes observed: public recruitment provider; optional transactional-mail provider or configured webhook; public social/source links; public mapping sites; icon/image delivery; Spline/runtime package delivery. No production endpoint strings, mailbox addresses, tokens, IDs or private datasets are specified for reuse. Browser-only original preference keys include `ddc-a11y`, `ddc-icon-system`, `ddc-icon-ab-variant`, `ddc-bg-system`, plus next-themes storage and locale cookie; use new portfolio keys.

## Retained assets, legacy and provenance

| Family | Current status / source evidence | Reuse decision for plan |
| --- | --- | --- |
| `public/` | 118 tracked assets: 1 GLB, 2 HTML, 2 JPEG, 26 JPG, 3 JS, 17 JSON, 37 PNG, 4 Spline scenes, 12 SVG, 10 TTF, 1 WASM, 3 WebP. Physical tree also includes ignored/local-only files | Do not treat local presence as permission or a reproducible tracked dependency |
| GLB/DRACO | `/base.glb` is used by viewer at `BaseModelViewer.tsx:290`; DRACO configured by directory at `:33` | GLB needs ownership/rights review. Directory-loaded decoders are dependencies even without per-filename references; preserve upstream notices if ever reused |
| Spline | One local scene used by hero; four tracked scene exports exist. Wrapper mutates texture/cursor interactions at `splite.tsx:181`, `:214` | Existing scenes/emblem textures are not automatically transferable. Native Spline data is not an R3F GLTF asset; use owned replacements or an explicitly licensed conversion |
| Fonts | Nine Nohemi weights and one numeric font tracked; CSS uses local fonts | Font licenses/redistribution rights require proof. Use portfolio-approved fonts by default |
| Logos, emblems and people/media | Source logo/theme variants, team portraits, social/news imagery, city emblems, branded masks/textures and historical screenshots | Exclude original identities, portraits, copied social text/media and brand assets; replacement visuals must be owned/cleared |
| Lottie | 17 tracked JSON assets across career and general/service illustrations; lazy wrapper and career/mission pages reference selected files | Audit each source/license. Old service Lottie family is unreferenced by current services SVG scene; do not bundle automatically |
| Unreferenced candidates | Extra Spline exports, older showcase portrait/news copies, original PNG counterparts of selected WebP art, starter SVGs, texture variants, ignored video/model/sequence files | Candidate archive/unreferenced status, not safe deletion proof. No files removed in audit |
| Static public HTML | Two prototype documents remain directly served, including the misnamed Lottie prototype | Record as exposed experiments; recreate only selected interaction patterns |
| `extracted/` | 55 tracked historical content/sitemap/images/tool files, not served as App Router pages. `extracted/sitemap.json`, `extracted/content/*`, reports and social extract are evidence of old site/content | Do not copy as public fixtures or treat old sitemap URLs as current routes |
| Legacy crawler/processing | `extracted/crawler.js:16`, `:41` downloads remote media/crawls; `extracted/process_sequence.py:12`, `:21` deletes/recreates outputs and processes video | Never execute for this plan; no migration dependency |
| Patch/agent scripts | `patch_header.py`, `patch_i18n.py` are historical developer patch utilities; `scripts/agents/*` invoke agent CLIs; hidden agent/rule/prompt folders provide development instructions | Not product features; no execution/transfer required |
| Generated/local output | `output/`, `test-results/`, `.playwright-*`, `.next`, `.vercel`, `.idea`, OS metadata and tool scratch folders | Audit/history/config artifacts, not authored runtime capabilities or demo data; do not package |
| Older docs and locale namespaces | `CoinShowcase`, `SakaScroll`, `MonetarySim` occur in all catalogs but have no current component consumer found. `variant=B` occurs in retained tests, not a current source branch | Retained/obsolete intent only; no monetary simulator or alternative variant may be claimed |

`README.md:336`–`:338` explicitly declares that no software license is present and requires confirming ownership/licensing for code, fonts, media, models and third-party assets before reuse/publication. Therefore this inventory recommends capability adaptation and owned replacements; it does not establish permission to copy the source.

`components/ui/splite.tsx:144`–`:173` removes vendor attribution/watermark DOM. Do not carry this behavior into the portfolio without verifying applicable vendor terms and entitlement. This is a reuse constraint, not a legal conclusion. `docs/design/ICON_ASSET_PIPELINE.md:88`–`:95` and `docs/news/LINKEDIN_CONTENT_WORKFLOW.md:13`–`:29` also require provenance/rights review. Source references to permissive third-party projects in `INTEGRATION_PLAN.md:7` do not establish the license of copied local components or assets.

## Tests, workflow and documented-plan reconciliation

| Evidence | What it establishes / what it does not |
| --- | --- |
| `package.json:8` | Scripts exist for lint, typecheck, locale guard, unit tests, build, browser tests and performance measurement. Their existence is not a passing result |
| `tests/unit/repository-contract.test.mjs:7`, `:14`, `:31`, `:38` | Four static contract tests: form data not logged, browser security headers, retry without reload, contact boundary controls. No successful delivery verification |
| `playwright.config.ts:3` | Only `smoke.spec.ts` and `security.spec.ts` are selected by current testMatch; Chromium only. Many retained files are excluded from normal runs |
| `e2e/smoke.spec.ts:3` | Intended checks cover 11 page types × 3 locales, reduced motion, main/footer presence and no page errors. Does not include UI lab or test MCP |
| `e2e/security.spec.ts:4`, `:34`, `:44` | Intended browser header/nonce, honest contact initial state, same-origin and JSON rejection checks. Does not exercise provider delivery or full security/compliance |
| Retained `e2e/site.spec.ts`, `functionality.spec.ts`, `visual_qa.spec.ts`, `audit.spec.ts`, `audit_screenshots.spec.ts`, `responsive-audit.spec.ts`, `variant_b.spec.ts`, `verify_animation.spec.ts`, `contact_icon.spec.ts`, `language_dropdown.spec.ts` | Ten historical/optional files outside current testMatch cover page text, careers, accessibility, scene/scroll, mobile, screenshots, theme and language. Some selectors/Variant B/home functionality expectations are stale |
| `scripts/check-i18n.mjs:20`, `:58`, `:80` | Catalog parity and hardcoded-text guard; current complete catalogs were independently parsed to compare key sets. Does not translate hardcoded experimental copy |
| `scripts/performance/measure.mjs:12`, `:69` | Local browser measurement/artifact workflow. Its all-route suite still includes absent analytics route; not a live page |
| `.github/workflows/ci.yml:35`, `:38`, `:41`, `:59` | CI installs, checks, builds and runs selected browser tests; no deployment job in this workflow |
| `ARCHITECTURE.md:5`, `:39`, `:79` | Stale: says there is no API and contact is mail-only/planned. Current contact API and browser POST are authoritative |
| `INTEGRATION_PLAN.md:30`, `FULL_PLAN.md:32` | Planned financial dashboard, analytics page, MDX news and candidate form are not implemented. Source implementation wins over prose |

No runtime, visual, keyboard, mobile, contrast, performance, provider-delivery or route-status result is certified by this audit. Later implementation validation should test destination behavior using fixtures and offline boundaries; it must not run legacy production integrations to prove a demo.

## Handoff to storyboard and planning role

Inventory is ready for the sequential Subagent 2 storyboard/blueprint and implementation-plan phase. Preserve the F-IDs when selecting modules so every legacy capability has an explicit disposition: demonstrate, adapt, archive, replace or exclude. Cite this exact source HEAD. Keep all proposed dynamic outputs visibly seeded/local, replace identity/media/metrics, and treat added filtering, editing, exports, data charts, auth or commerce as new scope where noted.

No Subagent 3/4 implementation is authorized by this document. No production code, dependency, repository configuration or source asset was modified.
