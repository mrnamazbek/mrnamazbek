"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const destinations: Record<string, string> = {
  about: "/about", arsenal: "/about", journey: "/about", certifications: "/about",
  "globe-section": "/about", projects: "/projects", telegram: "/writing",
  resources: "/lab#resources", "mini-tools": "/lab", "developer-lab": "/lab",
  "ai-monthly-lab": "/lab#experiments", "ai-live-signals-root": "/lab#ai-live-signals-root",
  "audience-pulse": "/lab#signals", terminal: "/lab", "pipeline-visualizer": "/lab",
  "vertical-library": "/library", contact: "/contact",
};

/** Keep bookmarks from the original single-page site useful after migration. */
export function LegacyAnchorRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash.slice(1);
    const destination = hash === "career" || hash.startsWith("career-")
      ? `/about#${hash}`
      : destinations[hash];
    if (destination) router.replace(destination);
  }, [pathname, router]);
  return null;
}
