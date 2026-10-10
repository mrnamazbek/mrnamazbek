"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import styles from "./interactive-card.module.css";

type InteractiveCardProps = {
  children: ReactNode;
  className?: string;
  as?: "article" | "div";
  variant?: "surface" | "row";
  tilt?: boolean;
};

// Pointer-relative tilt: Awwwards pack / Hover Effects / 21 (ISC).
// Cursor-local reveal: Awwwards pack / Mouse Effects / 3 (ISC).
// Source archives and adaptations are recorded in docs/FRONTEND_RESOURCES.md.
export function InteractiveCard({
  children,
  className = "",
  as: Element = "article",
  variant = "surface",
  tilt = true,
}: InteractiveCardProps) {
  const card = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);
  const enabled = useRef(false);
  const pointer = useRef({ x: 0, y: 0 });

  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const node = card.current;
    if (!node) return;
    delete node.dataset.pointerActive;
    node.style.removeProperty("--card-x");
    node.style.removeProperty("--card-y");
    node.style.removeProperty("--card-rotate-x");
    node.style.removeProperty("--card-rotate-y");
  }

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    function updateCapability() {
      enabled.current = !reducedMotion.matches && finePointer.matches;
      if (!enabled.current) reset();
    }
    updateCapability();
    reducedMotion.addEventListener("change", updateCapability);
    finePointer.addEventListener("change", updateCapability);
    return () => {
      reducedMotion.removeEventListener("change", updateCapability);
      finePointer.removeEventListener("change", updateCapability);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function trackPointer(event: PointerEvent<HTMLElement>) {
    if (!enabled.current || event.pointerType !== "mouse") return;
    pointer.current.x = event.clientX;
    pointer.current.y = event.clientY;
    if (frame.current !== null) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const node = card.current;
      if (!node || !enabled.current) return;
      const bounds = node.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.min(1, Math.max(0, (pointer.current.x - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (pointer.current.y - bounds.top) / bounds.height));
      node.dataset.pointerActive = "true";
      node.style.setProperty("--card-x", `${(x * 100).toFixed(2)}%`);
      node.style.setProperty("--card-y", `${(y * 100).toFixed(2)}%`);
      if (tilt && variant === "surface") {
        node.style.setProperty("--card-rotate-x", `${((0.5 - y) * 3).toFixed(2)}deg`);
        node.style.setProperty("--card-rotate-y", `${((x - 0.5) * 3).toFixed(2)}deg`);
      }
    });
  }

  return (
    <Element
      ref={(node) => { card.current = node; }}
      className={`${styles.card} ${styles[variant]} ${className}`.trim()}
      data-interactive-card={variant}
      data-card-tilt={tilt ? "true" : "false"}
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </Element>
  );
}
