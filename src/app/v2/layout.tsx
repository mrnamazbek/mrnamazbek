import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GlassShell } from "@/components/liquid-glass/shell";

export const metadata: Metadata = {
  title: { default: "Namazbek Bekzhanov — Liquid Glass Portfolio", template: "%s — Namazbek Bekzhanov" },
  description: "A clearer view of Namazbek's data engineering, projects, writing, and experiments. The Liquid Glass edition.",
  openGraph: {
    title: "Namazbek Bekzhanov — Liquid Glass Portfolio",
    description: "Data engineering, projects, writing, and experiments. A clearer view, in Liquid Glass.",
    url: "/v2",
    siteName: "Namazbek Bekzhanov",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Namazbek Bekzhanov — Liquid Glass Portfolio",
    description: "Data engineering, projects, writing, and experiments. A clearer view, in Liquid Glass.",
  },
  // The existing portfolio remains the indexed edition while both designs coexist.
  robots: { index: false, follow: true },
};

export default function LiquidGlassLayout({ children }: { children: ReactNode }) {
  return <GlassShell>{children}</GlassShell>;
}
