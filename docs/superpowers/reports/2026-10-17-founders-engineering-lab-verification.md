# Founder’s Engineering Lab — independent verification

Date: 2026-10-17. Scope: approved preview under `/studio`; no root promotion, push, deployment, source-checkout edits or live contact writes.

## Evidence boundary

The visitor story is Studio’s four chapters → one selected local workbench → an optional enum-only conversation intent → the existing destination contact form. Six local demos use synthetic browser-memory fixtures. The real contact form’s request is intercepted before navigation in browser checks; no successful destination-store request is used as a test. Direct API regression checks send only origin/honeypot inputs rejected before persistence.

This report distinguishes observed runtime behavior, inspected ownership, injected faults, emulation and missing physical coverage. The implementation owner made the production fixes; the independent verifier owns tests, measurement and this report. The approved design and complete legacy inventory remain the disposition authority. A source-only review is separate from the runtime gate.

## Reproduced issues and test corrections

The first cross-route test doubled each text-bearing element’s precomputed CSS font size without scaling the viewport or boxes, then checked real text `Range` bounds at 320 CSS pixels. The landing H1, chapter headings, header and status badges clipped; `Architecture Inspector` also clipped. The original failure arrays remain in `task12-focus2.log`; transient Playwright failure screenshots were inspected during triage. A follow-up found the Interface Lab’s `Owned samples · memory only` badge forced onto one line. These were genuine production defects, fixed by the sole implementation writer using wrapping and flexible layout rather than hiding content or reducing the requested text scale.

The wide comparison table is a two-dimensional content exception. Its named, focusable local scroll region must actually move horizontally with arrow keys and reveal the last column; the rest of the document must reflow. The writer added the region, focus styling and ordinary keyboard instructions. Native End scrolling the document was a test mistake, so the test uses ArrowRight without overriding native keys. The comparison explanation stays outside the scroll width.

Two other initial offline failures were test mistakes: the adapter label includes helper copy, so an exact label selector was wrong; the kinetic heading has an aria-hidden visual copy, so accessible-name comparison is required. Neither was reported as a production defect. No claim that Tab navigation failed is made: the earlier implementation’s next-Tab check passed.

The native Safari spot check then found a genuine placement defect: the shown gallery dialog was flush upper-left. Dedicated bounds tests reproduced x=0/y=0 at both 1440×900 (469×501.67 dialog) and 320×320 (288×272 dialog). Existing modal behavior was functional; this was a placement RED, not a focus/Escape failure. The sole writer added only `margin: auto` to the Studio dialog rule. The regression checks actual center, viewport bounds, height limit, real keyboard scrolling when short, containment, Escape and focus return. Durable before captures are `studio-verification-modal-red-desktop.png` and `studio-verification-modal-red-small.png`; exact baseline bounds remain in `task12-modal-red.log`.

## Verified architecture and boundaries

- One persistent SceneHost is a child of StudioShell before header/main. Conditional ReactLenis is a sibling of route content; policy changes preserve business state. The root SmoothScroll excludes the exact Studio namespace. Landing-only geometry/observer work cleans up on nested routes and rebinds on return.
- Six literal lazy imports sit outside the data-only registry; the selected matrix preview mounts only one view. Every module’s read-only initial fixture is rendered by Server ModuleFrame. No interim “being built” workbench remains.
- Pure domain/fixture modules contain no graphics, React, network or storage imports. Views use owned DOM/SVG/CSS and synthetic fixtures. The local form has no native form, API call, storage call or input serialization.
- Original procedural scene: transmission torus, matte plates, 32 instanced points, one R3F canvas, no second renderer/model/HDR/Spline/network font. R3F owns renderer/geometry/material cleanup; installed Drei `core/Fbo.js` disposes render targets. Scene/motion/runtime listeners and observers have owned removal/disconnection paths. No private Fiber fields are mutated.
- Passive diagnostics count all renderer passes since frame reset, with stable numeric snapshots and no diagnostic render loop. The normal release build excludes the opt-in React Profiler hook.
- GPU retry remounts the visual only and preserves an actual contact draft. A rejected workbench import offers an explicitly labelled page reload and warns about memory edits. A rejected scene import offers an explicitly labelled page reload to retry the visual. Semantic copy, SVG poster, initial fixtures and ordinary links survive enhancement failure.
- Native anchor/history semantics are retained. Deep chapter intent is allowlisted, consumed once and cancelled on unrelated navigation/history/unmount. The section receives focus with `preventScroll`; fragment Back returns to its anchor destination, ordinary Back restores the previous reading position. Header active state uses a viewport-height-derived pixel band and resize/story-ready rescan.
- Real `src/components/contact-form.tsx` has identical Git blob `67962ed40694fc43999ecef5ccb99713d3d6f6cc` at planning base and verified implementation. Saved-response copy means saved, never emailed. Intent does not alter the four-field payload. The existing Classic pipeline builder remains separate.

