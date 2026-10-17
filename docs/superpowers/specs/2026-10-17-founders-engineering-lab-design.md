# Founder’s Engineering Lab — design

Date: 2026-10-17. Status: proposed for approval; implementation has not started.

## Authority and evidence

This is Subagent 2’s design, based on the completed [legacy inventory](2026-10-17-ddcnb-feature-inventory.md), source HEAD `86d7ff363f4cef953c2a1b2e8392ff388db80733` in `../ddcnb_site`, and the destination’s `AGENTS.md`, `docs/ARCHITECTURE.md`, `package.json`, root layout, scroll controller, content contracts/readers, ContactForm, lab composition and pipeline builder. Static inspection establishes implementation structure, not runtime quality. The source is untouched.

The user requested audit → design and atomic plan → pause for approval → sequential implementation roles. This explicit order permits writing the plan before design approval; it does not authorize implementation, dependency installation, production changes, implementation commits, pushes or deployment. A local planning-document commit is permitted after review. The requested [brainstorming](https://github.com/obra/superpowers/blob/bb92a77741419a4ab5f06e711a283343f1ada0c3/skills/brainstorming/SKILL.md) and [writing-plans](https://github.com/obra/superpowers/blob/bb92a77741419a4ab5f06e711a283343f1ada0c3/skills/writing-plans/SKILL.md) workflows were read at that exact upstream revision; no global skill/config installation is required. A fresh builder review precedes the approval handoff.

## Product position and proposed decisions

Build a flagship personal engineering portfolio that also tests startup ideas: visitors can understand Namazbek’s judgment, operate small examples, inspect limitations, then propose a conversation. The site presents an individual builder exploring ventures, with no claim of an established venture fund, startup team, customers, revenue, investment authority or validated traction.

Primary audience: potential cofounders, technical collaborators, early backers and partners. Hiring managers remain welcome through links to the existing personal portfolio. The conversion is a relevant conversation, not an invented investment funnel. Success is a visitor completing a local demo and finding the appropriate contact intent; no analytics collection is added in this scope.

Recommended blueprint: **one engineering core, four chapters, six workbenches**. A single owned object unfolds as the narrative moves from personal authorship to inspectable capabilities, system tradeoffs and venture hypotheses. A responsive Bento matrix provides direct access for visitors who skip the story. This makes visual ambition serve explainable work while containing implementation and GPU cost.

Alternatives considered:

| Blueprint | Advantage | Cost / reason not selected |
| --- | --- | --- |
| Full 3D control room | Strong immersive spectacle | Navigation and accessibility become a separate product; more GPU work and misleading dashboard language |
| Editorial portfolio with static case studies | Fastest, most readable, lowest motion risk | Underuses the requested interactive engineering core and live capability matrix |
| Independent demo for every legacy effect | Maximum visible inventory | Produces a fragmented widget gallery; duplicates renderers and weakens the personal/startup narrative |

These are architect recommendations awaiting approval: preview routes under `/studio`; English global editorial copy; six modules; a fixed architecture DAG rather than a drag editor; three explicitly unvalidated venture hypotheses; a procedural scene rather than imported legacy models. Promotion to `/` requires separate approval. Existing `/` and `/v2` remain usable during preview.

## Global constraints

- Preserve `/` and `/v2`; implement the proposed preview only at `/studio`, `/studio/modules/[slug]`, and `/studio/connect`.
- Keep Next.js 16 App Router, TypeScript and Tailwind 4; use `lenis/react`, GSAP + ScrollTrigger, `@react-three/fiber`, `@react-three/drei`, existing Three.js, and `motion/react` only.
- Mount one persistent background `SceneCanvas` in the Studio layout; business modules must not import Three.js, R3F or scene internals.
- Use refs, MotionValues, CSS variables or `useFrame` for continuous pointer/scroll work; never call React state setters on those continuous paths.
- Keep engines pure and deterministic, fixtures synthetic, the registry data-only, and each module view lazy loaded.
- Label demo outputs `Seeded demo` or `Local simulation`; no legacy endpoints, identity, metrics, certifications, fonts, people/media or proprietary scene assets enter Studio.
- Keep the existing real contact API separate from the local form workbench; confirmed API success means a message was saved, never emailed.
- No implementation, package installation, configuration changes, implementation commit, push or deployment is authorized until the user approves the design and plan; reviewed planning documents may be committed locally.

## Four-chapter storyboard

| Chapter | What the visitor sees and does | Core pose / motion | What remains without motion or JavaScript |
| --- | --- | --- | --- |
| 01 — Author / Hero | Eyebrow “Namazbek Bekzhanov · Data Engineer & Backend Developer”; proposed H1 “I engineer systems. I test what should exist next.” Short first-person explanation, “Explore the lab” anchor and “Start a conversation” link. Availability/location come from approved profile reads. | Closed graphite core with one bounded transmissive shell and matte inner nodes; fine-pointer parallax is subtle. Scroll opens the shell and reveals discrete layers. | Complete heading, copy, links and an owned inline SVG poster; no waiting for a canvas. |
| 02 — Capability Matrix | Six responsive Bento cards: Policy Workflow, Data Explorer, Architecture Inspector, Interface Lab, Locale Inspector, Form Workbench. Each has an honest output preview, provenance tag and “Open workbench” link. A click/keyboard action can activate one lightweight lazy preview at a time. | Separated layers align behind the matrix. Their role is visual, never a claim that the cards are live infrastructure. | Ordered card list with descriptions, outputs and ordinary route links; no hover-only information. |
| 03 — Architecture & Scale | Fixed illustrative source → validate → transform → serve DAG; select a stage, advance a sample packet, compare batch/stream/hybrid tradeoffs. Explicit “Illustrative architecture; no jobs are running.” Link to the architecture module. | Core nodes resolve into a pipeline composition; restrained line/packet movement follows chapter progress. | SVG diagram, numbered stages, a table caption and all tradeoff text. |
| 04 — Venture Lab / Connect | Three proposal cards, visible stage “Validating — hypothesis, no traction claimed,” next validation step and evidence boundary. Terminal-style command input plus equivalent Cofound / Invest / Partner links. | Layers reassemble into an open cradle, then rest. Terminal/content remain ordinary DOM above it. | All hypothesis text, status and direct intent links; real contact route and email fallback. |

Chapter IDs are `studio-author`, `studio-capabilities`, `studio-architecture`, `studio-ventures`. Avoid a 500vh lock-in: start with ordinary document flow and short optional desktop pin windows of at most one viewport per transition; remove pinning on coarse pointer, small screens, reduced motion and forced colors. Scroll never gates content or actions. The user can navigate by section anchors immediately.

Venture cards are proposed hypotheses, not approved business claims: (1) “Pipeline Review Kit” — can a small reproducible review help teams catch data-contract drift? Next step: problem interviews. (2) “Workflow Policy Studio” — can visible allow/deny explanations improve workflow design? Next step: prototype feedback. (3) “Interface Reliability Kit” — can a practical state matrix shorten interface QA? Next step: observe a real review process. Each states “Seeded prototype only; no users or revenue asserted.” Do not imply those interviews/tests already happened. Ecommerce is recorded separately as an unbuilt hypothesis, without a shop or pricing CTA.

## Visual and interaction system

Graphite background (`#0B0F12`), raised surfaces (`#12191E`), legible off-white (`#EDF5F5`), muted copy (`#A9B9C0`), ice (`#BDEEFF`), cyan (`#67D5E7`) and mint (`#99E0C0`) accents are proposed Studio-only tokens. A thin border and controlled frosting support hierarchy. Text panels use DOM/CSS glass; the WebGL shell refracts only scene contents and does not promise DOM refraction. Forced colors and reduced transparency replace glass with solid surfaces.

Reuse destination-approved fonts and typography loading. Large editorial headings sit beside precise small labels; normal text stays comfortably readable. Scene and module styles are scoped to Studio. Use a six-card desktop grid, two columns on medium screens and one column at narrow widths; no horizontal page scroll at 320 CSS pixels. Button hitboxes stay stable at least 44 × 44 CSS pixels; pointer attraction affects decoration only. Keep the native cursor; any decorative magnetic follower is hidden on touch, reduced motion and forced colors. Focus styling is visible and stationary.

Use semantic unsplit headings. Optional visual letter/word spans are `aria-hidden`; the semantic text remains readable on first render and with JavaScript disabled. Avoid duplicated screen-reader speech and hidden-until-animation content. Motion is a progressive enhancement. Timelines, note thumbnails, role diagrams and region outlines are owned procedural SVG/CSS assets; none requires legacy images, fonts, logos, masks, Spline exports or GLBs.

The explicit motion deliverables are `CustomMagneticCursor` (decorative follower; native cursor stays), `MagneticAction` (decoration moves inside a fixed link/button hitbox), `TiltCard` (maximum ±4° with a pointer-centered radial spotlight), and `KineticHeading` (character stagger plus scroll-velocity skew bounded to ±4°). Cursor/magnetic/tilt effects use refs/CSS variables or MotionValues, with centered static focus styling and no pointer-driven React state. Keyboard focus never moves the action or text. Coarse pointer, reduced motion and forced colors disable those effects. Heading visual spans enhance only after hydration; the unsplit semantic heading stays visible before enhancement, with no-JS and failure paths. Pointer capture, listeners and transformations reset on leave/cancel/unmount. Skew reads a shared Studio velocity MotionValue, not a second scroll loop, and returns to zero at rest.

## Information architecture and routes

| Proposed route | Responsibility |
| --- | --- |
| `/studio` | Four chapters, curated preview matrix, venture hypotheses and connect entry |
| `/studio/modules/policy-workflow` | Deterministic LAB-credit policy workflow |
| `/studio/modules/data-explorer` | Separate Notes and Sample Roles modes sharing search/filter/paging presentation |
| `/studio/modules/architecture` | Fixed DAG, illustrative service stages and tradeoff table |
| `/studio/modules/interface-lab` | Purposeful small interaction/state samples |
| `/studio/modules/locale-inspector` | Local `en` / `ru` / `kk` content and metadata inspector |
| `/studio/modules/form-workbench` | Synthetic request/response and validation state inspector, no transport |
| `/studio/connect?intent=cofound\|invest\|partner` | Real shared contact form, explicit context and fallback |

Unknown module slugs use segment not-found; a Studio catch-all sends other unmatched Studio addresses to the same local recovery surface. Missing/invalid/repeated contact intents resolve to general contact without reflecting untrusted text. The terminal accepts only trimmed case-insensitive `help`, `cofound`, `invest`, `partner`, `clear`; commands do not execute code or shell. `help` lists the commands, `clear` clears local terminal output, and the three intents navigate to their enum-only URL. Reject unknown commands with fixed safe copy; do not log commands, store history or place names/emails/messages in the URL. Buttons provide every terminal action.

Preview pages use `noindex, follow`, self-canonical URLs and no sitemap additions. Do not canonicalize materially different Studio content to Classic. Existing root `<html lang="en">` remains correct for global English copy. The Locale Inspector changes only a nested sample’s `lang` and local metadata preview. Its UI explicitly documents that the source route token was `kz` while Kazakh HTML language is `kk`; it does not create 39 translated portfolio routes, use the old locale cookie or change global language. Full localization is a separate information-architecture decision.

## Module contracts and behavior

All module pages share a server-rendered title, explanation, provenance/boundary text, a read-only initial fixture, back link and a client enhancement slot. The data-only registry supplies two to four labeled sample values per module, rendered directly by the server ModuleFrame. A loading surface reserves space; failed enhancement leaves that fixture and ordinary navigation readable and offers retry. Demo inputs/actions are disabled until their enhancement has loaded and hydrated. No-JavaScript mode promises reading and ordinary links, not functional server-backed demos. Sample actions use `type="button"`; the form workbench has no native form submission, and fallback never serializes fields into a query, request or mail draft. The separate real contact form retains its existing hydration guard and email fallback. Enhanced inputs operate in memory only. “Reset demo” clears transient state and restores the exact fixture. Cancel is available during any multi-step work; blur/unmount cancels pointer capture and staged operations. Never log input or serialize it to a URL/storage. Only explicit preference toggles may persist under `nb-studio-*`, with a reset and graceful storage-denied handling.

| Module | Exact behavior and boundaries | Required states / keyboard |
| --- | --- | --- |
| `policy-workflow` | Three named presets; integer `credits` in LAB credits, recipient enum `hub-a` / `hub-b`, category `education` / `tools` / `travel`. Policy allows positive integer credits ≤ 1000 to `hub-a` for education/tools; denies every other valid combination with reason codes. Pure functions evaluate and construct a stable `LAB-…` receipt from canonical input; label it an identifier, not a hash, signature, blockchain or transaction. Manual “Advance step” moves input → validation → policy → receipt, no artificial timeouts. | Invalid/allowed/denied, cancel to editable input, reset, advance/back. Reject NaN/infinity/fractions/empty input and unknown enums before evaluation. Repeat same input yields same receipt; cancellation never completes later. Native number/select controls and buttons. |
| `data-explorer` | Notes: 19 invented records, four categories, normalized case-insensitive title/summary/terms query, six-per-page. Sample Roles: nine invented records with separate role schema and sample department/location/type; adapter selector `seeded` / `empty` / `unavailable` shows local fixtures and provenance, no fetch. Shared controls, distinct terminology; no claim of current hiring or live news. Local details replace outbound social/apply URLs. | Search/category changes clamp/reset page; empty/no-results/unavailable/retry/reset; keyboard search/filter/page/detail. Detail dialog traps focus, Escape closes and focus returns. Role filtering is a new enhancement. |
| `architecture` | One fixed four-node acyclic graph; selected-node detail, packet stepper, generic support/approval/data/cloud/control illustration tabs (F24–28), and three-option/five-criterion tradeoff table. F13 becomes a compact categorized stack catalog: project tooling, platform systems and development tools, each with locally authored explanations of their illustrative role. Technology names imply no running integration. Every status says illustrative. No drag, arbitrary graph, deployment, SQL execution, incident detection or throughput metric. Existing classic pipeline builder remains separate. | Previous/next/select/stop/reset, table header semantics, node buttons, stack-category controls with readable explanations, and ordered text alternative. “Cancel” stops the packet and returns to first stage. Selection has no continuous state updates. |
| `interface-lab` | Three purposeful sample groups: (a) navigation/preview, theme/icon/palette/accessibility sample; (b) loading/empty/error/retry plus FAQ/role-principle disclosures; (c) motion sample selector with owned icon/curve/gallery/timeline/region patterns. Accessibility samples retain 100/125/150/200% text, three schemes, spacing, grayscale, serif and reset, scoped to the example. One sample active at a time; media/lightbox uses owned abstract SVGs. Bezier handles have numeric/arrow-key alternatives and reset. Optional sample prices are marked non-purchasable examples. | Ready/loading/error/recovered toggles are manual local controls. Focus trap/return/Escape for dialog; `aria-expanded` + `aria-controls` disclosures; curve pointer cancel restores pre-drag value and keyboard edits commit discretely. Pause/static toggle stops all sample animation. Accessibility controls affect sample only, never claim compliance. |
| `locale-inspector` | One short invented card in en/ru/kk with stable key-set/type validation; inspect title/description and sample language. Explicit selectable locale, no random assignment or browser negotiation. | All three languages, missing-key fixture with safe fallback, reset. Sample `lang` matches selection; metadata is an inspector output, never live document metadata. |
| `form-workbench` | Synthetic name/email/message/website fields and selectable seeded validation/request fixtures. Preview only, permanently labeled “No request is sent.” Local adapter modes cover source-style 400/403/413/415/422/502/503/200 examples; do not reproduce a provider client, configurable URL, mailto or API route. Fictional payload only; no persistence. | Idle/invalid/pending/simulated-success/unavailable/failure/cancel/reset. Failure preserves edits; simulated success resets only on explicit reset. Pending resolves through manual advance or cancel, not timers. Validation errors linked to fields; status politely announced. |

Reusable contract names are fixed for the plan: `ModuleSlug`, `ModuleDefinition`, `ModuleViewProps`, `DemoState`, `ConnectIntent`, `SceneSignals`, `SceneRouteMode`, `ModuleFrame`, `ModuleLoader`. Each module owns `domain.ts`, `fixtures.ts`, `view.tsx`. No domain module imports React, graphics, storage or network. No giant module switch inside the canvas. The data-only registry contains metadata/F-IDs, while a separate client loader map owns literal dynamic imports. The matrix mounts at most one selected preview; module routes load only their own view, not every workbench.

## Real contact boundary

Read approved identity/contact data through existing `getProfile(): Promise<Profile>` in `src/lib/content`; no browser Supabase client. Use the current public name, role, location, biography and primary email only. Do not project institutional source leadership or history onto the author. Real contact on `/studio/connect` reuses `src/components/contact-form.tsx` and existing `/api/contact` protections/storage. Display selected intent in explanatory copy above the form; do not alter API fields or auto-submit it. Investing is an invitation to discuss a hypothesis; no offering or commitment is implied.

Current fields remain `name`, `email`, `message`, `website`. Controls stay disabled until hydration; `<noscript>` supplies an approved email link. Pending/failed submissions preserve data; only confirmed successful storage resets. Copy says “Your message was saved,” and failure retains an email fallback. Tests intercept this request with local responses and must not send real messages or exercise old providers. No database schema change is needed.

## Rendering, scroll and ownership architecture

```text
RootLayout (existing document + legacy SmoothScroll, excluded for /studio subtree)
└─ studio/layout.tsx (Server: metadata, profile, shell)
   └─ StudioRuntime (Client: eligibility + ReactLenis + scroll/scene signals)
      ├─ SceneHost → dynamic SceneCanvas (one persistent background Canvas)
      ├─ StudioNavigation (DOM)
      └─ server route children → isolated lazy ModuleLoader (DOM)
```

First integration dependency: `src/components/layout/smooth-scroll.tsx` must skip exact `/studio` and `/studio/…` paths and clean its existing controller when entering Studio. `/studio-other` must not be skipped. Otherwise root Lenis and Studio Lenis can compete. Use `ReactLenis` from `lenis/react`, root mode, `autoRaf: false`, `syncTouch: false`, with one Studio-owned GSAP ticker callback forwarding seconds × 1000 to `lenis.raf`. Its Lenis scroll listener calls `ScrollTrigger.update`. Attach only for eligible fine-pointer desktop/no-reduced-motion operation; touch/native mode avoids smoothing and pinning. Preserve native anchor focus, browser restoration, input/dialog scrolling and text selection. No global `killAll` or unowned ticker removal; cleanup removes this listener/callback and reverts this `gsap.context`/`useGSAP` context. If any global ticker setting is necessary, document/restore its previous value rather than silently affecting Classic/V2.

Use installed Next documentation: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`, `01-app/01-getting-started/03-layouts-and-pages.md`, `05-server-and-client-components.md`. Keep async route `params`/`searchParams` awaited. `dynamic(..., { ssr: false })` belongs inside the Client `SceneHost`, never a Server layout. The Server shell renders semantic content and poster first. Studio layout persistence keeps exactly one canvas across its nested routes. On `/studio/modules/*` and `/studio/connect`, set `SceneRouteMode = 'ambient'`, reset chapter/scroll/pointer signals to a neutral pose, and dispose landing-only ScrollTriggers because the chapter IDs are absent. Return to `/studio` rebinds after the DOM exists and refreshes measurements; no stale progress or selectors. Leaving Studio disposes its canvas and scroll owners; Classic’s controller can resume.

Scene scope: original procedural core composed of one transmission shell, a few matte layer plates and instanced nodes. No Spline runtime/export in the scene; do not mount old Spline hero, particle canvas, or V2 sculpture alongside it. Start with `MeshTransmissionMaterial` resolution 256, samples 4, `backside={false}` and one bounded optical object; DPR ≤ 1.5 desktop, one antialiased renderer, no postprocessing/shadow pipeline. The shell is an adjustable quality budget, not a promise of measured performance. If profiling misses budget, disable transmission before adding techniques.

Core choreography is deterministic, with pure scalar `poseChannelAt(progress, channel, mode)` sampling shared keyframes. All finite landing progress clamps to 0..1; invalid progress becomes 0. Smoothstep interpolation gives continuous values and zero slope at boundaries. Rotation values are radians, camera values scene units. The four chapter intervals are 0..0.25,0.25..0.5,0.5..0.75,0.75..1. The terminal scene rests at1. Ambient module/connect mode ignores progress and returns the neutral pose.

| Pose / progress | rotation XYZ | scale | camera XYZ | layer expansion | material distortion | light intensity |
| --- | --- | --- | --- | --- | --- | --- |
| Sealed / 0 | 0,0,0 | 1 | 0,0,6 | 0 | 0.02 | 1 |
| Open / 0.25 | 0.15,0.35,0 | 0.95 | 0.15,0.1,6.2 | 0.8 | 0.04 | 1.1 |
| Aligned / 0.5 | 0,0.65,0 | 0.85 | 0.3,0.05,6.6 | 1 | 0.02 | 1 |
| Pipeline / 0.75 | 0,1.05,0.1 | 0.8 | 0.2,0.15,7 | 1.4 | 0.01 | 0.9 |
| Cradle / 1 | 0,1.3,0 | 0.9 | 0,0.1,6.5 | 0.55 | 0.02 | 1 |
| Neutral / ambient | 0,0,0 | 0.8 | 0,0,6 | 0.1 | 0 | 0.8 |

These exact poses are proposed defaults, adjustable only through a documented visual/performance review. Pure scalar sampling lets the frame adapter update existing vectors/uniforms without allocating new poses each frame. Tests pin endpoints, continuity, bounds, invalid inputs and ambient neutrality independently of Three.js.

`SceneSignals` stores mutable normalized progress, pointer and pose targets outside React render state. `useFrame` reads refs and interpolates with reusable vectors; no per-frame allocations. Use demand rendering and explicit `invalidate` while input/pose settles; stop scheduling at rest, when hidden or offscreen. Route changes reset targets. A scene-local error boundary/GPU context loss switches to the owned poster with a retry button and leaves content functional. R3F-managed objects unmount cleanly; manually owned geometries/materials/textures/render targets/listeners must dispose once. Never dispose shared cached objects from an unrelated owner.

## Performance and accessibility acceptance

60fps is a measured target with a 16.7ms frame budget on named devices, not a universal claim. Provisional acceptance budgets: warmed desktop scroll trace p95 frame duration ≤ 16.7ms, no repeated >50ms main-thread tasks caused by Studio animation, ≤100 scene draw calls / 100k visible triangles, and idle scene frame count stops increasing within one second of settling. Initial Studio enhancement JavaScript target ≤350 KiB gzip excluding the separately deferred Three/R3F chunk; deferred scene target ≤450 KiB gzip. These are approval-stage budgets to measure and revise transparently, not current results. Avoid network fonts/models and hidden background rendering. Do not ship a misleading “live FPS” badge.

Fresh verification must record commit, browser/OS/device/GPU, viewport/DPR, cache/CPU conditions, motion settings and trace/artifact paths. Required matrix: an available integrated-GPU laptop at 1440×900 DPR1 and Chromium with motion enabled; Safari desktop; a real iPhone Safari and Android Chrome for native-scroll fallback (or explicitly report unavailable physical coverage); 390×844 emulation; 320 CSS pixels; reduced motion; forced colors; 200% text zoom; keyboard-only; JS disabled; WebGL denied/context loss; storage denied; slow/lost lazy import; route/back/forward loops. Emulation does not certify physical mobile GPU results.

Fresh checks after implementation: `npm run check` (lint + typecheck + unit), `npm run build`, selected Studio and existing contact/scroll browser tests, then affected Classic/V2 regressions. Existing Playwright config is `playwright.config.js` and defaults to reduced motion, so add explicit motion-enabled contexts for animation evidence; do not assume default screenshots exercise the scene. Automated tests verify contracts and behavior, not CSS strings or exact shader implementation. Manual contrast/visual/assistive-technology checks complement automation. Runtime evidence remains “not run” until executed against the implementation; prior site reports cannot prove Studio.

## Complete source route disposition

This preserves the audit’s 13 localized page templates (39 intended URLs), plus the two standalone documents. `L` denotes the original `ru`, `kz`, `en` route token; the source root `/` was locale negotiation, not a fourteenth page. No legacy route is silently recreated on the destination.

| Source template / document | Target disposition |
| --- | --- |
| `/L` | Hero + Capability Matrix + shared scene grammar; institutional copy replaced |
| `/L/about` | Personal principles/story, architecture context and Interface Lab gallery/timeline/role-tree patterns; people/history excluded |
| `/L/services` | Architecture module illustrative stage selector; capabilities no longer advertised as operated services |
| `/L/mission` | Four-chapter engineering lifecycle narrative and shared progress grammar |
| `/L/news` | Data Explorer Notes; local invented archive, no live feed or social records |
| `/L/careers` | Data Explorer Sample Roles; seeded adapter modes, no real recruiting |
| `/L/contact` | Form Workbench demo mechanics; real personal CTA separately reuses destination contact |
| `/L/security` | Architecture control explanations / Interface Lab disclosures; certifications excluded |
| `/L/digital` | Policy Workflow and architecture comparison table; LAB credits, no financial transaction |
| `/L/faq` | Interface Lab accessible FAQ sample |
| `/L/ui-lab` | Interface Lab / shared motion patterns; no operational MCP or live-tool claims |
| `/L/test-mcp` | Capability Matrix Bento grammar + Interface Lab inert component states; pricing is sample only |
| `/L/ecommerce` | Archived placeholder; explicitly unbuilt hypothesis, no commerce demo |
| `/temp-animated-icons.html` | Selected owned Interface Lab icon samples; original document archived |
| `/labs/center-lottie-prototype.html` | Selected owned Interface Lab choice sample; original document archived |

Original API `/api/contact` becomes no-network Form Workbench response fixtures; its transport/providers are excluded. The real destination `/api/contact` is an existing independent feature, not a migrated legacy adapter. Shared source 404/error/layout patterns become Studio shell recovery and test scenarios.

## Complete feature disposition (F01–F48)

Each ID has one explicit primary home. “Adapt” means recreate the capability using owned assets and safe fixtures, not copy unlicensed code. Secondary reuse follows the same boundary.

| ID | Primary disposition / destination | Kept capability and explicit limitation |
| --- | --- | --- |
| F01 | Adapt — Locale Inspector | Three sample languages/metadata; global route localization excluded |
| F02 | Adapt — shared Studio shell | Keyboard/mobile navigation, active section and local previews |
| F03 | Adapt — Interface Lab | Theme sample/tokens; no new global theme conflict |
| F04 | Adapt — Interface Lab | Explicit icon/palette comparator; no random cohort or icon network |
| F05 | Adapt — Interface Lab + shared accessibility policy | Scoped sample text/spacing controls; no certification claim |
| F06 | Replace — Studio runtime | One owned Lenis/GSAP lifecycle, native alternatives, anchors/restoration |
| F07 | Adapt — ModuleFrame / SceneHost | Reserved loading/retry/poster; no remote assets |
| F08 | Replace — Hero core | Owned R3F pointer object; Spline scene/runtime excluded from Studio |
| F09 | Combine — shared core | Procedural instanced points within same canvas, no separate background renderer |
| F10 | Combine — four-chapter core | Geometry/layer morph and story reveal; original masks/statistics excluded |
| F11 | Adapt — Capability Matrix | Responsive capability cards with real local destinations |
| F12 | Combine — Capability Matrix / Interface Lab | Grid/gallery depth grammar; no fifteen dead destinations |
| F13 | Adapt — Architecture Inspector | Categorized stack explanation; names are context, no running integrations |
| F14 | Replace — Author chapter | Personally authored engineering principles from approved profile context |
| F15 | Replace — Connect CTA | Intent navigation; no partner logos or partnership implication |
| F16 | Combine — shared SceneCanvas | Inspectable owned geometry/pose; no old GLB, CAD or export |
| F17 | Replace — Author/Venture context | Personal authorship; institutional founder/value claims excluded |
| F18 | Adapt — Architecture Inspector | Fixed fictional system context and node details; no monitoring |
| F19 | Adapt — Interface Lab | Owned abstract gallery/lightbox; all event people/media/links excluded |
| F20 | Adapt — Interface Lab | Fictional example milestone timeline; no invented personal history |
| F21 | Adapt — Interface Lab | Anonymous role hierarchy/dialog; no team or directory backend claim |
| F22 | Adapt — Interface Lab | New engineering-principle disclosures beside role tree |
| F23 | Adapt — Architecture Inspector | Compact selector + explicit stage controls; no 500vh obligation |
| F24 | Adapt — Architecture Inspector | Illustrative support-flow stage; no calls/chat/case queue |
| F25 | Adapt — Architecture Inspector | Illustrative approval stage; no procurement/ordering |
| F26 | Adapt — Architecture Inspector | Deterministic sample packet; no ETL/SQL execution |
| F27 | Adapt — Architecture Inspector | Fictional infrastructure detail; no host/deployment control |
| F28 | Adapt — Architecture Inspector | Explanatory controls SVG; no detection engine or new event classifier |
| F29 | Combine — four chapters | New authored lifecycle + progress grammar, owned assets |
| F30 | Adapt — Architecture Inspector | Generic three-option/five-criterion comparison table |
| F31 | Replace — Policy Workflow | Deterministic LAB-credit rules and honest receipt; no crypto/financial claims |
| F32 | Replace — Architecture Inspector | Engineering-control explanations; badges/certification claims excluded |
| F33 | Adapt — Data Explorer Notes | 19 invented local notes, four categories, search/six-per-page/empty/reset |
| F34 | Combine — Interface Lab motion sample | Owned CSS/SVG cube sample; no second canvas or long scroll intro |
| F35 | Replace — Data Explorer Sample Roles | Nine synthetic roles, adapter-state selector, no source fetch/apply URL |
| F36 | Combine — Interface Lab motion sample | Owned value/choice composition with linear fallback; no HR workflow |
| F37 | Adapt — Form Workbench | Local field validation and manual simulated submission states |
| F38 | Adapt — Interface Lab | Owned abstract region/pins and local details; no addresses/geolocation |
| F39 | Adapt — Interface Lab | New FAQ with expanded state and panel association |
| F40 | Combine — Interface Lab catalog | Static provenance/status examples; original metrics/MCP claims excluded |
| F41 | Combine — Interface Lab pointer sample | Procedural decorative field + focus previews; pause/native fallback |
| F42 | Adapt — Interface Lab curve sample | Local Bezier editing with keyboard/numeric alternatives; no save/export |
| F43 | Combine — Capability Matrix / Interface Lab | Bento/states grammar, optional inert sample pricing; no purchase/auth |
| F44 | Archive — unbuilt hypothesis | Ecommerce was placeholder; no cart/catalog/checkout implemented here |
| F45 | Adapt — Studio recovery + Interface Lab | Not-found/error/retry/loading; safe copy, no provider stack traces |
| F46 | Adapt selected patterns — Interface Lab | Owned icon/three-choice samples; do not embed archived HTML |
| F47 | Exclude — historical plans only | No inherited analytics/dashboard/MDX CMS/monetary model/auth/export |
| F48 | Replace — Form Workbench boundary examples | Predetermined request/response fixtures; source transport excluded |

## Dependency evidence and limits

Existing pins read from destination: Next 16.4.0, React/DOM 19.3.0, Tailwind 4.3.3, Three 0.186.1, Lenis 1.3.26, Zod 3.25.76. Root’s fresh official npm metadata check on 2026-10-17 identified candidate additions `@react-three/fiber@9.8.2` (React ≥19 <19.4), `@react-three/drei@10.7.9`, `motion@14.3.0`, `gsap@3.15.0`, `@gsap/react@2.1.2`. They are not installed or runtime-proven by this design. Recheck peers/engine/lockfile under approved implementation; retain existing Three/Lenis and do not copy source Zod 4. Do not add separate `framer-motion` or postprocessing packages. GSAP uses its custom Standard no-charge license, not MIT; preserve dependency notices and check applicable terms. The user identifies the source as their repository and authorizes feature extraction/adaptation. Although the source has no blanket software license, that does not introduce another human approval gate for user-owned implementation. Review third-party code/asset provenance and dependency notices during normal implementation review; procedural replacements avoid unresolved fonts/media/model rights. Never copy source secrets.

Technical references supporting the proposed integration: [Lenis React](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context()/), [R3F demand rendering/performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Drei transmission material](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material), [MotionValues](https://motion.dev/docs/react-motion-value). Official documentation informs the proposal; fresh local verification determines what ships.

## Approval and execution boundary

Review this design together with [the implementation plan](../plans/2026-10-17-founders-engineering-lab.md). Approval should cover the preview namespace, personal/startup positioning, six-module scope, four-chapter direction, proposed content/visual defaults and budgets. No answer or elapsed time is approval. After explicit approval, preserve the requested sequential roles: Subagent 3 implements the engine, scene/motion foundation and migrated/restyled modules/integration; Subagent 4 then independently verifies performance and release readiness. Subagent 4 reports defects to the builder for fixes instead of silently becoming a second implementation role. Root promotion/publication remain separate actions.
