# Founder’s Engineering Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL after explicit approval: use `superpowers:subagent-driven-development` or `superpowers:executing-plans` task by task, adapted to the user’s preserved sequential roles: Subagent 3 implements the engine, scene/motion foundation and migrated/restyled modules/integration (Tasks 1–11); Subagent 4 then independently verifies performance/release readiness (Task 12). A fresh reviewer checks each deliverable before its dependent task proceeds. Steps use checkbox (`- [ ]`) syntax. Do not start either execution role during this planning phase.

**Goal:** Build an honest personal engineering flagship and startup validation lab with a four-chapter Studio preview, one owned scene and six inspectable local demos.

**Architecture:** Next.js Server Components provide semantic routes/content; a Studio-only client runtime owns one Lenis/GSAP lifecycle and one persistent background R3F canvas. Business modules keep pure deterministic engines/fixtures separate from DOM presentation and motion, with a data-only registry and explicit lazy view map. Existing personal content and real contact remain shared with Classic/V2.

**Tech Stack:** Existing Next 16.4.0, React/DOM 19.3.0, TypeScript, Tailwind 4.3.3, Three 0.186.1, Lenis 1.3.26, Zod 3.25.76; candidate additions Fiber 9.8.2, Drei 10.7.9, Motion 14.3.0, GSAP 3.15.0, `@gsap/react` 2.1.2. Node ≥22. Versions are metadata candidates, not installed/verified results.

**Spec:** [2026-10-17-founders-engineering-lab-design.md](../specs/2026-10-17-founders-engineering-lab-design.md). Read it and the [complete inventory](../specs/2026-10-17-ddcnb-feature-inventory.md) before execution.

## Global Constraints

- Preserve `/` and `/v2`; implement the proposed preview only at `/studio`, `/studio/modules/[slug]`, and `/studio/connect`.
- Keep Next.js 16 App Router, TypeScript and Tailwind 4; use `lenis/react`, GSAP + ScrollTrigger, `@react-three/fiber`, `@react-three/drei`, existing Three.js, and `motion/react` only.
- Mount one persistent background `SceneCanvas` in the Studio layout; business modules must not import Three.js, R3F or scene internals.
- Use refs, MotionValues, CSS variables or `useFrame` for continuous pointer/scroll work; never call React state setters on those continuous paths.
- Keep engines pure and deterministic, fixtures synthetic, the registry data-only, and each module view lazy loaded.
- Label demo outputs `Seeded demo` or `Local simulation`; no legacy endpoints, identity, metrics, certifications, fonts, people/media or proprietary scene assets enter Studio.
- Keep the existing real contact API separate from the local form workbench; confirmed API success means a message was saved, never emailed.
- No implementation, package installation, configuration changes, implementation commit, push or deployment is authorized until the user approves the design and plan; reviewed planning documents may be committed locally.

All paths below are repository-relative to `/Users/namazbekbekzhanov/AntigravityProjects/my_personal_website`. Commit steps are future approved execution checkpoints, not authorization to commit now. Stage only each task’s owned files. If a meaningful failing test already passes, confirm it exercises the intended behavior rather than manufacturing a failure. Capture fresh failure/pass output; no historical result is proof.

**Fresh browser-output rule:** the existing `playwright.config.js` starts a production Next server. Before every browser check following a source change, run `npm run build` for that exact working tree, then start a fresh test-owned production server. Every browser command below must run with `CI=1` to disable `reuseExistingServer`; a server from an earlier build must never satisfy a pass. Keep port 4173 free for that managed server; do not terminate an unrelated process. If unavailable, the builder may add a narrowly scoped Studio test config on an unused port with the same production command and reuse disabled. Record the build and server used for evidence. Adjacent checks without edits may share the same fresh build; any subsequent edit requires rebuilding and restarting before a browser pass.

## Review Focus

1. Direct module links and repeated back/forward navigation must leave one scene, neutral deep-route pose and no stale landing triggers (Tasks 2–4, browser test).
2. Coarse pointers, reduced motion, forced colors, lost WebGL and denied storage preserve reading, native scrolling and enhanced keyboard controls. No-JavaScript/failed-import modes preserve read-only server fixtures and ordinary links, with demo controls disabled and no native input submission; real contact retains its email fallback (Tasks 2–4, 8–9, 12).
3. Empty/malformed inputs, page shrinkage after filters and mid-workflow cancellation must produce stable local results without late completion or mutation (Tasks 5–7, 10).
4. Demo interactions must never call a provider or persist input; real contact failure must preserve text, and confirmed storage alone may clear it (Tasks 6, 10–11).
5. Unknown slugs/commands and malformed/repeated intent values must fail safely without reflecting input, navigating externally or exposing PII (Tasks 1, 4, 11).

---

## File ownership and dependency map

`src/features/studio/` is the new cohesive feature boundary. `content/` holds authored story/venture data; `modules/registry.ts` is metadata only; module folders contain `domain.ts`, `fixtures.ts`, `view.tsx`; `runtime/` owns scroll and mutable scene signals; `scene/` owns all graphics; `components/` owns Studio DOM composition. Scoped CSS modules live beside components. No all-purpose global provider or copied source stylesheet.

