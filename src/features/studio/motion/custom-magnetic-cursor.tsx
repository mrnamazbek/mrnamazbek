"use client";
import { useEffect, useRef } from "react";
import { useInteractionPolicy } from "./use-interaction-policy";
import styles from "./motion.module.css";
export function CustomMagneticCursor(): React.JSX.Element | null {
  const enabled = useInteractionPolicy();
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const pointer = (event: PointerEvent) => {
      const el = cursor.current;
      if (!el) return;
      el.style.setProperty("--cursor-x", `${event.clientX}px`);
      el.style.setProperty("--cursor-y", `${event.clientY}px`);
      el.dataset.active = "true";
    };
    const leave = () => {
      if (cursor.current) cursor.current.dataset.active = "false";
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, [enabled]);
  return enabled ? (
    <div
      ref={cursor}
      className={styles.cursor}
      data-studio-cursor
      aria-hidden="true"
    />
  ) : null;
}
