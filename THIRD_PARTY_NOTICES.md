# Design and software sources

The portfolio's layout, CSS, components, and particle geometry were authored for this migration. The following resources informed selected interactions:

- [Shaders](https://github.com/shader-effects-inc/shaders/tree/81fd4ece5d493ca6c424a2af41f0e2c361ec8258), Copyright (c) 2026 Shader Effects Inc., MIT: its idle gate, first-pointer handling, and frame cadence were studied for original improvements to the existing Ripple renderer. No engine, shader source, telemetry, or proprietary editor presets are redistributed.
- [Anatomy](https://github.com/wheresryan22/anatomy/tree/e6600ffc4e8e6620eeb45bf49bcdbd5e4b84163f), Copyright (c) 2026 Ryan, MIT: its agent drawing skill informed the original Lab connection-pool illustration. No kit source, textures, fonts, or graphics dependencies are redistributed.
- [Dashboard Icons](https://github.com/homarr-labs/dashboard-icons/tree/2ade7af6c86f0bf7de0b29cd62af99b3458b7af1), Copyright (c) 2024 Bjorn Lammers, Meier Lukas, Thomas Camlong and Homarr Labs, Apache-2.0: twelve local SVG marks identify existing portfolio technologies. Full license and exact source/checksums are in `assets/technology-icons/LICENSE.txt` and `source.json`. Iceberg SVG export metadata was removed and a matching viewBox added; an in-file notice records this change. Product names and trademarks belong to their respective owners; no endorsement is implied.
- [Lenis](https://github.com/darkroomengineering/lenis/tree/bc152f90d7c9b04ef372718350e2f616f3c706b2), pinned npm version `1.3.26`, supplies optional desktop wheel scrolling. Its MIT notice is retained below and in the installed package.

- [DDCNB website](https://github.com/mrnamazbek/ddc-nbk-website), specifically `components/three/LogoParticleReveal.tsx`: the owner's landing-page wave and pointer-proximity techniques were adapted into an original data torus. DDC branding, its logo geometry, and third-party noise code were not copied.
- [User-provided frontend and Web Awards folder](https://drive.google.com/drive/folders/1BPrOBFEt3pseDZYCK1vwZG3lC_db_DdQ): the masked-letter loading and clipped page-entry demonstrations informed independently written hero and route transitions. Archive code, commercial fonts, and bundled media were not redistributed.
- [React Bits FadeContent](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/FadeContent/FadeContent.tsx): visual inspiration for the original IntersectionObserver/CSS reveal component. No React Bits source was copied. Its inspected repository license is MIT with the Commons Clause, Copyright © 2026 David Haz.
- [21st.dev](https://21st.dev): navigation and hover microinteraction references. No marketplace component code was copied or vendored.

- The later robot enhancement uses the owner's actual DDCNB `public/spline/scene.splinecode` export as `assets/3d/ddcnb-robot.splinecode`. It retains Spline attribution and does not copy DDCNB's console filters or watermark-removal code. The small theme-specific posters were captured from the rendered model. Runtime framing, lighting, and head motion are independently implemented.
- The selected-project explorer, capabilities disclosures, magnetic email link and footer ring are original implementations informed by the supplied pack's Hover 1, Grid 1, Hover 21, Mouse 2 and Mouse 3 studies. No demo code, fonts or media are copied.

Runtime dependencies are declared with exact versions in `package.json` and resolved in `package-lock.json`. Their original licenses remain in their installed packages. Icons use Lucide, 3D rendering uses Three.js and Spline Runtime (© 2026 Spline, Inc.), Markdown rendering uses React Markdown and remark-gfm, and the application uses Next.js, React, Supabase JS, and Zod. Spline geometry decoders are copied from the installed runtime package for same-origin serving. Existing public media, resume, article text, and feed snapshots come from the owner's original portfolio. Feed methodology and source dates remain visible in the site.


# Third-party source-study notices

These MIT notices acknowledge the Codrops studies that informed original portfolio implementations. No full demo runtime or assets are redistributed.

## OnScrollTypographyAnimations

Source: https://raw.githubusercontent.com/codrops/OnScrollTypographyAnimations/main/LICENSE

MIT License

Copyright (c) 2009 - 2022 [Codrops](https://tympanus.net/codrops)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## ScrollTextMotion

Source: https://raw.githubusercontent.com/codrops/ScrollTextMotion/main/LICENSE

MIT License

Copyright (c) 2009 - 2025 [Codrops](https://codrops.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## ElasticGridScroll

Source: https://raw.githubusercontent.com/codrops/ElasticGridScroll/main/LICENSE

MIT License

Copyright (c) 2009 - 2026 [Codrops](https://tympanus.net/codrops)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## Lenis

The MIT License

Copyright (c) 2024 darkroom.engineering

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
