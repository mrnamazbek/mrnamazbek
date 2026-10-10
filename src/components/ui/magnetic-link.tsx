"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type PointerEvent } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./magnetic-link.module.css";

type MagneticLinkProps = Omit<ComponentPropsWithoutRef<"a">, "onPointerMove" | "onPointerEnter" | "onPointerLeave" | "onPointerCancel" | "onFocus">;

// An original, bounded interpretation of the spring response and local mask
// techniques studied in the supplied pack's Mouse 2 and Mouse 3 demos.
// Only the visual layer moves; the link's target and hit area stay in place.
export function MagneticLink({ children, className = "", ...props }: MagneticLinkProps) {
  const link = useRef<HTMLAnchorElement>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const node = link.current;
    if (!node) return;
    delete node.dataset.magneticActive;
    node.style.removeProperty("--magnetic-x");
    node.style.removeProperty("--magnetic-y");
    node.style.removeProperty("--magnetic-glow-x");
    node.style.removeProperty("--magnetic-glow-y");
  }

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
    function updateCapability() {
      enabled.current = !motion.matches && mouse.matches;
      if (!enabled.current) reset();
    }
    updateCapability();
    motion.addEventListener("change", updateCapability);
    mouse.addEventListener("change", updateCapability);
    return () => {
      motion.removeEventListener("change", updateCapability);
      mouse.removeEventListener("change", updateCapability);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function trackPointer(event: PointerEvent<HTMLAnchorElement>) {
    if (!enabled.current || event.pointerType !== "mouse") return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const node = link.current;
      if (!node || !enabled.current) return;
      const bounds = node.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(0, Math.min(1, (pointer.current.x - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (pointer.current.y - bounds.top) / bounds.height));
      node.dataset.magneticActive = "true";
      node.style.setProperty("--magnetic-x", `${((x - 0.5) * 12).toFixed(2)}px`);
      node.style.setProperty("--magnetic-y", `${((y - 0.5) * 8).toFixed(2)}px`);
      node.style.setProperty("--magnetic-glow-x", `${(x * 100).toFixed(2)}%`);
      node.style.setProperty("--magnetic-glow-y", `${(y * 100).toFixed(2)}%`);
    });
  }

  return (
    <a
      {...props}
      ref={link}
      className={`${styles.link} ${className}`.trim()}
      data-magnetic-link="true"
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onFocus={reset}
    >
      <span className={styles.visual} data-magnetic-visual="true">{children}</span>
    </a>
  );
}

export function BackToTopLink() {
  return (
    <MagneticLink href="#top" className={styles.backToTop} aria-label="Back to top">
      <span>Back to top</span>
      <span className={styles.orbit} aria-hidden="true"><ArrowUp size={15} /></span>
    </MagneticLink>
  );
}
