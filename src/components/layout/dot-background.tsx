"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CircleDot, Pause, Play } from "lucide-react";
import type { DotRenderer } from "@/lib/visual-effects/dot-shader";
import styles from "./dot-background.module.css";

const preferenceKey = "nb-dot-background";
const preferenceEvent = "nb-dot-background-change";
const capableQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
const reducedQuery = "(prefers-reduced-motion: reduce)";
const defaultPreference = "ripple:playing";
let sessionPreference = defaultPreference;

function readPreference() {
  try {
    const stored = localStorage.getItem(preferenceKey);
    // Preserve playback preferences saved by the earlier background selector.
    if (/^[a-z]+:(playing|paused)$/.test(stored ?? "")) {
      return stored!.endsWith(":paused") ? "ripple:paused" : defaultPreference;
    }
  } catch { /* The selection also works when storage is unavailable. */ }
  return sessionPreference;
}

function subscribePreference(listener: () => void) {
  window.addEventListener(preferenceEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(preferenceEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

function writePreference(paused: boolean) {
  sessionPreference = `ripple:${paused ? "paused" : "playing"}`;
  try { localStorage.setItem(preferenceKey, sessionPreference); } catch { /* Keep the session selection. */ }
  window.dispatchEvent(new Event(preferenceEvent));
}

function readMotionCapability() {
  return window.matchMedia(capableQuery).matches && !window.matchMedia(reducedQuery).matches;
}

function subscribeMotionCapability(listener: () => void) {
  const capable = window.matchMedia(capableQuery);
  const reduced = window.matchMedia(reducedQuery);
  capable.addEventListener("change", listener);
  reduced.addEventListener("change", listener);
  return () => {
    capable.removeEventListener("change", listener);
    reduced.removeEventListener("change", listener);
  };
}

function useDotRenderer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const capable = window.matchMedia(capableQuery);
    const reduced = window.matchMedia(reducedQuery);
    let renderer: DotRenderer | null = null;
    let disposed = false;
    let failed = false;
    let loading = false;
    let generation = 0;
    let animationFrame = 0;
    let elapsed = 0;
    let lastDraw = 0;
    let lastClock: number | null = null;
    let preference = readPreference();
    const target = { x: innerWidth / 2, y: innerHeight / 2, active: false };
    const pointer = { ...target };

    // Read the current media state even while a browser's change event is queued.
    const allowed = readMotionCapability;
    const paused = () => preference.endsWith(":paused");
    const canRun = () => !disposed && !failed && allowed() && !paused() && !document.hidden;
    const draw = () => renderer?.render({
      elapsed,
      pointer,
      lightTheme: document.documentElement.dataset.theme === "light",
    });
    const stop = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastClock = null;
    };
    const fallback = () => {
      stop();
      renderer?.dispose();
      renderer = null;
      canvas.dataset.renderer = "static";
      canvas.dataset.state = failed ? "unavailable" : "static";
    };
    const resize = () => {
      if (!renderer || !allowed()) return;
      const width = innerWidth;
      const height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1_500_000 / (width * height)));
      renderer.resize(width, height, ratio);
      draw();
    };
    const tick = (now: number) => {
      animationFrame = 0;
      if (!canRun()) {
        reconcile();
        return;
      }
      if (now - lastDraw >= 1000 / 30) {
        elapsed += lastClock === null ? 0 : Math.min((now - lastClock) / 1000, 0.1);
        lastClock = now;
        lastDraw = now;
        pointer.x += (target.x - pointer.x) * 0.24;
        pointer.y += (target.y - pointer.y) * 0.24;
        pointer.active = target.active;
        draw();
      }
      animationFrame = requestAnimationFrame(tick);
    };
    const reconcile = () => {
      if (disposed) return;
      if (!allowed() || failed) {
        generation++;
        loading = false;
        fallback();
        return;
      }
      if (!renderer && !loading) {
        loading = true;
        const ticket = ++generation;
        void import("@/lib/visual-effects/dot-shader").then(({ createDotRenderer }) => {
          if (disposed || ticket !== generation || !allowed()) return;
          loading = false;
          try {
            renderer = createDotRenderer(canvas);
            resize();
            canvas.dataset.renderer = "webgl";
            reconcile();
          } catch {
            failed = true;
            setUnavailable(true);
            fallback();
          }
        }).catch(() => {
          if (disposed || ticket !== generation) return;
          failed = true;
          loading = false;
          setUnavailable(true);
          fallback();
        });
      }
      if (!renderer) return;
      if (canRun()) {
        canvas.dataset.state = "running";
        if (!animationFrame) animationFrame = requestAnimationFrame(tick);
      } else {
        stop();
        canvas.dataset.state = document.hidden ? "hidden" : "paused";
      }
    };
    const updatePreference = () => {
      preference = readPreference();
      reconcile();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !canRun()) return;
      target.x = event.clientX;
      target.y = event.clientY;
      target.active = true;
    };
    const leave = () => { target.active = false; };
    const onCapability = () => {
      target.active = false;
      reconcile();
    };
    const onTheme = () => { if (!document.hidden) draw(); };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      failed = true;
      generation++;
      setUnavailable(true);
      fallback();
    };
    const onContextRestored = () => {
      failed = false;
      setUnavailable(false);
      reconcile();
    };

    const unsubscribePreference = subscribePreference(updatePreference);
    capable.addEventListener("change", onCapability);
    reduced.addEventListener("change", onCapability);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("resize", resize);
    window.addEventListener("nb-theme-change", onTheme);
    document.addEventListener("visibilitychange", reconcile);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    reconcile();

    return () => {
      disposed = true;
      generation++;
      fallback();
      unsubscribePreference();
      capable.removeEventListener("change", onCapability);
      reduced.removeEventListener("change", onCapability);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("resize", resize);
      window.removeEventListener("nb-theme-change", onTheme);
      document.removeEventListener("visibilitychange", reconcile);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [canvasRef]);

  return unavailable;
}

export function DotBackground() {
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => defaultPreference);
  const capable = useSyncExternalStore(subscribeMotionCapability, readMotionCapability, () => false);
  const paused = preference.endsWith(":paused");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unavailable = useDotRenderer(canvasRef);

  return <>
    <div className={styles.layer} data-testid="dot-background" data-effect="ripple" aria-hidden="true">
      <div className={styles.fallback} />
      <canvas ref={canvasRef} className={styles.canvas} data-testid="dot-background-canvas" data-renderer="static" data-state="static" />
    </div>
    <div className={styles.controls}>
      <button type="button" className={styles.trigger} disabled={!capable || unavailable} aria-pressed={paused} aria-label={paused ? "Resume background animation" : "Pause background animation"} onClick={() => writePreference(!paused)}>
        <CircleDot size={15} /><span>Ripple background</span>
        <span className={styles.playback}>{!capable || unavailable ? "Static" : paused ? <><Play size={12} /> Play</> : <><Pause size={12} /> Pause</>}</span>
      </button>
    </div>
  </>;
}
