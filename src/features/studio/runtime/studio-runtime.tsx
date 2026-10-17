"use client";

import {
  Profiler,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { motionValue, type MotionValue } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneSignals } from "../modules/types";
import {
  createSceneSignals,
  resetSceneSignals,
  setScenePaused,
} from "./signals";
import { getSceneRouteMode } from "./route-mode";
import { connectScrollBridge } from "./scroll-bridge";
import { createChapterNavigation } from "./chapter-navigation";

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
  chapterNavigation: ReturnType<typeof createChapterNavigation>;
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

export function useStudioChapterNavigation() {
  const context = useContext(RuntimeContext);
  if (!context) throw new Error("Studio navigation requires StudioRuntime");
  return context.chapterNavigation;
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
    };
  }, [lenis, velocity]);
  return null;
}

function attachProfiler(
  element: HTMLDivElement,
  snapshot: { commits: number },
) {
  const target = element as HTMLDivElement & {
    __studioProfiler?: { commits: number };
  };
  target.__studioProfiler = snapshot;
  return () => {
    delete target.__studioProfiler;
  };
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
    chapterNavigation: createChapterNavigation(),
  }));
  const root = useRef<HTMLDivElement>(null);
  const scrollOwner = useRef<LenisRef | null>(null);
  const bindScrollOwner = useCallback((instance: LenisRef | null) => {
    // Ref detaches before ReactLenis' passive destroy. Stopping in the child
    // effect cleanup would run after destroy and resurrect lenis-stopped.
    if (!instance) scrollOwner.current?.lenis?.stop();
    scrollOwner.current = instance;
  }, []);
  const profile = useRef({ commits: 0 });
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STUDIO_PROFILE !== "1" || !root.current) return;
    return attachProfiler(root.current, profile.current);
  }, []);

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
    const cancelPendingChapter = () => runtime.chapterNavigation.cancel();
    const cancelOnLink = (event: MouseEvent) => {
      if (
        event.composedPath().some((node) => node instanceof HTMLAnchorElement)
      )
        cancelPendingChapter();
    };
    // Capture runs before Link's onNavigate can request the next chapter.
    window.addEventListener("click", cancelOnLink, true);
    window.addEventListener("popstate", cancelPendingChapter);
    return () => {
      cancelPendingChapter();
      window.removeEventListener("click", cancelOnLink, true);
      window.removeEventListener("popstate", cancelPendingChapter);
    };
  }, [runtime]);
  useEffect(() => {
    if (pathname !== "/studio") runtime.chapterNavigation.cancel();
    resetSceneSignals(runtime.signals, getSceneRouteMode(pathname));
    if (document.hidden) setScenePaused(runtime.signals, true);
    runtime.velocity.set(0);
    root.current?.setAttribute("data-scene-mode", runtime.signals.mode);
    window.dispatchEvent(new Event("studio:invalidate"));
  }, [pathname, runtime]);

  const content = (
    <div
      ref={root}
      data-studio-runtime
      data-scene-mode={getSceneRouteMode(pathname)}
    >
      {enhanced ? (
        <ReactLenis
          ref={bindScrollOwner}
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
  );
  return (
    <RuntimeContext value={runtime}>
      {process.env.NEXT_PUBLIC_STUDIO_PROFILE === "1" ? (
        <Profiler
          id="studio-interactions"
          onRender={() => {
            profile.current.commits++;
          }}
        >
          {content}
        </Profiler>
      ) : (
        content
      )}
    </RuntimeContext>
  );
}