## Complete capability disposition review

All 48 stable IDs were compared with the approved disposition and current ownership. “Covered” here describes the retained pattern within its stated boundary, not the original institution’s claims or a complete old-site recreation.

| ID | Verified retained home / outcome |
| --- | --- |
| F01 | Locale Inspector: explicit en/ru/kk sample, local metadata and per-key fallback language |
| F02 | Studio header/mobile navigation, active sections, chapter focus; Interface navigation previews |
| F03 | Interface appearance sample with local theme and reset |
| F04 | Explicit owned icon/palette selection; no random cohort or icon network |
| F05 | Scoped text scale, scheme, spacing, grayscale/font and reset; shared static policies |
| F06 | Single Studio scroll bridge, native keys/anchors/history and cleanup |
| F07 | Initial fixtures, local loading/retry and scene poster |
| F08 | Owned pointer-reactive hero core; no inherited Spline scene |
| F09 | Procedural points inside the one shared canvas |
| F10 | Four-chapter deterministic pose choreography; no inherited metrics/masks |
| F11 | Six responsive capability cards with real local routes |
| F12 | Capability matrix depth grammar and owned local gallery |
| F13 | Architecture catalog: three categories with explained illustrative tools |
| F14 | Personally authored author/chapter narrative |
| F15 | Contact intents and local next-action links; no partner claims |
| F16 | Shared owned geometry/pose; no old GLB/CAD/export |
| F17 | Personal authorship and unvalidated venture context |
| F18 | Fixed illustrative DAG and selected-node detail |
| F19 | Owned gallery/lightbox with keyboard, focus trap/return and Escape |
| F20 | Fictional selected milestone timeline |
| F21 | Anonymous local role hierarchy/dialog |
| F22 | Authored engineering-principle disclosures |
| F23 | Compact Architecture stage selector and packet controls |
| F24 | Illustrative support flow; no call/chat/case system |
| F25 | Illustrative approval flow; no procurement |
| F26 | Deterministic packet stepping; no ETL or SQL execution |
| F27 | Illustrative cloud detail; no host/deployment operation |
| F28 | Controls illustration; no detection engine |
| F29 | Four authored engineering chapters and shared progress |
| F30 | Three-option/five-criterion hypothetical comparison table |
| F31 | Deterministic LAB-credit rules and honest stable identifier |
| F32 | Engineering-control explanations; no certification badges |
| F33 | Nineteen invented searchable/filterable/paged notes |
| F34 | Owned static/pauseable CSS/SVG cube sample; no second canvas |
| F35 | Nine fictional roles and seeded/empty/unavailable modes; no recruiting provider |
| F36 | Owned choice/value composition with static alternative |
| F37 | Local validation/manual synthetic form outcomes; separate from real contact |
| F38 | Owned abstract region pins/local details; no geolocation or old addresses |
| F39 | Associated expanded FAQ disclosure panels |
| F40 | Static pattern/status provenance; no operational MCP/metrics |
| F41 | Owned decorative field and focus previews; static/pause behavior |
| F42 | Curve keyboard/numeric/pointer edits, cancellation and reset; no persistence/export |
| F43 | Bento/state grammar and inert sample price explanation; no checkout/auth |
| F44 | Archived placeholder; expressly unbuilt ecommerce hypothesis |
| F45 | Studio local recovery and Interface loading/error/retry states |
| F46 | Selected owned icon/choice samples; archived HTML not embedded |
| F47 | Excluded historical plans: no inherited analytics/CMS/auth/monetary model/export |
| F48 | Eight fixed response examples; no inherited contact transport |

