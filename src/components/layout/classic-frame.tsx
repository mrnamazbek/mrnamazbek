import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { LegacyAnchorRedirect } from "./legacy-anchor-redirect";
import { DotBackground } from "./dot-background";

/** Original portfolio chrome. Content routes keep their existing public URLs. */
export function ClassicFrame({ children }: { children: ReactNode }) {
  return <>
    <DotBackground />
    <LegacyAnchorRedirect />
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader />
    <main id="main-content" className="site-main" data-portfolio-version="classic">{children}</main>
    <SiteFooter />
  </>;
}
