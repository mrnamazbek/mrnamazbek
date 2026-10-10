import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LegacyAnchorRedirect } from "@/components/layout/legacy-anchor-redirect";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://namazbek-portfolio.vercel.app"),
  title: { default: "Namazbek Bekzhanov — Data Engineer & Builder", template: "%s — Namazbek Bekzhanov" },
  description: "Data engineering, backend development, and things worth building. Explore Namazbek Bekzhanov’s work, writing, and experiments from Almaty, Kazakhstan.",
  authors: [{ name: "Namazbek Bekzhanov" }],
  openGraph: { title: "Namazbek Bekzhanov — Data Engineer & Builder", description: "Building resilient data systems. Work, writing, and experiments from Almaty, Kazakhstan.", type: "website", siteName: "Namazbek Bekzhanov", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body id="top"><LegacyAnchorRedirect /><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><main id="main-content" className="site-main">{children}</main><SiteFooter /></body></html>;
}
