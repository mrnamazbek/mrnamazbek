# Frontend resource studies and adaptations

The portfolio keeps its ink/green editorial identity and server-rendered content.
The October 2026 enhancement uses original React, CSS, Web Animations API, and
native scrolling implementations informed by the user's supplied Awwwards pack.
No demo photographs, fonts, proprietary bundles, GSAP, Lenis, or remote scripts
from the pack are shipped. Existing Three.js remains dynamically loaded for the
DDCNB-inspired data sculpture. This is a curated selection of techniques that fit
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
No animation dependencies were added.