## Source template/document reconciliation

The 13 source page templates and two static documents all retain an explicit disposition. Three locale variants of a template are not counted as independent migrated products.

| Source template/document | Destination / disposition |
| --- | --- |
| `/L` | Author, capability matrix and shared core |
| `/L/about` | Personal narrative, architecture context, Interface gallery/timeline/roles/principles |
| `/L/services` | Illustrative Architecture selector and stages |
| `/L/mission` | Four-chapter engineering narrative |
| `/L/news` | Data Explorer invented Notes |
| `/L/careers` | Data Explorer fictional Sample Roles |
| `/L/contact` | Local Form Workbench; real destination contact remains separate |
| `/L/security` | Engineering controls/disclosures; institutional certifications excluded |
| `/L/digital` | LAB-credit Policy Workflow and hypothetical tradeoff table |
| `/L/faq` | Interface FAQ |
| `/L/ui-lab` | Interface/shared motion patterns, no operational MCP |
| `/L/test-mcp` | Bento/state grammar and inert sample pricing |
| `/L/ecommerce` | Archived placeholder, no commerce product |
| `/temp-animated-icons.html` | Selected owned icon samples, original document archived |
| `/labs/center-lottie-prototype.html` | Selected owned choice sample, original document archived |

The source root locale negotiation is not a fourteenth template. The old API provider/transport, source endpoints, institutional identities, event people/media, metrics, fonts, model files and badges were not imported. No source-repository processing/crawler scripts ran.

## Fresh terminal gates

Final production revision: `e28449340b25e2255af6b1ea9ebf1b0a4f05b7ee` (reflow fixes plus the single dialog-centering rule). Planning base: `5ed0a06`. The commands use this repository’s production build and CI-owned server on 4173 with reuse disabled. No unrelated server is terminated. The ledger and full local logs live under `.superpowers/sdd/2026-10-17-founders-engineering-lab/`.

| Gate | Observed result | Local log |
| --- | --- | --- |
| `npm run check` on final source | Exit 0; lint/types and 66/66 unit tests | `task12-modal-final-check.log` |
| `npm run build` on final source | Exit 0; normal production build | `task12-modal-final-build.log` |
| Profiling build at `a6c9b8f`: `NEXT_PUBLIC_STUDIO_PROFILE=1 npm run build -- --profile` | Exit 0; deliberate profiling build only | `task12-final-profile-build.log` |
| At `a6c9b8f`: `STUDIO_PROFILE_BUILD=1 CI=1 npx playwright test tests/e2e/studio-motion.spec.ts` | Exit 0; 6/6 tests; actual React Profiler positive control 10→12, continuous pointer/wheel gestures 12→12 | `task12-final-profile-browser.log` |
| Unreachable `STUDIO_BASE_URL=http://127.0.0.1:1 ... node scripts/measure-studio.mjs` | Node exits 1 with `fetch failed`; no measurement directory or fabricated success | `task12-final-measure-red.log` |

The first profile capture at `3e25585` is historical. The repeated capture above is explicitly at `a6c9b8f`. The only subsequent production delta is `margin: auto` in the dialog CSS; no React/gesture code changed. Root authorized proportionate verification without repeating the profiling build for that one CSS property. Fresh normal-build functional and hardware gates cover final `e284493`; profiling overhead is absent from those runs.

