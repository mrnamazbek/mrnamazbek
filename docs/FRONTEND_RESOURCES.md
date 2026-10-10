# Frontend resource studies and adaptations

The portfolio keeps its ink/green editorial identity and server-rendered content.
The October 2026 enhancement uses original React, CSS, Web Animations API, and
native scrolling implementations informed by the user's supplied Awwwards pack.
No demo photographs, fonts, proprietary bundles, GSAP, Lenis, or remote scripts
from the pack are shipped. The DDCNB robot's Spline runtime is dynamically loaded
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
The CSS interactions do not add animation dependencies; the optional 3D robot uses Spline Runtime.

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
