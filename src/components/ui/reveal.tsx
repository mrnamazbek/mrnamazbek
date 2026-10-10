"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

/**
 * An accessible, progressively enhanced interpretation of React Bits FadeContent.
 * Reference: https://reactbits.dev/animations/fade-content
 * Content remains visible without JavaScript and with reduced motion.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.remove("reveal-pending");
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    // Only hide below-the-fold content; first-paint text never waits for motion.
    if (element.getBoundingClientRect().top > window.innerHeight)
      element.classList.add("reveal-pending");
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