Host: MacBook Air `Mac15,12`, Apple M3, 24 GB memory. Verification ran on Node `v26.3.0` and npm `11.16.0`, not on a separate supported LTS runtime. The project requires Node ≥22; the root’s same-lockfile `npm ci --ignore-scripts --dry-run --prefer-offline --no-audit --no-fund` succeeded but warned that transitive `@renovatebot/pep440` lists Node 20/22/24. That dry run is lock resolution evidence, not a clean installation or LTS runtime certification. No dependency versions were changed for verification.

## Browser matrix and fault scope

The automated lifecycle/functional gate used Playwright 1.58.2’s bundled Chromium headless-shell revision 1208 (installed browser manifest: 145.0.7632.6). This is distinct from the system Chrome 155 headed hardware measurement below. SwiftShader flags are restricted to scene/integration lifecycle scenarios and do not establish physical GPU performance.

| Area | Evidence and boundary |
| --- | --- |
| Eight Studio documents, no JavaScript | Visible H1, each read-only fixture and ordinary back navigation; fixture scroll-to-view/viewport assertions; six disabled preview buttons; no editable workbench fallback form; real contact controls disabled with email fallback |
| Eight enhanced routes | Axe WCAG A/AA scan, keyboard skip link/focus, effective reduced-motion MQL and zero Studio canvas; 320px doubled actual text glyph ranges across header/main/footer |
| Enhanced headings | Actual visual character bounds with 200% text at 320px after each one-shot reveal; semantic accessible names retained |
| Table | Named focusable region, actual ArrowRight horizontal movement and last-column access; text outside the table reflows |
| Static policies | Explicit pre-navigation emulation and MQL checks; reduced motion, forced colors and 390×844 coarse touch keep the poster/native navigation and usable controls |
| Storage denial | Interface/Locale continue with denied storage; local form initialization and outcomes produce zero storage reads/writes |
| Local form boundary | Pre-navigation request trap allows only the exact initial document, owned assets and bounded framework RSC reads/query keys; Enter does not navigate or serialize data; manual outcomes/cancel/reset preserve edits as specified; zero unexpected requests |
| Real contact | Classic/V2/Studio mocked pending/failure/malformed/saved responses, exact four-field payload, preserved failure drafts and cleared confirmed success; no live valid contact request |
| Lost imports | Intentionally abort two workbench chunk requests, retain visible fixture/ordinary links/no editable fields, explicit warned reload recovers; scene chunk recovery is separately injected |
| WebGL | Denied context preserves poster; recovery scenarios preserve the page/draft and one scene. These are controlled injected failures, not physical driver-crash certification |
| Lifecycle | One actual canvas DOM identity across routes/history, neutral deep-route mode, native fragment/ordinary-history behavior; three repeated route/history cycles keep watched global/MediaQueryList listener counts unchanged and settle scene frames |
| Hidden scene | At most one already queued frame drains; further hidden route/pointer activity produces no continuing scene frames |

The lifecycle monitor counts selected persistent window/document/media-query events, not every browser-internal subscription. Static cleanup inspection complements those counts. In the successful full-run lifecycle capture the unchanged counts included resize 17, media-query change 23, `studio:invalidate` 1 and `studio:story-ready` 1. Software-renderer lifecycle evidence was 26 calls / 9,272 triangles / 13 geometries / 2 textures across all renderer passes; this is not hardware FPS evidence.

Expected faults are identified separately: denied storage, null WebGL contexts, deliberate context loss, aborted enhancement chunks and mocked contact errors. The blocked-workbench capture reported two aborted requests and no uncaught page errors. Ordinary route/accessibility/local-form/lifecycle captures assert zero unexpected page errors.

## Intermediate normal-build regression at a6c9b8f

`npm run build` completed with exit 0 (`task12-final-normal-build.log`). The default two-worker command below completed with **89 passed, 1 intentionally skipped, 1 failed**, exit 1 (`task12-final-browser.log`, 3.5 minutes):

