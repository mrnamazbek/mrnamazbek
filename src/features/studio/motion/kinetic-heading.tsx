"use client";
import { useEffect, useRef } from "react";
import { useStudioVelocity } from "../runtime/studio-runtime";
import { velocityToSkew } from "./interaction-policy";
import { useInteractionPolicy } from "./use-interaction-policy";
import styles from "./motion.module.css";
export function KineticHeading({
  text,
  as: Heading,
}: {
  text: string;
  as: "h1" | "h2";
}): React.JSX.Element {
  const enabled = useInteractionPolicy();
  const root = useRef<HTMLHeadingElement>(null);
  const velocity = useStudioVelocity();
  useEffect(() => {
    const element = root.current;
    if (!enabled || !element || element.dataset.kineticEntered === "true")
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        element.dataset.kineticEntered = "true";
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const reset = () =>
      root.current?.style.setProperty("--heading-skew", "0deg");
    const detach = velocity.on("change", (value) =>
      root.current?.style.setProperty(
        "--heading-skew",
        `${velocityToSkew(value)}deg`,
      ),
    );
    window.addEventListener("blur", reset);
    return () => {
      detach();
      window.removeEventListener("blur", reset);
      reset();
    };
  }, [enabled, velocity]);
  let index = 0;
  return (
    <Heading ref={root} className={styles.heading} data-enhanced={enabled}>
      <span className={styles.semantic}>{text}</span>
      <span className={styles.visual} aria-hidden="true">
        {text.split(" ").map((word, i) => (
          <span key={i}>
            <span className={styles.word} data-kinetic-word>
              {Array.from(word).map((char, j) => (
                <span
                  className={styles.character}
                  data-kinetic-character
                  key={j}
                  style={{ "--char-index": index++ } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </span>{" "}
          </span>
        ))}
      </span>
    </Heading>
  );
}