Task graph: 1 → 2 → 3A → 3 → 4 → 4A → {5,6,7,8,9,10} → 11 → 12. Subagent 3 executes implementation tasks sequentially, even where module tasks are independently reviewable. Tasks 1–11, including 3A/4A, must be complete before Subagent 4 starts independent release verification. Avoid duplicate tests for static markup/CSS; unit tests target behavior and browser tests target the actual user flow.

### Task 1: Lock content, registry and integration contracts

**Owner / dependencies:** Subagent 3; explicit approval first.

**Files:** Create `src/features/studio/modules/types.ts`, `src/features/studio/modules/registry.ts`, `src/features/studio/content/story.ts`, `src/features/studio/content/ventures.ts`, `src/features/studio/runtime/signals.ts`, `tests/unit/studio-contracts.test.ts`.

**Interfaces:**

```ts
type ModuleSlug = 'policy-workflow' | 'data-explorer' | 'architecture' | 'interface-lab' | 'locale-inspector' | 'form-workbench';
type ConnectIntent = 'cofound' | 'invest' | 'partner';
type DemoState = 'idle' | 'invalid' | 'pending' | 'success' | 'unavailable' | 'error';
interface ModuleDefinition { slug: ModuleSlug; title: string; summary: string; boundary: 'Seeded demo' | 'Local simulation'; featureIds: readonly string[]; initialSample: readonly {label:string;value:string}[] }
interface ModuleViewProps { definition: ModuleDefinition }
type SceneRouteMode = 'story' | 'ambient';
interface SceneSignals { mode: SceneRouteMode; chapter: number; progress: number; pointerX: number; pointerY: number; paused: boolean }
getModule(slug: string): ModuleDefinition | undefined;
createSceneSignals(): SceneSignals;
resetSceneSignals(signals: SceneSignals, mode: SceneRouteMode): void;
```

`ModuleDefinition` values are serializable data only, with no component/import/fetch references. Registry has exactly six ordered entries, each with two to four authored sample label/value pairs for the read-only server fallback. `createSceneSignals` starts ambient, chapter/progress/pointers zero and paused false; reset mutates that stable object. Story data uses the spec’s four IDs and proposed heading; ventures explicitly carry validating/hypothesis status and no traction fields. Do not copy source identity text.

- [ ] Write `studio-contracts.test.ts`: six unique slugs; unknown slug returns undefined; registry JSON round-trips with two to four nonempty sample label/value pairs per entry; four unique chapter IDs; every venture is validating and has a next validation step; reset clears previous progress/pointer/mode while preserving object identity.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-contracts.test.ts`; expect missing-module/contract failures before implementation.
- [ ] Implement the exact interfaces and authored data above, using approved destination profile data only for identity; keep unsupported historical F44/F47 in spec disposition rather than invented executable modules.
- [ ] Run the same test and `npm run typecheck`; expect all assertions and types pass. Review the content against the spec’s claim/identity boundaries.
- [ ] Commit only the listed deliverable as `feat(studio): define lab contracts and authored content`.

### Task 2: Give Studio one scroll owner and stable route lifecycle

**Owner / dependencies:** Subagent 3; Task 1.

**Files:** Modify `src/components/layout/smooth-scroll.tsx`; create `src/features/studio/runtime/route-mode.ts`, `src/features/studio/runtime/studio-runtime.tsx`, `src/features/studio/runtime/scroll-bridge.ts`, `tests/unit/studio-route-mode.test.ts`, `tests/e2e/studio-runtime.spec.ts`; modify `package.json`, `package-lock.json` only for approved dependency pins.

**Interfaces:** `isStudioPath(pathname: string): boolean`; `getSceneRouteMode(pathname: string): SceneRouteMode`; `StudioRuntime({children}: {children: React.ReactNode}): React.JSX.Element`; `useStudioSignals(): SceneSignals`; `useStudioVelocity(): MotionValue<number>` from `motion/react`; `connectScrollBridge(input: {lenis: Pick<Lenis,'raf'|'on'|'off'>; update: () => void; ticker: {add(fn:(seconds:number)=>void):void; remove(fn:(seconds:number)=>void):void}}): () => void`. The bridge passes seconds ×1000 and returns idempotent cleanup. Runtime owns a stable signals object and shared velocity MotionValue (Lenis velocity during active enhancement, zero on rest/native/deep-route reset), exposed through Studio-only context; no React updates from scroll/pointer. Exact `/studio` is story, nested Studio routes ambient; `/studio-other` is outside.

- [ ] Write route/bridge unit assertions: exact namespace boundaries, neutral mode for module/connect URLs, ticker value 2 → Lenis raf 2000, scroll invokes update once, cleanup detaches its callback/listener once. Add browser cases for Classic → Studio → module → back → Classic and native input/dialog/key scrolling; assert no duplicated movement or stale pose through user-visible behavior and a development-only test harness when necessary.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-route-mode.test.ts`; expect missing-function failures. Record browser route failures once Task 4’s route shell exists; do not start a server during planning.
- [ ] Recheck npm peer/engine compatibility for candidate packages; install the exact approved candidates, keeping Three/Lenis/Zod pins. Review lockfile/licenses; use `motion/react`, no `framer-motion` or postprocessing dependency. Read installed Next guides named in the spec before coding client boundaries.
- [ ] Implement the namespace guard in the existing SmoothScroll effect so its previous cleanup runs on entry, then skip its setup. Build ReactLenis root with `autoRaf:false`, one bridge and local GSAP context. Only eligible fine-pointer desktop/no-reduced-motion uses enhancement; native touch, keys, focus, history and anchors retain native behavior. Remove owned listeners/ticker/context on unmount; no global killAll or global lag-smoothing change.
- [ ] Run the focused unit test and `npm run typecheck`; expect pass. After Task 4, run `CI=1 npx playwright test tests/e2e/studio-runtime.spec.ts tests/e2e/smooth-scroll.spec.ts`; expect Studio lifecycle and existing scrolling pass, with no real contact calls.
- [ ] Commit the listed files as `feat(studio): isolate synchronized scroll runtime` after the unit contract/typecheck passes. Browser integration is a separate mandatory gate in Task 4 once the route exists.

