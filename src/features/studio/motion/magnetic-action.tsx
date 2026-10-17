"use client";
import { cloneElement, useRef, type ReactElement, type ReactNode } from "react";
import { useInteractionPolicy } from "./use-interaction-policy";
import { usePointerBounds } from "./use-pointer-bounds";
import styles from "./motion.module.css";
export function MagneticAction({
  children,
}: {
  children: ReactElement;
}): React.JSX.Element {
  const enabled = useInteractionPolicy();
  const root = useRef<HTMLSpanElement>(null);
  const { bounds, measure } = usePointerBounds(root);
  const child = children as ReactElement<{ children: ReactNode }>;
  const reset = () => {
    root.current?.style.setProperty("--magnet-x", "0px");
    root.current?.style.setProperty("--magnet-y", "0px");
  };
  return (
    <span
      ref={root}
      className={styles.magnetic}
      onFocusCapture={reset}
      onBlurCapture={reset}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onPointerEnter={measure}
      onPointerMove={(event) => {
        if (!enabled || root.current?.contains(document.activeElement)) return;
        const box = bounds.current;
        if (!box) return;
        event.currentTarget.style.setProperty(
          "--magnet-x",
          `${Math.max(-4, Math.min(4, (event.pageX - box.left - box.width / 2) * 0.08))}px`,
        );
        event.currentTarget.style.setProperty(
          "--magnet-y",
          `${Math.max(-4, Math.min(4, (event.pageY - box.top - box.height / 2) * 0.08))}px`,
        );
      }}
    >
      {cloneElement(
        child,
        {},
        <span className={styles.actionContent}>{child.props.children}</span>,
      )}
    </span>
  );
}
