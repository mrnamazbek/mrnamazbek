"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./scroll-story.module.css";

// Original, unpinned interpretation of the depth choreography in Awwwards
// Scroll Animation / 71 (Sticky Cards). No demo code, imagery or libraries are
// bundled: https://drive.google.com/drive/folders/1LgciGbjIEYaQUvZFi5OQY4I9bzqmBXqZ
const viewportSubscribers = new Set<() => void>();
let viewportFrame = 0;

function scheduleViewportUpdate() {
  if (viewportFrame) return;
  viewportFrame = window.requestAnimationFrame(() => {
    viewportFrame = 0;
    viewportSubscribers.forEach((update) => update());
  });
}

function subscribeToViewport(update: () => void) {
  if (!viewportSubscribers.size) {
    window.addEventListener("scroll", scheduleViewportUpdate, { passive: true });
    window.addEventListener("resize", scheduleViewportUpdate);
  }
  viewportSubscribers.add(update);
  return () => {
    viewportSubscribers.delete(update);
    if (!viewportSubscribers.size) {
      window.removeEventListener("scroll", scheduleViewportUpdate);
      window.removeEventListener("resize", scheduleViewportUpdate);
      window.cancelAnimationFrame(viewportFrame);
      viewportFrame = 0;
    }
  };
}

type ScrollStoryProps = {
  children: ReactNode;
  className?: string;
  /** Select the existing article elements; server-rendered children stay intact. */
  itemSelector?: string;
  /** A decorative reading rail, useful for a vertical career timeline. */
  rail?: boolean;
};

export function ScrollStory({
  children,
  className = "",
  itemSelector = ":scope > article",
  rail = false,
}: ScrollStoryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.IntersectionObserver) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const items = Array.from(element.querySelectorAll<HTMLElement>(itemSelector));
    const played = new Set<HTMLElement>();
    const animations = new Set<Animation>();
    let inView = false;

    const updateRail = () => {
      if (!rail || !inView || preference.matches) return;
      const bounds = element.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight * 0.62 - bounds.top) / bounds.height),
      );
      element.style.setProperty("--story-progress", String(progress));
    };

    const sectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) updateRail();
      else if (rail && !preference.matches)
        element.style.setProperty("--story-progress", entry.boundingClientRect.top < 0 ? "1" : "0");
    });
    sectionObserver.observe(element);

    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = entry.target as HTMLElement;
          if (!entry.isIntersecting || played.has(item)) return;
          played.add(item);
          item.setAttribute("data-story-seen", "true");
          itemObserver.unobserve(item);

          // First-paint content is already readable. Only newly reached cards
          // receive this brief, bounded perspective entrance.
          if (preference.matches || typeof item.animate !== "function") return;
          if (item.getBoundingClientRect().top < 32) return;
          const animation = item.animate(
            [
              { opacity: 0.68, transform: "perspective(1200px) translate3d(0, 28px, 0) rotateX(3deg) scale(.99)" },
              { opacity: 1, transform: "perspective(1200px) translate3d(0, 0, 0) rotateX(0deg) scale(1)" },
            ],
            { duration: 680, easing: "cubic-bezier(.2,.75,.25,1)" },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((item) => {
      item.setAttribute("data-story-item", "true");
      // Do not animate elements that are already in the initial viewport.
      if (item.getBoundingClientRect().top < window.innerHeight) {
        played.add(item);
        item.setAttribute("data-story-seen", "true");
      } else itemObserver.observe(item);
    });

    const unsubscribe = rail ? subscribeToViewport(updateRail) : () => {};
    const resizeObserver = rail && window.ResizeObserver
      ? new ResizeObserver(scheduleViewportUpdate)
      : null;
    resizeObserver?.observe(element);
    const onPreferenceChange = () => {
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
        element.style.removeProperty("--story-progress");
      } else updateRail();
    };
    preference.addEventListener("change", onPreferenceChange);

    return () => {
      sectionObserver.disconnect();
      itemObserver.disconnect();
      resizeObserver?.disconnect();
      unsubscribe();
      preference.removeEventListener("change", onPreferenceChange);
      animations.forEach((animation) => animation.cancel());
      items.forEach((item) => {
        item.removeAttribute("data-story-item");
        item.removeAttribute("data-story-seen");
      });
      element.style.removeProperty("--story-progress");
    };
  }, [itemSelector, rail]);

  return (
    <div ref={ref} className={`${styles.story} ${className}`} data-rail={rail ? "true" : undefined}>
      {rail && <span className={styles.rail} aria-hidden="true"><span /></span>}
      {children}
    </div>
  );
}

type AmbientBackdropProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Original lightweight pixel-field interpretation of Awwwards Background / 11,
 * PixelLiquidBg. Its grid, palette and cursor response informed this CSS field;
 * its unlicensed Three.js fluid shaders are not copied or loaded.
 * https://drive.google.com/drive/folders/1MlDp7Wl9uhK82IqFSVau8OjmbdHmpJab
 */
export function AmbientBackdrop({ children, className = "" }: AmbientBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const field = fieldRef.current;
    if (!element || !field) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;

    const move = (event: PointerEvent) => {
      if (motion.matches || !pointer.matches) return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const bounds = element.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
        const offsetY = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
        field.style.setProperty("--ambient-x", `${offsetX * 100}%`);
        field.style.setProperty("--ambient-y", `${offsetY * 100}%`);
        field.style.setProperty("--ambient-drift-x", `${(offsetX - 0.5) * 12}px`);
        field.style.setProperty("--ambient-drift-y", `${(offsetY - 0.5) * 12}px`);
      });
    };
    const reset = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      field.removeAttribute("style");
    };
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    motion.addEventListener("change", reset);
    pointer.addEventListener("change", reset);
    return () => {
      reset();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", reset);
      pointer.removeEventListener("change", reset);
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.ambient} ${className}`}>
      <div ref={fieldRef} className={styles.field} aria-hidden="true">
        <span className={styles.pixelField} />
        <span className={styles.orbit} />
        <span className={styles.orbitInner} />
      </div>
      {children}
    </div>
  );
}