### Task 3A: Define pure core pose choreography

**Owner / dependencies:** Subagent 3; Tasks 1–2; completes before Task 3.

**Files:** Create `src/features/studio/scene/core-pose.ts`, `tests/unit/studio-core-pose.test.ts`.

**Interfaces:** `PoseChannel = 'rotationX'|'rotationY'|'rotationZ'|'scale'|'cameraX'|'cameraY'|'cameraZ'|'layerExpansion'|'distortion'|'lightIntensity'`; `poseChannelAt(progress:number,channel:PoseChannel,mode:SceneRouteMode): number`. This pure engine has no React/Three import or side effects. Its frozen keyframes use the design’s exact six-row pose table. Finite progress clamps 0..1; nonfinite becomes 0; ambient ignores progress. Each interval uses smoothstep interpolation. The frame adapter samples scalar channels into already-owned vectors/material properties, avoiding new per-frame objects.

- [ ] Write tests for every channel at 0/0.25/0.5/0.75/1 and neutral ambient; clamp negative/>1; NaN/infinity safely map0; repeated calls equal; values at each boundary ±0.000001 converge within 0.0001 and stay within neighboring endpoint bounds. Fixtures/keyframes remain unchanged.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-core-pose.test.ts`; expect missing-engine failure.
- [ ] Implement the pure sampler and frozen keyframes with the spec’s exact rotation/scale/camera/expansion/distortion/lighting values. Do not allocate inside channel sampling or add a rendering dependency.
- [ ] Run the test and typecheck; expect pass with finite/continuous results for all channels.
- [ ] Commit only listed files as `feat(studio): define deterministic core pose choreography`.

### Task 3: Build one owned scene with a reliable poster

**Owner / dependencies:** Subagent 3; Tasks 1–2 and 3A.

**Files:** Create `src/features/studio/scene/scene-host.tsx`, `scene-canvas.tsx`, `engineering-core.tsx`, `scene-policy.ts`, `scene-poster.tsx`, `scene.module.css`, `tests/unit/studio-scene-policy.test.ts`, `tests/e2e/studio-scene.spec.ts` (all scene files under `src/features/studio/scene/`).

**Interfaces:** `SceneHost(): React.JSX.Element`; default `SceneCanvas({signals}: {signals: SceneSignals}): React.JSX.Element`; `EngineeringCore({signals}: {signals: SceneSignals}): React.JSX.Element`; `getScenePolicy(input: {reducedMotion:boolean; coarsePointer:boolean; forcedColors:boolean; webglAvailable:boolean; hidden:boolean}): 'poster' | 'paused' | 'interactive'`; `ScenePoster(): React.JSX.Element`. Policy returns poster for reduced/coarse/forced/no-WebGL, paused when hidden otherwise, interactive otherwise. Only scene files import Three/Fiber/Drei.

- [ ] Write the policy truth-table test, including combined conditions (poster takes precedence over hidden). Add browser expectations for a readable hero before scene load, at most one Studio canvas, poster on denied WebGL, context-loss recovery/retry, no canvas on reduced/coarse/forced-color policies, neutral scene on module deep link, and no continuing render requests while hidden/settled.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-scene-policy.test.ts`; expect missing-policy failure. Scene browser cases should fail before the scene is implemented; run them against the approved implementation server once Task 4 makes the route reachable.
- [ ] Implement the Client SceneHost dynamic import with `ssr:false` and error boundary, readable SVG poster and retry. Canvas persists in Studio layout. Build procedural shell/plates/instanced nodes only; `MeshTransmissionMaterial` resolution 256 / samples 4 / backside false, DPR cap1.5, demand rendering, bounded geometry and no postprocessing. Consume Task 3A’s sampler for rotation/scale/camera/layer expansion/material distortion/light intensity, writing existing vectors/uniforms only. Use signals/useFrame, invalidate only while settling, pause hidden/offscreen, and own/dispose resources/listeners/FBOs on unmount.
- [ ] Run the unit test and typecheck, then the scene browser tests after Task 4; expect all policy/fallback/lifecycle assertions pass. Capture initial draw-call/triangle and settling evidence rather than claiming 60fps.
- [ ] Commit listed files as `feat(studio): add persistent procedural engineering core` after the policy unit contract/typecheck passes. Real scene browser integration is a separate mandatory gate in Task 4.

### Task 4: Deliver the four-chapter preview and lazy module frame

**Owner / dependencies:** Subagent 3; Tasks 1–3. This is the foundation review gate before module implementation.

