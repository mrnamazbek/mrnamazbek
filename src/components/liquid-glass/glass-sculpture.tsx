"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { GlassRenderer } from "@/lib/visual-effects/glass-sculpture";
import styles from "./glass-sculpture.module.css";

function GlassPoster() {
  const id = useId().replaceAll(":", "");
  return (
    <svg className={styles.fallback} data-testid="glass-sculpture-fallback" viewBox="0 0 500 500" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="120" y1="100" x2="390" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a8def1" />
          <stop offset="0.25" stopColor="#f8f6ff" />
          <stop offset="0.47" stopColor="#9991cd" />
          <stop offset="0.67" stopColor="#e4d8ff" />
          <stop offset="1" stopColor="#9fbadb" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="130" y1="140" x2="360" y2="360" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="0.45" stopColor="#e0e5ff" />
          <stop offset="1" stopColor="#687aa9" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <ellipse cx="253" cy="395" rx="113" ry="15" fill="#777da7" opacity="0.18" filter={`url(#${id}-shadow)`} />
      <g transform="rotate(-19 250 250)">
        <path d="M170 188C217 108 331 115 365 201C403 299 294 345 227 315C151 281 102 244 142 174C180 107 292 203 294 276C296 356 185 388 147 313C107 234 217 151 288 166C380 185 357 339 267 341C179 343 123 267 170 188Z" fill="none" stroke={`url(#${id}-edge)`} strokeWidth="50" strokeLinecap="round" />
        <path d="M170 188C217 108 331 115 365 201C403 299 294 345 227 315C151 281 102 244 142 174C180 107 292 203 294 276C296 356 185 388 147 313C107 234 217 151 288 166C380 185 357 339 267 341C179 343 123 267 170 188Z" fill="none" stroke={`url(#${id}-body)`} strokeWidth="43" strokeLinecap="round" />
        <path d="M191 155C248 111 323 145 343 203M164 299C182 346 238 344 266 320M144 214C146 177 179 166 212 184" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.82" />
      </g>
    </svg>
  );
}

export function GlassSculpture() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const playbackRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const capabilityQuery = "(min-width: 768px) and (pointer: fine) and (hover: hover)";
    const motionQuery = "(prefers-reduced-motion: reduce)";
    const capable = () => window.matchMedia(capabilityQuery).matches && !window.matchMedia(motionQuery).matches;
    const desktop = window.matchMedia(capabilityQuery);
    const motion = window.matchMedia(motionQuery);
    const controller = new AbortController();
    let disposed = false;
    let loading = false;
    let failed = false;
    let visible = false;
    let frame = 0;
    let previousFrame = 0;
    let renderer: GlassRenderer | null = null;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const canMove = () => !disposed && visible && !document.hidden && capable() && !pausedRef.current;

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
    };
    const draw = (timestamp: number) => {
      frame = 0;
      if (!canMove() || !renderer) {
        if (!capable()) release();
        return;
      }
      if (previousFrame && timestamp - previousFrame < 1000 / 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      previousFrame = timestamp;
      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;
      renderer.render(current);
      const distance = Math.abs(target.x - current.x) + Math.abs(target.y - current.y);
      if (distance > 0.001) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (canMove() && renderer && !frame) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      if (!renderer) return;
      const bounds = stage.getBoundingClientRect();
      renderer.resize(bounds.width, bounds.height, window.devicePixelRatio || 1);
      if (visible && !document.hidden) renderer.render(current);
    };
    const release = () => {
      stop();
      const instance = renderer;
      renderer = null;
      instance?.dispose();
      if (!disposed) setReady(false);
    };
    async function load() {
      if (renderer || loading || failed || !canMove()) return;
      loading = true;
      try {
        const { createGlassRenderer } = await import("@/lib/visual-effects/glass-sculpture");
        if (!canMove()) return;
        renderer = createGlassRenderer(canvas!);
        if (!renderer) { failed = true; return; }
        resize();
        setReady(true);
        schedule();
      } catch {
        failed = true;
        release();
      } finally {
        loading = false;
      }
    }
    const reconcile = () => {
      if (!capable()) { release(); return; }
      if (!canMove()) { stop(); return; }
      if (renderer) { resize(); schedule(); }
      else void load();
    };
    playbackRef.current = reconcile;

    stage.addEventListener("pointermove", event => {
      if (!canMove()) return;
      const bounds = stage.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / Math.max(1, bounds.height) * 2 - 1));
      schedule();
    }, { passive: true, signal: controller.signal });
    stage.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
      schedule();
    }, { passive: true, signal: controller.signal });
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      failed = true;
      release();
    }, { signal: controller.signal });
    document.addEventListener("visibilitychange", reconcile, { signal: controller.signal });
    desktop.addEventListener("change", reconcile, { signal: controller.signal });
    motion.addEventListener("change", reconcile, { signal: controller.signal });
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      reconcile();
    }, { threshold: 0.05 });
    intersection.observe(stage);
    const dimensions = new ResizeObserver(resize);
    dimensions.observe(stage);

    return () => {
      disposed = true;
      controller.abort();
      intersection.disconnect();
      dimensions.disconnect();
      playbackRef.current = null;
      release();
    };
  }, []);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    playbackRef.current?.();
  };

  return (
    <div ref={stageRef} className={styles.stage} data-testid="glass-sculpture" data-renderer={ready ? "webgl" : "static"}>
      <GlassPoster />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <p className={styles.eyebrow}>FORM / FEELING</p>
      <p className={styles.caption}>{ready ? "Move your cursor. See another angle." : "A little room for curiosity."}</p>
      {ready && (
        <button type="button" className={styles.control} onClick={toggle} aria-label={paused ? "Resume glass motion" : "Pause glass motion"} aria-pressed={paused}>
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
