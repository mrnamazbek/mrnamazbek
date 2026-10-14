"use client";

import { LiquiGlass } from "@liqui-design/glass";
import { useSyncExternalStore, type HTMLAttributes, type ReactNode } from "react";
import styles from "./surface.module.css";

function subscribeTransparency(listener: () => void) {
  const queries = [
    window.matchMedia("(prefers-reduced-transparency: reduce)"),
    window.matchMedia("(forced-colors: active)"),
  ];
  queries.forEach((query) => query.addEventListener("change", listener));
  return () => queries.forEach((query) => query.removeEventListener("change", listener));
}

function prefersSolidSurface() {
  return window.matchMedia("(prefers-reduced-transparency: reduce)").matches
    || window.matchMedia("(forced-colors: active)").matches;
}

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Keep displacement maps to small, prominent controls rather than every card. */
  optics?: boolean;
}

/** A readable frosted surface, with optional real lens refraction in Chromium. */
export function GlassSurface({ children, className, optics = false, ...props }: GlassSurfaceProps) {
  const classes = `${styles.surface} ${optics ? styles.optical : ""} ${className ?? ""}`;

  if (!optics) return <div {...props} className={classes}>{children}</div>;

  return <OpticalSurface {...props} className={classes}>{children}</OpticalSurface>;
}

function OpticalSurface({ children, ...props }: Omit<GlassSurfaceProps, "optics">) {
  const solid = useSyncExternalStore(subscribeTransparency, prefersSolidSurface, () => false);

  return (
    <div {...props}>
      <LiquiGlass
        className={styles.lens}
        aria-hidden="true"
        material={solid ? "clear" : "auto"}
        radius={28}
        profile="convex"
        bezel={18}
        refraction={48}
        blur={0.75}
        frost={0.18}
        dispersion={0}
        specular={0.8}
        saturation={1.2}
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
