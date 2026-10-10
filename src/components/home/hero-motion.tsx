"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./hero-motion.module.css";

/**
 * Source study: the user's Awwwards hero 1 / hero 4 masked rise and shutter
 * sequences, plus Codrops OnScrollTypographyAnimations effect 6 (MIT).
 * The animation is rewritten for React + WAAPI; no template assets, GSAP
 * bundles, loaders, or scroll overrides are included.
 */
export function HeroTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!title || motion.matches || typeof title.animate !== "function") return;

    const characters = title.querySelectorAll<HTMLElement>("[data-hero-character]");
    const animations = Array.from(characters, (character, index) =>
      character.animate(
        [
          { transform: "translateY(108%) rotateX(-70deg)", opacity: 0.3 },
          { transform: "translateY(0) rotateX(0)", opacity: 1 },
        ],
        {
          duration: 780,
          delay: Math.min(index * 26, 390),
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "backwards",
        },
      ),
    );
    const cancel = () => animations.forEach((animation) => animation.cancel());
    motion.addEventListener("change", cancel);
    return () => {
      cancel();
      motion.removeEventListener("change", cancel);
    };
  }, []);

  return (
    <h1 ref={titleRef} aria-label="I make data work." className={styles.title}>
      <span className={styles.line} aria-hidden="true">
        {["I", "make", "data"].map((word, wordIndex) => (
          <span key={word}>
            {wordIndex > 0 ? " " : null}
            <span className={styles.word}>
              {Array.from(word, (character, index) => (
                <span className={styles.character} data-hero-character key={index}>
                  {character}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
      <span className={`${styles.line} ${styles.accent}`} aria-hidden="true">
        <span className={styles.word}>
          {Array.from("work.", (character, index) => (
            <span className={styles.character} data-hero-character key={index}>
              {character}
            </span>
          ))}
        </span>
        <span className={`hero-title-period ${styles.arrow}`}>↗</span>
      </span>
    </h1>
  );
}

/** A contained version of hero 4's horizontal peel, followed by fine-pointer
 * depth. The native scroll position and page content remain untouched.
 */
export function HeroArtFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!frame || motion.matches || typeof frame.animate !== "function") return;

    const shutters = frame.querySelectorAll<HTMLElement>("[data-hero-shutter]");
    const animations = Array.from(shutters, (shutter, index) =>
      shutter.animate(
        [
          { transform: "scaleY(1)", opacity: 1 },
          { transform: "scaleY(0)", opacity: 1 },
        ],
        {
          duration: 850,
          delay: 80 + Math.abs(index - 2.5) * 50,
          easing: "cubic-bezier(.76,0,.24,1)",
          fill: "backwards",
        },
      ),
    );
    let scheduledFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const applyPointer = () => {
      scheduledFrame = 0;
      frame.style.setProperty("--hero-rotate-x", `${-pointerY * 3}deg`);
      frame.style.setProperty("--hero-rotate-y", `${pointerX * 4}deg`);
      frame.style.setProperty("--hero-shift-x", `${pointerX * 6}px`);
      frame.style.setProperty("--hero-shift-y", `${pointerY * 4}px`);
    };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType === "touch") return;
      const bounds = frame.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      if (!scheduledFrame) scheduledFrame = requestAnimationFrame(applyPointer);
    };
    const reset = () => {
      pointerX = 0;
      pointerY = 0;
      if (!scheduledFrame) scheduledFrame = requestAnimationFrame(applyPointer);
    };
    const cancelMotion = () => {
      animations.forEach((animation) => animation.cancel());
      reset();
      if (motion.matches) {
        frame.removeEventListener("pointermove", move);
        frame.removeEventListener("pointerleave", reset);
      }
    };
    frame.addEventListener("pointermove", move, { passive: true });
    frame.addEventListener("pointerleave", reset);
    motion.addEventListener("change", cancelMotion);
    pointer.addEventListener("change", reset);
    return () => {
      animations.forEach((animation) => animation.cancel());
      cancelAnimationFrame(scheduledFrame);
      frame.removeEventListener("pointermove", move);
      frame.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", cancelMotion);
      pointer.removeEventListener("change", reset);
      frame.style.removeProperty("--hero-rotate-x");
      frame.style.removeProperty("--hero-rotate-y");
      frame.style.removeProperty("--hero-shift-x");
      frame.style.removeProperty("--hero-shift-y");
    };
  }, []);

  return (
    <div className={styles.artFrame} ref={frameRef}>
      <div className={styles.artDepth}>{children}</div>
      <div className={styles.graticule} aria-hidden="true" />
      <div className={styles.shutters} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} data-hero-shutter />
        ))}
      </div>
    </div>
  );
}

const technologies = ["Python", "SQL", "Apache Airflow", "dbt", "Apache Iceberg", "Trino", "Docker"];
const scrambleAlphabet = "01/+_:<>";

/** Source study: Codrops ScrollTextMotion's short scramble-to-original reveal.
 * Stable, screen-reader text is separate from the animated decorative copy.
 */
export function KineticTechnologyRail() {
  const railRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!rail || motion.matches) return;

    const labels = Array.from(rail.querySelectorAll<HTMLElement>("[data-technology]"));
    const originals = new Map(labels.map((label) => [label, label.textContent ?? ""]));
    const active = new Map<HTMLElement, number>();
    let animationFrame = 0;
    let previous = 0;

    const animate = (time: number) => {
      if (time - previous >= 40) {
        previous = time;
        for (const [label, start] of active) {
          if (time < start) continue;
          const original = originals.get(label) ?? "";
          const progress = Math.max(0, Math.min(1, (time - start) / 650));
          const revealed = Math.floor(progress * original.length);
          label.textContent = Array.from(original, (character, index) =>
            character === " " || index < revealed
              ? character
              : scrambleAlphabet[(index + Math.floor(time / 55)) % scrambleAlphabet.length],
          ).join("");
          if (progress === 1) {
            label.textContent = original;
            active.delete(label);
          }
        }
      }
      animationFrame = active.size ? requestAnimationFrame(animate) : 0;
    };
    const reveal = (label: HTMLElement, delay = 0) => {
      active.set(label, performance.now() + delay);
      if (!animationFrame) animationFrame = requestAnimationFrame(animate);
    };
    const over = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType === "touch" || !(event.target instanceof Element)) return;
      const label = event.target.closest<HTMLElement>("[data-technology]");
      if (label && originals.has(label) && !active.has(label)) reveal(label);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      labels.forEach((label, index) => reveal(label, index * 55));
      observer.disconnect();
    }, { threshold: 0.4 });
    const restore = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      active.clear();
      for (const [label, original] of originals) label.textContent = original;
      if (motion.matches) {
        observer.disconnect();
        rail.removeEventListener("pointerover", over);
      }
    };
    observer.observe(rail);
    rail.addEventListener("pointerover", over, { passive: true });
    motion.addEventListener("change", restore);
    return () => {
      restore();
      observer.disconnect();
      rail.removeEventListener("pointerover", over);
      motion.removeEventListener("change", restore);
    };
  }, []);

  return (
    <ul ref={railRef} className={styles.technologyRail} aria-label="Core technologies">
      {technologies.map((technology, index) => (
        <li key={technology}>
          <span className={styles.accessible}>{technology}</span>
          <span className={styles.technologyLabel} data-technology aria-hidden="true">{technology}</span>
          {index < technologies.length - 1 ? <i aria-hidden="true">✳</i> : null}
        </li>
      ))}
    </ul>
  );
}
