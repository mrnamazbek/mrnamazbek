# Frontend resource studies and adaptations

The portfolio keeps its ink/green editorial identity and server-rendered content.
The October 2026 enhancement uses original React, CSS, Web Animations API, and
native scrolling implementations informed by the user's supplied Awwwards pack.
No demo photographs, fonts, proprietary bundles, GSAP, or remote scripts
from the pack are shipped. The later Lenis integration comes from its official
MIT-licensed npm package. The DDCNB robot's Spline runtime is dynamically loaded
for capable desktop visitors. This is a curated selection of techniques that fit
the portfolio, not an import of every demo or library.

Source pack: https://drive.google.com/drive/folders/1BPrOBFEt3pseDZYCK1vwZG3lC_db_DdQ

| Site feature | Actual sources inspected | Adaptation |
| --- | --- | --- |
| Hero headline | [Hero 1](https://drive.google.com/file/d/1zDwqN727Kwjwr5u-NzkcC5gPnxNCbW0X/view), [Text 5](https://drive.google.com/file/d/1VvokiwddaZ8gna5FEUivyurerXTVWM_S/view), Codrops OnScrollTypographyAnimations effect 6 | Masked character stagger and perspective rotation, with a stable accessible headline |
| Sculpture entrance | [Hero 4](https://drive.google.com/file/d/16xQ0cG6MsQaU7pifmXChv3tFBN7ZtFz8/view) | Six shutter bands, restrained pointer depth, existing DDCNB-derived sculpture |
| Technology labels | [Text 1](https://drive.google.com/file/d/1E0wJJsCWiN20pLH2raiYC-wDTFMcGDRr/view), Codrops ScrollTextMotion | Short decipher-to-original label reveal |
| Project, writing, discovery cards | [Hover 21](https://drive.google.com/file/d/10gXsDOCgyxqPAVaVH2Vnt4MiFmD5n3oZ/view), [Mouse 3](https://drive.google.com/file/d/1ZbqmiHdDtLcqkXe3wJW_233elJOMIMQr/view) | Clamped pointer-relative tilt, local wash and border highlight, keyboard focus parity |
| Portrait gallery | [Grid 3](https://drive.google.com/file/d/1ASjDbCMKjfutqH99_2jU14mD02LtWnL7/view), [Slider 2](https://drive.google.com/file/d/1ht3mIIeSuD-oo_ShPEXGZCFujGNFjLVP/view), [Slider 25](https://drive.google.com/file/d/1ayUDQPEQffz0Jld01SVVRRDe88DYz0cp/view) | Staggered perspective filmstrip, native touch/scroll snap, clipped enlargement entrance |
| Navigation | [Navigation 4](https://drive.google.com/drive/folders/105k6padohAWD-5oJgMrW-zFwmUyOJSpI) | Masked rolling desktop labels, underline, numbered mobile character stagger |
| Page entrance | [Page Transitions 5](https://drive.google.com/drive/folders/1JRRsWv2nJ_8L0QaY2esh-oG49JPvSw05) | Brief contained SVG trace on Next template remount |
| Career and education | [Scroll 71 / Sticky Cards](https://drive.google.com/drive/folders/1LgciGbjIEYaQUvZFi5OQY4I9bzqmBXqZ) | Bounded depth entrances and a decorative reading rail, using native page scrolling |
| Contact backdrop | [Background 11 / PixelLiquidBg](https://drive.google.com/drive/folders/1MlDp7Wl9uhK82IqFSVau8OjmbdHmpJab) | Lightweight CSS pixel field and pointer-reactive orbits; no fluid shaders copied |
| Selected-project explorer | Hover 1 / Mouse Scale Image Gallery and Grid 1 / Grid Layout Transition archives in the supplied pack | Editorial project tabs, changing layered blueprint, native repository links, arrow/Home/End keyboard controls |
| Capabilities panels | Hover 21 and Mouse 3 (linked above) | Seven native disclosure panels with existing tools, circuit accents, local light, keyboard focus parity |
| Contact and back-to-top actions | Mouse 2 / spring-following archive and Mouse 3 | Stable anchor hit areas with bounded inner movement, native links, focus highlight and a spring ring |

Some archives contain an ISC package declaration with no author or standalone
license notice; others have no license file. Those declarations were not treated
as permission to redistribute embedded paid code or assets. The implementations
above are original interpretations of general techniques. Codrops upstream
studies are MIT licensed; notices are retained in THIRD_PARTY_NOTICES.md.

## Personal photographs

Namazbek expressly authorized use of his photos and the Google Photos face filter
labelled “Me” in this conversation. Three reviewed solo portraits were downloaded
from that face group. The fourth was the named `linkedin_avatar_2.png` portrait in
his authorized Drive collection. Only selected public-facing derivatives are in
`assets/gallery`; original downloads, Google Photos URLs/face identifiers, account
state, EXIF/GPS metadata, and unrelated private photos are not included.

Edit `src/content/gallery.ts` to add, remove, reorder, or caption photographs.
Add an optimized local image under `assets/gallery`; the normal asset-sync/build
publishes it. Captions describe the image rather than claiming an unverified
place, event, or biography. The formal portrait also supplies the LinkedIn hover
card; profile previews are curated local content, not live platform scraping.

## Motion and performance

Reduced motion disables perspective movement, text deciphering and entrances.
Touch keeps stable card geometry, native scrolling and visible controls. Links,
headlines, photos, and mobile navigation remain usable without JavaScript.
Frequent pointer updates use refs and animation frames; viewport subscriptions
are shared and passive. Components clean up animations, observers and listeners.
The gallery uses locally hosted WebP derivatives and responsive lazy Next images.
The CSS interactions do not add animation dependencies; the optional 3D robot uses
Spline Runtime and capable desktop wheel scrolling uses Lenis.

## DDCNB robot

The later robot enhancement reuses the owner's actual
[`public/spline/scene.splinecode`](https://github.com/mrnamazbek/ddc-nbk-website/blob/develop/public/spline/scene.splinecode)
export from DDCNB. `assets/3d/ddcnb-robot.splinecode` has the same Git blob hash
`4d5b65151cb6acc1418271ec9f1ce78fee80b6b5` as that source; it is not a replacement model.
The portfolio changes its framing and lighting at runtime, hides the separate DDC
brand object, and uses the supported head and body transforms for pointer
tracking. Coordinates are relative to the robot's stage, so movement remains
visible on wide screens: the head turns toward the cursor while the body turns
and leans gently. Exported interaction is disabled to bypass unrelated events and
the obsolete timeline. Automatic rendering finishes pending GPU and antialiasing
frames, then idles; pause and visibility controls still stop playback. Spline
attribution remains visible.

`@splinetool/runtime` is pinned at `2.0.75`. It and the 1.3 MB scene load only after
the visible desktop hero can run WebGL and motion. Geometry WASM decoders are
copied from the installed package by the normal asset-sync step and are fetched
from the same origin when needed. CSP permits WASM compilation via
`wasm-unsafe-eval`; JavaScript `unsafe-eval` and third-party connection origins
remain disallowed. Image/media blob and data URLs permit the export's embedded textures; no media CDN is enabled. HTML content in the scene is disabled.

The two small PNG posters are reviewed browser renders of this actual model,
captured in the portfolio's dark and light themes. Mobile, reduced-motion,
unsupported WebGL and load failures retain these posters. Pause stops interaction;
hidden tabs and off-screen scenes stop rendering. Observers, events, animation
frames, downloads and the runtime instance are cleaned up on navigation. The
earlier original particle torus remains available as a separate reusable component.

## Cursor-responsive ripple background

An original ripple point shader runs throughout the site: cursor movement emits
small circular waves through the dot grid. The bottom-left Ripple background
control pauses it independently of the robot and remembers playback preferences
across pages and reloads. This is the site's only background effect.

The supplied pack was inspected again through its Background Animations folder:

- [Background 10](https://drive.google.com/drive/folders/1RJ-s_VLSQRcAIPaOW71owffncZntixmK),
  `code.zip` / `files/script.js`: spring-returning dot grid, pointer-proximity
  colors, and movement impulses. This informed the dot grid and local response.
- [Background 11](https://drive.google.com/drive/folders/1MlDp7Wl9uhK82IqFSVau8OjmbdHmpJab),
  `code.zip` / `PixelLiquidBg.tsx`: pointer-driven fluid, coarse sampling, bounded
  simulation resolution, and palette changes. This informed bounded wake
  rendering and theme palettes.
- [Background 1](https://drive.google.com/drive/folders/1iserdV7rJZ3hSsDPX_XfaLWpQS-NbUNT),
  `code.zip` / `files/script.js`: eased mouse uniforms and theme-colored WebGL
  rendering. This informed cursor smoothing and theme integration.

The main open-source study was the dot variant of
[React Bits Ripple Grid](https://reactbits.dev/backgrounds/ripple-grid).
Upstream source was studied at commit `496968c4117e21278f13917201b7d615bc5e7450`.
[21st.dev Kinetic Dots](https://21st.dev/@isaiahbjork/components/shader-kinetic-dots)
was a shader-lifecycle study. This is an original implementation of the general
techniques, with no copied
pack or upstream source, demo assets, fluid runtime, or added dependency.

One persistent WebGL1 canvas draws at most
4,000 point sprites at 30 frames per second, with a 1.5-million-pixel raster
budget and at most eight ripple wakes. Coordinates use viewport CSS pixels so
the cursor remains aligned on wide or high-density screens. It stops rendering
on pause, hidden tabs, lost context, or unsupported input/motion settings.
Reduced motion, touch/mobile, WebGL failure, and no JavaScript retain static CSS
dots. The layer is decorative and cannot intercept links, forms, or scrolling;
playback uses one native keyboard-accessible button.

## Requested repository upgrades

The four repositories below were inspected on 14 October 2026. Revisions are
pinned here so later changes can be assessed against the actual source studies.

| Repository and revision | Applied upgrade | Scope and provenance |
| --- | --- | --- |
| [Shaders](https://github.com/shader-effects-inc/shaders/tree/81fd4ece5d493ca6c424a2af41f0e2c361ec8258) | Ripple settles to zero GPU draws and resumes on new cursor input; first cursor sample starts at its actual position; frame-rate-independent easing and tolerant 30fps cap | Studied `packages/core/src/gpu/kit/host/pointer.ts` and `gpu/frame.ts`. Original adaptation of lifecycle techniques; no upstream source, WebGPU runtime, editor presets, telemetry, or dependency imported. Ripple remains the sole background. |
| [Lenis](https://github.com/darkroomengineering/lenis/tree/bc152f90d7c9b04ef372718350e2f616f3c706b2) | Smooth desktop wheel scrolling | Exact official npm version `1.3.26`, dynamically loaded for eligible motion/input settings. Native touch, keyboard and anchors remain available; nested gallery, dialogs, editable controls and route/history transitions are handled separately. Keyboard/focus changes interrupt inertia so focused fields stay visible. Next.js 16's documented `data-scroll-behavior` attribute retains instant route transitions with native smooth anchors. |
| [Anatomy](https://github.com/wheresryan22/anatomy/tree/e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f) | Interactive isometric connection-pool illustration in Lab | The drawing skill informs original SVG and layout. An explicitly illustrative bounded pool and queue explain capacity; they do not claim to show this site's production configuration. No kit code, textures, fonts, or graphics runtime is copied. |
| [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons/tree/2ade7af6c86f0bf7de0b29cd62af99b3458b7af1) | Local technology marks in capabilities disclosures | A small set of reviewed SVGs for tools actually listed in existing skills. Exact paths and revision are retained in `assets/technology-icons/source.json`; Apache-2.0 license retained alongside assets. Marks accompany text labels and do not imply endorsement. |

The Ripple loop continues until its existing wakes expire and the cursor has
settled, then retains the last drawn grid without scheduling further frames.
Pause, tab visibility, motion preferences, resize and theme changes still update
the same persistent canvas. A browser regression check counts actual WebGL draw
calls across idle and renewed cursor movement.