**Files:** Create `src/app/studio/layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `src/app/studio/[...missing]/page.tsx`, `src/app/studio/modules/[slug]/page.tsx`, `src/features/studio/components/studio-shell.tsx`, `story-chapters.tsx`, `capability-matrix.tsx`, `module-frame.tsx`, `module-loader.tsx`, `studio.module.css` (components in `src/features/studio/components/`); create `tests/e2e/studio-shell.spec.ts`. Do not modify sitemap or Classic/V2 chrome.

**Interfaces:** `StudioShell({children,profile}: {children:React.ReactNode;profile:Profile}): React.JSX.Element`; `StoryChapters(): React.JSX.Element`; `CapabilityMatrix(): React.JSX.Element`; `ModuleFrame({definition,children}: {definition:ModuleDefinition;children:React.ReactNode}): React.JSX.Element`; `ModuleLoader({definition}: ModuleViewProps): React.JSX.Element`. Await `params:Promise<{slug:string}>`. Server ModuleFrame renders `definition.initialSample` directly, independent of lazy client code. Demo controls remain disabled until their view loads and hydrates; action buttons cannot submit natively. ModuleLoader uses a separate explicit map of six literal client dynamic imports; until Tasks 5–10 exist, show truthful initial sample/unbuilt enhancement text and do not import missing files. Final map completion is required by Task 12. The Studio catch-all and unknown module slugs call `notFound()` and retain Studio recovery.

- [ ] Write shell browser tests for semantic unsplit H1, four anchors, six valid module links, unknown-slug/unmatched-Studio404, self canonical/noindex, no Studio sitemap entry, keyboard mobile navigation, 320px no horizontal overflow, ordinary links/read-only server fixtures with JavaScript disabled, disabled fallback demo controls with no input serialization, and loading/import-error recovery. Add motion-enabled route loops to Tasks 2–3 tests so defaults do not mask the scene.
- [ ] Run `CI=1 npx playwright test tests/e2e/studio-shell.spec.ts`; expect missing Studio route/content assertions to fail on an approved baseline server. No server/build/tests run during planning.
- [ ] Implement server layout/content via existing `getProfile`, StudioRuntime and SceneHost. Implement scoped visual tokens/responsive Bento and semantic poster-first chapters. Use one lightweight selected-preview slot, no eager six-module imports. Register chapter triggers only on landing, revert them on deep-route change and reset signals to ambient; rebind/refresh on return. Keep pins ≤one viewport per transition and remove them for native policies; no visual split hides semantic text.
- [ ] Run `npm run check`, approved build, and `CI=1 npx playwright test tests/e2e/studio-shell.spec.ts tests/e2e/studio-runtime.spec.ts tests/e2e/studio-scene.spec.ts tests/e2e/smooth-scroll.spec.ts`; expect all pass. Confirm `/` and `/v2` still load and there is one Studio canvas. Record actual dependency versions and any known limits for eventual independent verification.
- [ ] Commit the listed shell files as `feat(studio): compose four chapter lab preview`; have a fresh reviewer check Tasks 1–4 before Subagent 3 continues with module implementation using the exact interfaces above.

### Task 4A: Add the explicit motion interaction system

**Owner / dependencies:** Subagent 3; Tasks 2–4; complete before module styling.

**Files:** Create `src/features/studio/motion/interaction-policy.ts`, `custom-magnetic-cursor.tsx`, `magnetic-action.tsx`, `tilt-card.tsx`, `kinetic-heading.tsx`, `motion.module.css` (all under `src/features/studio/motion/`); modify `src/features/studio/components/studio-shell.tsx`, `capability-matrix.tsx`, `story-chapters.tsx`; create `tests/unit/studio-motion.test.ts`, `tests/e2e/studio-motion.spec.ts`.

**Interfaces:** `getInteractionPolicy(input:{coarsePointer:boolean;reducedMotion:boolean;forcedColors:boolean}): 'static'|'enhanced'`; `velocityToSkew(velocity:number): number` clamps finite `velocity*0.04` to−4..4 degrees and returns 0 for nonfinite; `CustomMagneticCursor(): React.JSX.Element|null`; `MagneticAction({children}:{children:React.ReactElement}): React.JSX.Element`; `TiltCard({children}:{children:React.ReactNode}): React.JSX.Element`; `KineticHeading({text,as}:{text:string;as:'h1'|'h2'}): React.JSX.Element`. MagneticAction wraps one native anchor/button without intercepting its semantics; stable hitbox remains at least 44×44. TiltCard decoration rotates at most ±4°; radial spotlight position uses CSS variables. KineticHeading consumes `useStudioVelocity()`; staggered visual character spans are aria-hidden, while unsplit semantic text remains the accessible name and first/no-JS render. Focus always uses a static readable pose.

- [ ] Write unit policy/velocity tests for all static conditions, bounded positive/negative/zero/nonfinite velocity. Browser with motion enabled: native cursor remains; decorative follower is aria-hidden; magnetic child can still activate at original hitbox edges; TiltCard spotlight/tilt responds without changing button bounds; heading accessible name equals unsplit text and remains readable before hydration/no-JS; velocity skew resets at rest. Check touch/reduced/forced-color policies, keyboard focus, pointerleave/cancel and route unmount remove effects. Use a short React Profiler capture to verify pointer/scroll gestures do not trigger repeated component commits; test behavior rather than CSS source strings.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-motion.test.ts` and the focused browser test on the approved server; expect missing-policy/interaction assertions before implementation.
- [ ] Implement pure policy/skew mapping and components with refs, MotionValues and scoped CSS variables; no pointer/scroll React state. Install the decorative cursor once in the Studio shell; apply magnetic treatment to chapter actions, TiltCard to capability/venture cards and KineticHeading to editorial chapter headings. Stagger only the visual layer after hydration; shared velocity drives skew without another scroll listener/RAF loop. Cleanup resets local transforms/listeners; native cursor and focus behavior remain usable.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-motion.spec.ts`; expect pass across enhanced/static policies. Record Profiler observation and remaining device limits for Subagent 4.
- [ ] Commit listed files as `feat(studio): add accessible magnetic and kinetic motion`.

### Task 5: Implement the deterministic policy workflow

**Owner / dependencies:** Subagent 3; reviewed Tasks 1–4.

**Files:** Create `src/features/studio/modules/policy-workflow/domain.ts`, `fixtures.ts`, `view.tsx`, `tests/unit/studio-policy.test.ts`, `tests/e2e/studio-policy.spec.ts`; update only its loader entry in `src/features/studio/components/module-loader.tsx`.

**Interfaces:** `PolicyInput = {credits:number;recipient:'hub-a'|'hub-b';category:'education'|'tools'|'travel'}`; `PolicyResult = {allowed:boolean;reasons:readonly ('recipient'|'category'|'limit')[];receiptId:string}`; `parsePolicyInput(value:unknown): {ok:true;value:PolicyInput}|{ok:false;errors:readonly string[]}`; `evaluatePolicy(input:PolicyInput): PolicyResult`; `PolicyStep = 'input'|'validation'|'policy'|'receipt'`; `nextPolicyStep(step:PolicyStep): PolicyStep`; default `PolicyWorkflowView(props:ModuleViewProps): React.JSX.Element`. Invalid nonpositive/noninteger/nonfinite credits never reach evaluation. Valid credits >1000 yield limit denial. Receipt format is `LAB-${credits padded to4}-${A or B}-${CATEGORY uppercase}`; it is an identifier, not cryptography. Reasons appear in recipient/category/limit order.

- [ ] Write unit assertions for all three presets, boundaries 1/1000/1001, invalid0/negative/fraction/NaN/Infinity/empty/unknown enum, stable repeated receipt `LAB-0100-A-TOOLS`, multiple denial reason ordering, and input objects unchanged. Browser: advance/back/cancel/reset with no late result; keyboard flow and local-label visibility; block/fail any fetch from the demo.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-policy.test.ts`; expect missing-domain failure.
- [ ] Implement pure parsing/evaluation/step functions and fixtures; implement manual phase controls with editable input and cancel. Never create timer-driven phases, transaction/hash/chain claims or transport.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-policy.spec.ts`; expect pass with zero demo network calls and reset to identical fixture.
- [ ] Commit listed files as `feat(studio): add deterministic policy workbench`.

### Task 6: Implement Notes and Sample Roles with honest provenance

**Owner / dependencies:** Subagent 3; Task 4.

**Files:** Create `src/features/studio/modules/data-explorer/domain.ts`, `fixtures.ts`, `view.tsx`, `tests/unit/studio-data-explorer.test.ts`, `tests/e2e/studio-data-explorer.spec.ts`; update its loader entry.

**Interfaces:** `Note = {id:string;title:string;summary:string;terms:readonly string[];category:'systems'|'interfaces'|'workflows'|'research';date:string}`; `SampleRole = {id:string;title:string;department:string;location:string;kind:'full-time'|'contract';description:string}`; `Page<T> = {items:readonly T[];total:number;page:number;pages:number}`; `searchNotes(notes:readonly Note[],query:string,category:Note['category']|'all',page:number): Page<Note>`; `searchRoles(roles:readonly SampleRole[],query:string,department:string|'all',page:number): Page<SampleRole>`; `getRoleFixture(mode:'seeded'|'empty'|'unavailable'): {state:'ready'|'empty'|'unavailable';roles:readonly SampleRole[]}`; default `DataExplorerView(props:ModuleViewProps): React.JSX.Element`. Page size6, page count at least1, clamp page to1..pages; query trims/case-folds/collapses whitespace. Separate schemas; no structural cast between notes/roles.

- [ ] Write tests for 19 notes / 9 roles, Unicode/case/whitespace matching, notes terms/summary search, category intersection, zero matches, invalid page clamping, filtering page 4 to one result returns page 1, no mutation, roles unavailable has no stale roles. Browser: mode change clears old selection/page, local detail focus trap/Escape/return, visible provenance and retry, no news/recruiting network requests.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-data-explorer.test.ts`; expect missing-engine failure.
- [ ] Implement engines and invented fixtures without old IDs/media/URLs/salary data; implement shared control/paging presentation with distinct labels. Roles mode says sample team roles, no hiring/apply claims. Details remain local; no external links or API adapter.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-data-explorer.spec.ts`; expect pass with network traps untriggered.
- [ ] Commit listed files as `feat(studio): add seeded notes and role explorer`.

### Task 7: Implement a fixed architecture inspector

**Owner / dependencies:** Subagent 3; Task 4.

**Files:** Create `src/features/studio/modules/architecture/domain.ts`, `fixtures.ts`, `view.tsx`, `tests/unit/studio-architecture.test.ts`, `tests/e2e/studio-architecture.spec.ts`; update its loader entry. Do not alter or embed `src/components/lab/pipeline-builder.tsx`.

**Interfaces:** `StageId = 'source'|'validate'|'transform'|'serve'`; `PacketState = {stage:StageId;complete:boolean}`; `advancePacket(state:PacketState): PacketState`; `resetPacket(): PacketState`; `ServiceIllustration = 'support'|'approval'|'data'|'cloud'|'controls'`; `ArchitectureOption = {id:'batch'|'stream'|'hybrid';label:string;scores:Readonly<Record<'latency'|'cost'|'complexity'|'recovery'|'auditability',number>>}`; `StackCategory = 'project-tooling'|'platform-systems'|'development-tools'`; `StackEntry = {id:string;category:StackCategory;name:string;explanation:string}`; default `ArchitectureView(props:ModuleViewProps): React.JSX.Element`. Fixed stages in that order; advance after serve marks complete; repeated advance stays complete. Static scores 0..5 are explicitly hypothetical comparisons, not benchmarks. A compact local stack catalog retains F13 with at least two explained entries per category, demonstrating illustrative roles/tradeoffs without claiming installed integrations.

- [ ] Write tests for four ordered transitions, idempotent completion/reset, frozen fixture preservation, DAG nodes/edges matching the four stages, comparison criteria/options complete, and unique stack IDs with at least two nonempty explanations per category. Browser: keyboard select/advance/cancel/reset; five selectable illustration tabs; real table headings and an ordered diagram alternative; stack-category selection displays matching explanations and can reset; no claim of running jobs/telemetry/integrations.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-architecture.test.ts`; expect missing-domain failure.
- [ ] Implement the pure fixed stepper and illustrative fixtures; use DOM/SVG node buttons, stage tabs, comparison table and categorized stack catalog with locally authored explanations. Scroll/pointer animation uses refs/CSS variables; no React updates on continuous input. This is an inspector, not a graph editor or operational console.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-architecture.spec.ts`; expect pass; manually confirm Classic’s existing builder remains separate.
- [ ] Commit listed files as `feat(studio): add illustrative architecture inspector`.

### Task 8: Consolidate Interface Lab into purposeful samples

**Owner / dependencies:** Subagent 3; Task 4.

**Files:** Create `src/features/studio/modules/interface-lab/domain.ts`, `fixtures.ts`, `view.tsx`, `samples/navigation-sample.tsx`, `samples/state-sample.tsx`, `samples/motion-sample.tsx`, `samples/curve-sample.tsx`, `interface-lab.module.css` (all under the module folder); create `tests/unit/studio-interface-lab.test.ts`, `tests/e2e/studio-interface-lab.spec.ts`; update its loader entry.

**Interfaces:** `SampleGroup = 'navigation'|'states'|'motion'`; `CurvePoint = {x:number;y:number}`; `Curve = readonly [CurvePoint,CurvePoint,CurvePoint,CurvePoint]`; `moveCurvePoint(curve:Curve,index:0|1|2|3,point:CurvePoint): Curve`; `normalizeSamplePreferences(value:unknown): {theme:'dark'|'light';scale:100|125|150|200;spacing:'normal'|'wide';palette:'ice'|'mint';scheme:'default'|'high-contrast'|'warm';grayscale:boolean;font:'sans'|'serif'}`; default `InterfaceLabView(props:ModuleViewProps): React.JSX.Element`. Curve coordinates clamp to 0..100; nonfinite edits preserve original value. Preferences only affect the sample; optional storage key `nb-studio-interface` must tolerate denial/invalid values. Invalid preferences fall back to dark/100/normal/ice/default/false/sans.

- [ ] Write unit tests for curve clamping/nonfinite/no mutation, invalid preference fallback, and exact fixture reset. Browser: navigation focus preview/mobile menu/Escape; FAQ expanded/panel linkage; loading/error/retry controls; gallery lightbox focus trap/return; anonymous role tree/principle disclosure; timeline selection and abstract region pins; sample status/price inert explanation; theme/icon/palette/text-scale reset and storage denied. Curve keyboard/numeric edits must reach the same point as pointer edit; pointer cancel restores prior curve. Pause/static stops animated dots/cube/icons/choice/curve, reduced motion starts static.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-interface-lab.test.ts`; expect missing-domain failure. Run focused browser tests after each sample group is reachable, expecting missing behavior first.
- [ ] Implement domain/fixtures and three mutually exclusive sample groups with a bounded sample selector, not dozens of eager widgets. Recreate owned SVG/CSS samples; native cursor and stable controls. Curve drag writes ref/CSS/SVG coordinates and commits React state on pointerup only; cancel discards. Use `motion/react` for eligible discrete transitions, semantic unsplit text and scoped solid/glass alternatives.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-interface-lab.spec.ts`; expect pass across keyboard/reduced-motion/storage-denied cases. Review for all F-IDs assigned here in the spec; eliminate redundant effects rather than silently omitting the interaction class.
- [ ] Commit listed files as `feat(studio): consolidate interface interaction lab`.

### Task 9: Implement a scoped locale/metadata inspector

**Owner / dependencies:** Subagent 3; Task 4.

**Files:** Create `src/features/studio/modules/locale-inspector/domain.ts`, `fixtures.ts`, `view.tsx`, `tests/unit/studio-locale.test.ts`, `tests/e2e/studio-locale.spec.ts`; update its loader entry.

**Interfaces:** `DemoLocale = 'en'|'ru'|'kk'`; `LocaleCard = {title:string;description:string;action:string}`; `parseDemoLocale(value:unknown): DemoLocale`; `getLocaleCard(locale:DemoLocale,missingKey?:keyof LocaleCard): {card:LocaleCard;fallbackKeys:readonly (keyof LocaleCard)[]}`; default `LocaleInspectorView(props:ModuleViewProps): React.JSX.Element`. `parseDemoLocale` accepts only those three literals and otherwise returns en. Missing-key mode falls back to English for that key only and reports the key; global document language/metadata stays English. Local selection may use `nb-studio-locale`, with invalid/denied storage → en.

- [ ] Write tests for exact key-set parity, meaningful nonempty translations, missing title fallback and unsupported stored locale fallback. Browser: three buttons update sample `lang`, text and metadata output; root html remains en and URL stays `/studio/modules/locale-inspector`; reset/storage-denied work; visible explanation distinguishes old `kz` token from `kk` language.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-locale.test.ts`; expect missing-domain failure.
- [ ] Implement the small typed invented catalog, safe lookup and scoped inspector; no next-intl/global proxy/39-route localization expansion.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-locale.spec.ts`; expect pass with proper sample language and unchanged document language.
- [ ] Commit listed files as `feat(studio): add scoped locale inspector`.

### Task 10: Implement an offline form/request boundary workbench

**Owner / dependencies:** Subagent 3; Task 4.

**Files:** Create `src/features/studio/modules/form-workbench/domain.ts`, `fixtures.ts`, `view.tsx`, `tests/unit/studio-form-workbench.test.ts`, `tests/e2e/studio-form-workbench.spec.ts`; update its loader entry.

**Interfaces:** `DemoForm = {name:string;email:string;message:string;website:string}`; `AdapterMode = 'success'|'unavailable'|'failure'`; `validateDemoForm(form:DemoForm): Partial<Record<keyof DemoForm,string>>`; `simulateResponse(mode:AdapterMode): {status:200|503|502;message:string}`; `BoundaryExample = {status:400|403|413|415|422|502|503|200;label:string;explanation:string}`; default `FormWorkbenchView(props:ModuleViewProps): React.JSX.Element`. Use existing Zod3 if helpful; name 2..100, valid email≤254, message10..5000, empty website. Synthetic default email is `demo@example.invalid`. No fetch, mailto, logging, storage or configurable URLs.

- [ ] Write unit tests for exact min/max/over-limit fields, malformed email, filled honeypot, fixed mode outputs and all eight boundary statuses. Browser: field errors/associations; manual pending → simulated success/unavailable/failure; cancel leaves no late completion; failure preserves edits; simulated success waits for explicit Reset to restore fixture. Trap and fail demo-originated API/business/external requests while allowing owned document/chunk/asset loads; assert no contact/API navigation even when Enter is pressed.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-form-workbench.test.ts`; expect missing-domain failure.
- [ ] Implement pure validation/responses and fixtures, manual state advances and cancel/reset, fixed honest feedback and “No request is sent.” Mount only synthetic controls, disabled until enhancement/hydration succeeds; use no native form submission and only `type="button"` sample actions. Do not reuse real ContactForm. Failed import or disabled JavaScript leaves the read-only server fixture and links, with no editable fields or query-string fallback.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-form-workbench.spec.ts`; expect pass with zero demo network/storage side effects.
- [ ] Commit listed files as `feat(studio): add offline form boundary workbench`.

### Task 11: Connect venture intents to the existing personal contact

**Owner / dependencies:** Subagent 3; Tasks 4–10.

**Files:** Create `src/features/studio/components/connect-terminal.tsx`, `src/features/studio/contact/intent.ts`, `src/app/studio/connect/page.tsx`, `tests/unit/studio-intent.test.ts`, `tests/e2e/studio-connect.spec.ts`; modify `src/features/studio/components/story-chapters.tsx` for terminal composition only. Reuse `src/components/contact-form.tsx` unchanged unless a demonstrated regression requires a separately reviewed fix.

**Interfaces:** `TerminalCommand = {kind:'help'|'clear'}|{kind:'navigate';intent:ConnectIntent}|{kind:'unknown'}`; `parseTerminalCommand(input:string): TerminalCommand`; `parseConnectIntent(value:string|string[]|undefined): ConnectIntent|undefined`; `connectHref(intent:ConnectIntent): string`; `ConnectTerminal(): React.JSX.Element`. Only one allowed literal intent is valid; reject arrays/repeated values. Await `searchParams:Promise<{intent?:string|string[]}>`; no input reflection. No command history persistence.

- [ ] Write unit tests for trimming/case folding, five allowed commands, unknown/empty/shell-like strings, exact enum-only hrefs, array/URL/HTML/PII intent rejection. Browser: help/clear/action buttons and keyboard navigation; invalid intent shows general contact; real form hydration/noscript fallback; intercepted 503/malformed body keeps values; intercepted200 `{ok:true}` clears and says saved. Assert API payload exactly name/email/message/website and no intent/PII query. Never allow test requests to reach the real contact store.
- [ ] Run `node --conditions=react-server --import tsx --test tests/unit/studio-intent.test.ts`; expect missing-parser failure.
- [ ] Implement the parser/DOM terminal and server connect page using existing getProfile/ContactForm. Show selected intent above the form without changing message/payload. Reaffirm proposal-stage ventures/no traction and link existing portfolio for broader work context.
- [ ] Run the unit test, typecheck and `CI=1 npx playwright test tests/e2e/studio-connect.spec.ts`; expect pass with local intercepted responses and no database writes. Verify no-JS email works and message copy never claims delivery.
- [ ] Commit listed files as `feat(studio): connect venture conversations to personal contact`.

### Task 12: Verify the complete preview and document fresh evidence

**Owner / dependencies:** Subagent 4 (independent performance/release verifier); all previous tasks and fresh reviewer results. Subagent 3 owns any production fixes requested by this verifier.

**Files:** Verifier creates `tests/e2e/studio-accessibility.spec.ts`, `tests/e2e/studio-offline.spec.ts`, `scripts/measure-studio.mjs`, `docs/superpowers/reports/2026-10-17-founders-engineering-lab-verification.md` and updates `docs/ARCHITECTURE.md` where verified architecture differs. Subagent 3 owns any affected Studio production fixes. Keep existing `playwright.config.js` unless a necessary narrowly scoped project is justified; tests can create motion-enabled contexts themselves.

**Interfaces:** `scripts/measure-studio.mjs` accepts `STUDIO_BASE_URL` and `STUDIO_REPORT_DIR` and exits nonzero if measurement cannot be obtained; it writes trace + JSON containing commit/browser/device/GPU/viewport/DPR/settings/timing/draw-call/triangle/idle evidence. It visits destination Studio only and never submits contact. A test-only passive scene metrics hook may expose counts, not business data, and must not create a render loop. Evidence report separates observed results, unmet budgets, emulation and missing physical coverage.

- [ ] Write browser scenarios for every route with JS disabled, keyboard-only, 200% text zoom/320px, reduced motion, forced colors, storage denied, failed lazy import and WebGL failure. Check existing Classic/V2 entry points and real-contact regressions with intercepted responses. Add a route-loop test that detects growing subscriptions/canvas counts and idle rendering; do not test shader/CSS source strings. Establish one motion-enabled context because repository default is reduced motion.
- [ ] Run the new focused scenarios; record any remaining failure before fixing. For measurement, first exercise the script with an unreachable base URL and confirm nonzero exit/no fabricated success; then use the approved local production server.
- [ ] Verify all six literal lazy loader entries exist and no interim unbuilt-enhancement states remain for approved modules. Implement verification measurement/reporting only. Confirm no module imports graphics; no duplicate canvas/Spline; no source endpoints/assets/fonts/identity/metrics/certifications; registry remains data-only. Return demonstrated production defects to Subagent 3; recheck the fixes independently. Update architecture documentation to match verified behavior.
- [ ] Run `npm run check`, then `npm run build`, then `CI=1 npx playwright test tests/e2e/studio-*.spec.ts tests/e2e/smooth-scroll.spec.ts tests/e2e/site.spec.ts tests/e2e/liquid-glass-shell.spec.ts tests/e2e/liquid-glass-pages.spec.ts`. Pass means every selected test passes without page errors or real contact writes. Use the repository’s existing build pipeline, not legacy scripts; review any generated destination-content changes before staging.
- [ ] Measure a warm 1440×900 DPR1 integrated-GPU desktop scroll trace: target p95 ≤16.7ms, no repeated animation-caused >50ms tasks, scene≤100 draw calls/100k visible triangles, scene stops within 1s of rest; collect gzip targets≤350 KiB initial enhancement plus≤450 KiB deferred scene. Also inspect Safari desktop, real iPhone Safari/Android Chrome when available, 390×844 emulation and degraded policies. Record exact devices/conditions/artifact paths and every limitation. Optimize or explicitly report misses; do not silently call them passing or claim universal 60fps.
- [ ] Obtain a fresh final builder/code review, return actionable implementation defects to Subagent 3, then rerun affected checks independently. Self-review all 48 F-ID dispositions and 13 templates + 2 static documents against implemented outcomes; F44/F47 stay archive/excluded. Record approval-dependent promotion/publication as not performed.
- [ ] Commit only reviewed final fixes/evidence as `test(studio): verify preview flows and performance budgets`. Hand the user the preview/evidence and remaining risks; root-route promotion, push/deployment and new business capabilities require their separately authorized scope.

## Planning self-review and approval pause

Independent builder review identified three material gaps, resolved in this revision: fresh production build/server evidence for every changed-source browser check; explicit read-only server fixtures with disabled no-JavaScript/failed-import controls and no native form serialization; and F13 stack-catalog delivery/acceptance in Task 7. Root also specified Studio catch-all recovery. This is a review of the proposed documents, not an implementation or runtime verification result.

Coverage: four chapters + six modules map to Tasks 4–11; single scene/scroll lifecycle and degraded policies map to Tasks 2–4/12; source disposition/claim boundaries map to Tasks 1/5–12; real contact and no-network demos have separate tests. Interfaces use one shared registry/signals contract; domain result names are fixed in each owning task. The five Review Focus items each have concrete owning tests. This document describes future failure/pass evidence, not completed checks.

Current phase creates only this plan and the design. No production files, dependencies or configuration have been changed by Subagent 2; no tests/build/server/commit/push/deployment were run by this role. Root may commit the reviewed planning documents locally. After fresh independent review, pause for the user’s explicit approval of both documents. Preserve Subagent 3 implementation → Subagent 4 independent performance/release verification; do not offer or select a conflicting execution method by default.
