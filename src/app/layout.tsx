import type { Metadata } from "next";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
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
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body id="top"><SmoothScroll />{children}</body></html>;
}
