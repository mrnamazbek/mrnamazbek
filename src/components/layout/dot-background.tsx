"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronUp, CircleDot, Pause, Play } from "lucide-react";
import type { DotEffect, DotRenderer } from "@/lib/visual-effects/dot-shader";
import styles from "./dot-background.module.css";

const effects: { id: DotEffect; label: string; description: string }[] = [
  { id: "magnetic", label: "Magnetic dots", description: "A quiet grid bends toward your cursor." },
  { id: "flow", label: "Flow dots", description: "Soft streams curl around your movement." },
  { id: "ripple", label: "Ripple dots", description: "Your cursor leaves little waves behind." },
];
const preferenceKey = "nb-dot-background";
const preferenceEvent = "nb-dot-background-change";
const capableQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine)";
const reducedQuery = "(prefers-reduced-motion: reduce)";
const defaultPreference = "magnetic:playing";
let sessionPreference = defaultPreference;

function readPreference() {
  try {
    const stored = localStorage.getItem(preferenceKey);
    if (/^(magnetic|flow|ripple):(playing|paused)$/.test(stored ?? "")) return stored!;
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

function writePreference(effect: DotEffect, paused: boolean) {
  sessionPreference = `${effect}:${paused ? "paused" : "playing"}`;
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

    const allowed = () => capable.matches && !reduced.matches;
    const paused = () => preference.endsWith(":paused");
    const canRun = () => !disposed && !failed && allowed() && !paused() && !document.hidden;
    const draw = () => renderer?.render({
      effect: preference.split(":")[0] as DotEffect,
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
      if (!canRun()) return;
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
      const next = readPreference();
      const changedEffect = next.split(":")[0] !== preference.split(":")[0];
      preference = next;
      if (changedEffect) draw();
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
  const effect = preference.split(":")[0] as DotEffect;
  const paused = preference.endsWith(":paused");
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unavailable = useDotRenderer(canvasRef);
  const selected = effects.find((item) => item.id === effect)!;

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", closeOnOutside, { passive: true });
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <>
    <div className={styles.layer} data-testid="dot-background" data-effect={effect} aria-hidden="true">
      <div className={styles.fallback} />
      <canvas ref={canvasRef} className={styles.canvas} data-testid="dot-background-canvas" data-renderer="static" data-state="static" />
    </div>
    <div ref={controlsRef} className={styles.controls}>
      <button ref={triggerRef} type="button" className={styles.trigger} aria-label="Background effects" aria-expanded={open} aria-controls="background-effects-panel" onClick={() => setOpen((value) => !value)}>
        <CircleDot size={15} /><span>Background <span className={styles.current}>{selected.label.replace(" dots", "")}</span></span><ChevronUp size={13} className={open ? styles.expanded : undefined} />
      </button>
      {open && <div id="background-effects-panel" className={styles.panel}>
        <fieldset>
          <legend>Choose a background</legend>
          <p className={styles.intro}>Three small ways to follow your curiosity.</p>
          {effects.map((item, index) => <label className={styles.option} key={item.id}>
            <input type="radio" name="dot-background" aria-label={item.label} value={item.id} checked={effect === item.id} onChange={() => writePreference(item.id, paused)} />
            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
            <span><strong>{item.label}</strong><span>{item.description}</span></span>
          </label>)}
        </fieldset>
        <div className={styles.panelFooter}>
          <span>{!capable || unavailable ? "Static dots on this device" : "Move your cursor to explore"}</span>
          <button type="button" disabled={!capable || unavailable} aria-pressed={paused} aria-label={paused ? "Resume background animation" : "Pause background animation"} onClick={() => writePreference(effect, !paused)}>
            {paused ? <Play size={13} /> : <Pause size={13} />}{paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>}
    </div>
  </>;
}