```sh
CI=1 npx playwright test tests/e2e/studio-*.spec.ts tests/e2e/smooth-scroll.spec.ts tests/e2e/site.spec.ts tests/e2e/liquid-glass-shell.spec.ts tests/e2e/liquid-glass-pages.spec.ts
```

The history drill timed out at `studio-integration.spec.ts:143` waiting for an ordinary Architecture link click to become stable within the test’s total 60 seconds. Its retry could not obtain the software canvas and also timed out in teardown. Concurrent SwiftShader work was observed consuming about 254% CPU. This supported a resource-contention hypothesis; it was not sufficient by itself to dismiss a defect.

The **unchanged history case** then passed in isolation in 15.4 seconds, with a fresh CI-owned server, one worker and no retry (`task12-isolated-history.log`). No force click, behavior change or increased timeout was used. The entire selected suite was subsequently run against the same immutable production source and normal build:

```sh
CI=1 npx playwright test tests/e2e/studio-*.spec.ts tests/e2e/smooth-scroll.spec.ts tests/e2e/site.spec.ts tests/e2e/liquid-glass-shell.spec.ts tests/e2e/liquid-glass-pages.spec.ts --workers=1 --retries=0
```

Result: **90 passed, 1 intentionally skipped, 0 failed**, exit 0, 3.0 minutes (`task12-final-browser-serial.log`). The history case passed in 8.8 seconds. The one skip is the explicit profile-build-only case, separately passed in the fresh profiling gate. Serial software rendering is the reproducible local lifecycle gate; the earlier parallel failure is retained as an environment/test concurrency limitation.

Before that serial run, the contact-draft GPU recovery test was strengthened to call the public `WEBGL_lose_context.loseContext()` extension on the actual WebGL2 context, replacing a synthetic DOM event. The draft survived the in-place retry and the test asserted no uncaught page errors. Other scene tests still use clearly injected lifecycle/visibility faults. Changed-test lint and TypeScript checks exited 0 (`task12-final-test-lint.log`, `task12-final-test-types.log`). These runs used unchanged `a6c9b8f`; the later one-property dialog fix is separately rechecked on final `e284493`.

## Final normal-build regression at e284493

The first final-source serial run selected 93 cases and completed with **91 passed, 1 intentionally skipped, 1 failed**, exit 1 (`task12-modal-final-browser-serial.log`). The remaining failure was the Architecture table test's vertical reading setup: native focus on its tall region placed the header above the viewport. The actual text glyph bounds and ArrowRight horizontal movement had already passed. The screenshot showed the lower Stack catalog, not clipped table text (`studio-verification-table-reading-before.png`).

The test now proves the final column fits horizontally inside the named region **before** arranging vertical reading with bounded native PageUp/PageDown presses. It retains region focus and then requires the column to be in the viewport. It does not call scroll-into-view on that column, override native keys, force a click, change production or raise a timeout. Changed-test lint and TypeScript checks exited 0 (`task12-table-harness-lint.log`, `task12-table-harness-types.log`).

The corrected final-source command was:

```sh
CI=1 npx playwright test tests/e2e/studio-*.spec.ts tests/e2e/smooth-scroll.spec.ts tests/e2e/site.spec.ts tests/e2e/liquid-glass-shell.spec.ts tests/e2e/liquid-glass-pages.spec.ts --workers=1 --retries=0
```

Result: **92 passed, 1 intentionally skipped, 0 failed**, exit 0, 3.1 minutes (`task12-modal-final-browser-serial2.log`). The 93-case gate used the fresh normal build `TO2tR2XoHXOMUEMzeAEa6` matching production commit `e28449340b25e2255af6b1ea9ebf1b0a4f05b7ee`. The Architecture reading check passed in 1.2 seconds; the route/history drill in 12.6 seconds; the real WebGL context-loss/contact-draft recovery in 2.5 seconds. The one profile-only skip was separately passed on the stated `a6c9b8f` profiling build; the sole later production delta is dialog CSS margin. No additional broad suite was needed after this GREEN.

