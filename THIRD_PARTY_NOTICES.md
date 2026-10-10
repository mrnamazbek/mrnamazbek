# Design and software sources

The portfolio's layout, CSS, components, and particle geometry were authored for this migration. The following resources informed selected interactions:

- [DDCNB website](https://github.com/mrnamazbek/ddc-nbk-website), specifically `components/three/LogoParticleReveal.tsx`: the owner's landing-page wave and pointer-proximity techniques were adapted into an original data torus. DDC branding, its logo geometry, and third-party noise code were not copied.
- [User-provided frontend and Web Awards folder](https://drive.google.com/drive/folders/1BPrOBFEt3pseDZYCK1vwZG3lC_db_DdQ): the masked-letter loading and clipped page-entry demonstrations informed independently written hero and route transitions. Archive code, commercial fonts, and bundled media were not redistributed.
- [React Bits FadeContent](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/FadeContent/FadeContent.tsx): visual inspiration for the original IntersectionObserver/CSS reveal component. No React Bits source was copied. Its inspected repository license is MIT with the Commons Clause, Copyright © 2026 David Haz.
- [21st.dev](https://21st.dev): navigation and hover microinteraction references. No marketplace component code was copied or vendored.

Runtime dependencies are declared with exact versions in `package.json` and resolved in `package-lock.json`. Their original licenses remain in their installed packages. Icons use Lucide, 3D rendering uses Three.js, Markdown rendering uses React Markdown and remark-gfm, and the application uses Next.js, React, Supabase JS, and Zod. Existing public media, resume, article text, and feed snapshots come from the owner's original portfolio. Feed methodology and source dates remain visible in the site.
