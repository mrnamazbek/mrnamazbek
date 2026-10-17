"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { motionValue, type MotionValue } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneSignals } from "../modules/types";
import { createSceneSignals, resetSceneSignals } from "./signals";
import { getSceneRouteMode } from "./route-mode";
import { connectScrollBridge } from "./scroll-bridge";

gsap.registerPlugin(ScrollTrigger);
export const studioMotionQuery =
  "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";
const nativeRegions =
  "dialog, input, textarea, select, [contenteditable], [data-lenis-prevent]";
const scrollKeys = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Tab",
]);
const RuntimeContext = createContext<{
  signals: SceneSignals;
  velocity: MotionValue<number>;
} | null>(null);

export function useStudioSignals(): SceneSignals {
  const context = useContext(RuntimeContext);
  if (!context) throw new Error("Studio signals require StudioRuntime");
  return context.signals;
}
export function useStudioVelocity(): MotionValue<number> {
  const context = useContext(RuntimeContext);
  if (!context) throw new Error("Studio velocity requires StudioRuntime");
  return context.velocity;
}

function ScrollOwner() {
  const lenis = useLenis();
  const velocity = useStudioVelocity();
  useEffect(() => {
    if (!lenis) return;
    const context = gsap.context(() => {});
    const detach = connectScrollBridge({
      lenis,
      update: () => {
        velocity.set(lenis.isScrolling === "smooth" ? lenis.velocity : 0);
        ScrollTrigger.update();
      },
      ticker: gsap.ticker,
    });
    const cancel = () => {
      // Stop pending wheel inertia at the browser's current position.
      lenis.stop();
      lenis.start();
      velocity.set(0);
    };
    const key = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) cancel();
    };
    const click = (event: MouseEvent) => {
      if (
        event.composedPath().some((node) => node instanceof HTMLAnchorElement)
      )
        cancel();
    };
    window.addEventListener("keydown", key, true);
    window.addEventListener("click", click, true);
    window.addEventListener("popstate", cancel);
    window.addEventListener("hashchange", cancel);
    document.addEventListener("focusin", cancel, true);
    return () => {
      detach();
      context.revert();
      velocity.set(0);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("click", click, true);
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("hashchange", cancel);
      document.removeEventListener("focusin", cancel, true);
      lenis.stop();
    };
  }, [lenis, velocity]);
  return null;
}

export function StudioRuntime({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const [enhanced, setEnhanced] = useState(false);
  const [runtime] = useState(() => ({
    signals: createSceneSignals(),
    velocity: motionValue(0),
  }));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia(studioMotionQuery);
    const reconcile = () => setEnhanced(query.matches && !document.hidden);
    query.addEventListener("change", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    reconcile();
    return () => {
      query.removeEventListener("change", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
    };
  }, []);
  useEffect(() => {
    resetSceneSignals(runtime.signals, getSceneRouteMode(pathname));
    runtime.velocity.set(0);
    root.current?.setAttribute("data-scene-mode", runtime.signals.mode);
    window.dispatchEvent(new Event("studio:invalidate"));
  }, [pathname, runtime]);

  return (
    <RuntimeContext value={runtime}>
      <div
        ref={root}
        data-studio-runtime
        data-scene-mode={getSceneRouteMode(pathname)}
      >
        {enhanced ? (
          <ReactLenis
            root
            options={{
              autoRaf: false,
              lerp: 0.16,
              smoothWheel: true,
              syncTouch: false,
              anchors: false,
              allowNestedScroll: true,
              stopInertiaOnNavigate: true,
              respectReducedMotion: true,
              prevent: (node) => node.matches(nativeRegions),
              virtualScroll: ({ event }) =>
                !event.shiftKey && !document.querySelector("dialog[open]"),
            }}
          >
            <ScrollOwner />
          </ReactLenis>
        ) : null}
        {children}
      </div>
    </RuntimeContext>
  );
}