## Hardware performance and script accounting

After the final 93-case regression gate and closure of all owned test browsers, the verifier started a fresh owned normal production server on `http://127.0.0.1:4183`. The following final-source measurement completed with exit 0 (`task12-hardware-final-measure.log`), recording clean production source `e28449340b25e2255af6b1ea9ebf1b0a4f05b7ee` and normal build `TO2tR2XoHXOMUEMzeAEa6`:

```sh
STUDIO_BASE_URL=http://127.0.0.1:4183 STUDIO_REPORT_DIR=output/playwright/studio-verification-final STUDIO_DEVICE='MacBook Air Mac15,12; Apple M3; 24 GB' node scripts/measure-studio.mjs
```

Observed browser **Chrome 155.0.8059.85**, macOS **26.7.1** / Darwin 25.6.0 arm64, real integrated **Apple M3**. Renderer: `ANGLE (Apple, ANGLE Metal Renderer: Apple M3, Version 26.7.1 (Build 25G241))`; software flag false. This was a headed temporary browser context, document visible and focused, viewport 1440×900, DPR 1, no CPU/network throttling, effective no-preference motion, no profiling hook. Display inventory immediately afterward reported an external **2560×1440, 180 Hz LED monitor**. Refresh conditions matter; these are not universal 60 fps or physical presentation-time claims.

The scene and JavaScript were warmed in the same document before a full down/up scroll. HTTP caching was disabled by the contact request interception; no reload occurred during the measured gesture. CPU/background desktop activity outside the owned browser was not artificially controlled. The scroll distance was 3,447 CSS pixels, wheel step 115, and sampled scene progress covered 0 through 1.

| Budget | Observation | Result |
| --- | --- | --- |
| Warm p95 frame interval ≤16.7 ms | 852 requestAnimationFrame intervals; p50 11.1 ms, p95 **16.6 ms**, max 22.7 ms, no interval above 50 ms | Met narrowly in these conditions |
| No repeated animation-caused >50 ms main-thread tasks | Raw trace contains **no >50 ms complete events on CrRendererMain** during the marked scroll and idle capture; two later observer tasks are disclosed below | Met in recorded capture; later tasks are outside its evidence window |
| ≤100 scene draw calls | **26**, all renderer passes since frame reset | Met |
| ≤100,000 rendered triangles | **9,272**, including transmission passes | Met |
| Scene stops ≤1 second after final wheel input | Last changed frame observed by **598.2 ms**, then frame count 1,188 remained unchanged through 1,341.4 ms | Met; sampled observation gives an upper bound |
| Initial enhancement ≤350 KiB gzip | **224,517 bytes = 219.25 KiB**, 15 script resources | Met under accounting below |
| Deferred scene ≤450 KiB gzip | **249,545 bytes = 243.70 KiB**, two additional script resources | Met under accounting below |

No formal budget flag failed for this named hardware run. Renderer memory counters peaked at 13 geometries and two textures, with zero unexpected page errors. The raw trace has 1,055,890 events; inspection identified CrRendererMain (pid 53634, tid 1767258) and found no complete event above 50 ms. The marked scroll spans performance times 5,998.7–14,392.4 ms, and idle capture ends at 15,855.9 ms.

The PerformanceObserver remained attached while the script collected trace artifacts. It recorded **71 ms** and **53 ms** tasks beginning at **36,891.6 ms** and **36,962.8 ms**: more than 21 seconds after idle capture ended and after tracing stopped. Both observations remain in the final JSON. Their underlying call stacks are outside the recorded trace, so their cause is unverified; they cannot establish a recurring animation task within the measured gesture. This report does not claim that the whole script run had no long tasks.

