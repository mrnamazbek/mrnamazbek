# Liquid Glass portfolio resource collection

Reviewed: **2026-10-14**. This is a curated collection of current design,
animation, and 3D resources suitable for Namazbek’s portfolio. It is not an
exhaustive catalogue or a measured popularity ranking. Primary documentation,
repositories, and license files were checked; visual references alone are not
permission to copy artwork.

## What V2 actually uses

| Resource | Application in this portfolio | License and source |
| --- | --- | --- |
| [Liqui Design](https://github.com/leefanv/liqui-design/tree/fae9f2de55d8a049d77bbaed80f46fa68ae92508) | Exact `@liqui-design/glass` **0.5.0** provides canvas displacement maps and SVG filter refraction for navigation and collection filter controls. Large content panels use the portfolio’s own readable frosted surfaces. | [MIT, copyright 2026 Fan Li](https://github.com/leefanv/liqui-design/blob/fae9f2de55d8a049d77bbaed80f46fa68ae92508/LICENSE). The installed package and `THIRD_PARTY_NOTICES.md` retain its notice. No complete registry template was imported. |
| [Three.js MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) | Existing Three.js **0.186.1** renders an original torus-knot sculpture with transmission, thickness, IOR, clearcoat, and restrained dispersion. Studio lighting and backdrop textures are generated locally in code. | [Three.js MIT license](https://github.com/mrdoob/three.js/blob/dev/LICENSE). No downloaded model, HDR environment, or external texture is used for this sculpture. |
| [Lenis](https://github.com/darkroomengineering/lenis) | Existing **1.3.26** desktop wheel enhancement continues across both editions. Touch, keyboard focus, gallery rails, dialogs, and reduced motion retain native behavior. | [MIT license](https://github.com/darkroomengineering/lenis/blob/main/LICENSE). Earlier pinned source study: `bc152f90d7c9b04ef372718350e2f616f3c706b2`. |
| Original CSS and native browser features | Project artwork, perspective book objects, hover movement, restrained entrances, filter controls, disclosures, and the gallery presentation are authored for this site. The photo lightbox uses the existing native dialog implementation. | Original implementation. Approved local portraits and the existing locally licensed technology icons remain the only reused collection artwork. |

The optical kernel’s [upstream browser guidance](https://github.com/leefanv/liqui-design/blob/fae9f2de55d8a049d77bbaed80f46fa68ae92508/README.md#browser-support)
describes full SVG backdrop refraction in Chromium and frosted fallbacks in
Safari and Firefox. These are different rendering paths; a blurred fallback
must remain readable without the lens. V2 also provides solid surfaces for
reduced transparency and forced colors. The sculpture keeps a static poster for
mobile, reduced motion, unsupported WebGL, and loading failures; active drawing
is bounded and stops when interaction settles, when paused, or when off-screen.

## Design studies

| Primary reference | Useful direction | Status and reuse limits |
| --- | --- | --- |
| [Liquid Glass Design](https://liquidglassdesign.com/) | Rounded floating controls, luminous edges, layered depth, and a considered background that makes transparency visible. | User-supplied visual reference. Individual gallery artworks have their own owners; their presence in this gallery does not grant redistribution rights. No gallery artwork was copied. |
| [Apple Human Interface Guidelines: Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Separate controls from content; use optical effects sparingly and preserve legibility over changing backgrounds. | Design guidance only. Applied to the hierarchy: prominent control lenses, quieter content panels. Apple images, fonts, and native implementation code were not imported. |
| [Meet Liquid Glass, WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/) | Lensing, light response, flexible motion, and material adaptation as a coherent interaction language. | Video study only. The web edition is an original interpretation, not Apple’s native platform renderer. |
| [Liqui Design handbook](https://liqui.design/docs/handbook/glass) and [repository](https://github.com/leefanv/liqui-design) | Browser-aware refraction with a maintainable surface primitive rather than a separate shader for each card. | Kernel used as described above; documentation and component examples inform integration. Source study pinned at `fae9f2de55d8a049d77bbaed80f46fa68ae92508`. |

## Animation and interactive frontend shelf

| Resource | Appropriate future use | Current status and license |
| --- | --- | --- |
| [Motion for React](https://motion.dev/docs/react), [repository](https://github.com/motiondivision/motion) | Interruptible transitions, shared-layout selection indicators, and more complex state changes if future features need them. For simple hover changes, its own guide also recommends CSS. | Study only; no Motion dependency was added. [Core library MIT](https://github.com/motiondivision/motion/blob/main/LICENSE.md). Motion+ examples and products have separate purchase terms and are not covered by the core license. |
| [React Bits](https://github.com/DavidHDev/react-bits), [Fade Content](https://reactbits.dev/animations/fade-content), [Ripple Grid](https://reactbits.dev/backgrounds/ripple-grid) | Focused text, entrance, and background studies. Existing independently written reveal and Classic Ripple components continue to serve those roles. | No React Bits source is shipped. Current [MIT plus Commons Clause license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) permits use in a website or application but restricts selling, sublicensing, or redistributing the components themselves. Preserve notices if source is reused later; it is not plain MIT. |
| [Lenis usage and limitations](https://github.com/darkroomengineering/lenis#readme) | Smooth desktop wheel input that cooperates with navigation and native nested scrolling. | Already used, not a second scrolling dependency. Keep eligible-device loading and dialog/focus/history handling in the existing shared scroll component. |

## 3D and material shelf

| Resource | Appropriate use | Current status and constraints |
| --- | --- | --- |
| [Three.js physical material guide](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) | Tune glass absorption, roughness, thickness, refraction, and environment highlights on original geometry. | Used. Physical shading costs more per pixel than simpler materials; keep the existing raster and transmission-pass budgets. |
| [Drei MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material), [repository](https://github.com/pmndrs/drei) | A future multi-object glass scene that needs chromatic effects or interaction between transparent objects. | Study only; Drei is not installed. [MIT](https://github.com/pmndrs/drei/blob/master/LICENSE). Its transmission implementation can add a scene render pass; lower samples/resolution or a shared buffer need visual and performance review. Linked demo assets are not automatically covered by the library’s license. |
| [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [repository](https://github.com/pmndrs/react-three-fiber) | A future larger scene with reusable declarative meshes, demand rendering, and resource reuse. | Study only; R3F is not installed. [MIT](https://github.com/pmndrs/react-three-fiber/blob/master/LICENSE). Demand-rendering principles inform the original imperative renderer; no R3F source was copied. |
| [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets), [interactive catalogue](https://github.khronos.org/glTF-Assets/) | Material and loader reference models for future experiments and compatibility checks. | Reference only. No GLB, screenshot, texture, or model was downloaded into the site. Check each model’s README and embedded assets; the repository is not one blanket model license. |

### Candidate glTF studies, not imported models

| Model and primary license record | Useful study | Model-specific limitations |
| --- | --- | --- |
| [Glass Hurricane Candle Holder](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/GlassHurricaneCandleHolder/README.md) | Colored volumetric glass, attenuation, and texture-dependent thickness. | Model/textures: **CC BY 4.0**, Wayfair LLC, Eric Chadwick. Attribution is required. Khronos/glTF logos have separate legal-mark notices in the README. Its path-traced reference imagery also names an external environment; that environment is a separate asset. |
| [Dispersion Test](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/DispersionTest/README.md) | Transmission, volume, IOR, and wavelength-dependent dispersion. | **CC BY 4.0**, AGI, Ed Mackey. Attribution is required. This is a test chart, not a ready-made portfolio hero. A renderer must support the listed material extensions. |
| [Transmission Roughness Test](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/TransmissionRoughnessTest/README.md) | Compare roughness and IOR effects before tuning a glass scene. | **CC BY 4.0**, Analytical Graphics Inc., Ed Mackey. Attribution is required. Reference renders include an external IBL and use path tracing; real-time results can differ. Do not treat the reference screenshot or its lighting asset as licensed by the model alone. |

Any future import should retain the exact source revision, model attribution,
license, required extensions, local asset path, and a size/performance review.
Keep a static accessible fallback and same-origin delivery. The current release
avoids new external model assets by using original geometry and painted studio
lighting.

## Relationship to the first edition

The first edition’s layout, CSS, components, and particle geometry were authored
for the original migration. Its interactions were informed by the supplied
Awwwards/Frontend pack, Codrops, React Bits, 21st.dev, and the owner’s DDCNB work;
the existing provenance is recorded in [FRONTEND_RESOURCES.md](FRONTEND_RESOURCES.md)
and [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). It did not originate from
Liqui Design. V2 adds that actual refraction kernel and a new silver/ice material
system while sharing the same published content, photos, and backend.
