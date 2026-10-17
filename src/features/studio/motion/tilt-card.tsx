"use client";
import { useRef } from "react";
import { useInteractionPolicy } from "./use-interaction-policy";
import { usePointerBounds } from "./use-pointer-bounds";
import styles from "./motion.module.css";
export function TiltCard({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const enabled = useInteractionPolicy();
  const root = useRef<HTMLDivElement>(null);
  const { bounds, measure } = usePointerBounds(root);
  const reset = () => {
    const el = root.current;
    if (!el) return;
    el.dataset.active = "false";
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--spot-x", "50%");
    el.style.setProperty("--spot-y", "50%");
  };
  return (
    <div
      ref={root}
      className={styles.tilt}
      data-tilt-card
      data-active="false"
      onFocusCapture={reset}
      onBlurCapture={reset}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onPointerEnter={measure}
      onPointerMove={(event) => {
        if (!enabled || root.current?.contains(document.activeElement)) return;
        const box = bounds.current;
        if (!box) return;
        const x = (event.pageX - box.left) / box.width;
        const y = (event.pageY - box.top) / box.height;
        event.currentTarget.dataset.active = "true";
        event.currentTarget.style.setProperty(
          "--tilt-x",
          `${Math.max(-4, Math.min(4, (0.5 - y) * 8))}deg`,
        );
        event.currentTarget.style.setProperty(
          "--tilt-y",
          `${Math.max(-4, Math.min(4, (x - 0.5) * 8))}deg`,
        );
        event.currentTarget.style.setProperty("--spot-x", `${x * 100}%`);
        event.currentTarget.style.setProperty("--spot-y", `${y * 100}%`);
      }}
    >
      {children}
    </div>
  );
}