RequestAnimationFrame intervals describe callback opportunities, not hardware presentation timestamps or proof of universal frame delivery. The final p95 is close to the 16.7 ms threshold. For comparison, the preserved pre-dialog-CSS baseline at `a6c9b8f`, normal build `ROhR1X2jI5AkOHlvoLBX8`, recorded p95 11.2 ms (753 samples), no observer long tasks and an 815.1 ms idle bound. Its original directory and `task12-hardware-measure.log` remain intact. The difference demonstrates run variability; the final-source result above is the primary release evidence.

Accounting is deliberately explicit: the initial group is every same-origin Next script response body during static reduced-motion Studio entry, including framework/runtime code. Deferred scene is the additional script paths fetched when the same page switches to interactive motion. Each resource is independently gzipped. HTML, CSS, RSC data, inline server payloads, fonts and unrequested workbench views are excluded. This is the defined enhancement split, not total normal-route transfer or a promise that all six workbenches together fit the initial group. The JSON contains every included path and raw/gzip byte count.

Local artifacts (intentionally ignored, not committed):

- `output/playwright/studio-verification-final/measurement.json` — final source/build, environment, scripts, budgets and idle series.
- `output/playwright/studio-verification-final/samples.json` — raw callback intervals, per-sample scene counters and both later long-task observations.
- `output/playwright/studio-verification-final/trace.json` — 242 MiB final Chrome trace.
- `output/playwright/studio-verification-final/trace-inspection.json` — exact marks, renderer-thread/task inspection and sanitized display inventory.
- `output/playwright/studio-verification-final/desktop.png` — final normal-build hardware preview capture.
- `output/playwright/studio-verification/` — unchanged named `a6c9b8f` baseline, including its 201 MiB trace.
- `output/playwright/studio-verification-mobile.png` — 390×844 coarse-touch emulation.
- `output/playwright/studio-reflow-{header,hero,architecture}-200.png` — writer’s inspected final enlarged-text captures.

## Native Safari and coverage limits

Root independently operated native **Safari 27.0 (21625.1.29.18.28)** against the `a6c9b8f` normal build on the owned 4183 server. The existing profile and Dark Reader, 1Blocker Scripts, uBlock Origin Lite and 1Blocker Actions toolbar extensions were left unchanged. Observed: readable hero and owned SVG poster; native Capabilities anchor with a visible focus ring; actual Policy matrix preview through validate → evaluate → receipt `LAB-0240-A-EDUCATION`; direct Interface Lab route; Motion & media initially paused; Abstract gallery → Layer study lightbox → Escape dismissal; deep-header Capabilities navigation returned to the correct focused chapter. No real contact was filled or submitted.

This is a bounded native Safari functional spot check, not the full Chromium matrix or a Safari WebGL/FPS certification. The poster was observed; the reason for that native policy/fallback was not instrumented. The gallery dialog appeared flush upper-left while remaining functional; final Chromium bounds reproduced that defect and verified the writer's one-property fix at both desktop and 320×320, including actual keyboard scrolling in the short viewport.

The final `e284493` Safari centering-only recheck was **not completed**. After one automation timeout following gallery selection, the automation explicitly reported that the user had changed Safari; a fresh read showed the owned tab at `/studio/connect`. Root stopped native actions to avoid interfering with the user. Root filled or submitted no contact fields. This interruption is a coverage limit, not a demonstrated site defect. Final Safari centering therefore remains unverified; the passing final centering evidence is Chromium's two actual-bounds cases.

**Not verified:** a physical iPhone Safari, physical Android Chrome, Safari GPU performance, screen-reader/VoiceOver operation or a separate Node LTS/clean-install run. Mobile browser emulation and automated accessibility checks do not certify those physical/assistive environments. The available local iOS device utility was absent; no physical mobile run was represented as completed.

## Verification disposition

The final observed preview meets its automated functional, failure-recovery and named-hardware budgets, with the close p95 threshold, prior parallel-rendering failure, post-capture observer tasks and device gaps disclosed above. The reproduced reflow and dialog-placement defects have focused passing regressions on the final production source. The verification change contains only tests, the measurement script and documentation. Root promotion, pushing and deployment are outside this verification and have not been performed.
