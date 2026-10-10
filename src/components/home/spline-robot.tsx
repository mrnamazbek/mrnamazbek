"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import type { Application } from "@splinetool/runtime";
import styles from "./spline-robot.module.css";

const SCENE = "/assets/3d/ddcnb-robot.splinecode";

/** The actual exported DDCNB scene, rendered locally with bounded head motion.
 * Manual rendering avoids the export's obsolete timeline and unrelated events.
 */
export function SplineRobot() {
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
    const capable = window.matchMedia("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let disposed = false;
    let loaded = false;
    let inView = false;
    let frame = 0;
    let idle = 0;
    let cleanupScene: (() => void) | undefined;
    let app: Application | null = null;
    const canMove = () => inView && !document.hidden && capable.matches && !pausedRef.current;
    const disposeApp = () => {
      const instance = app;
      app = null;
      instance?.dispose();
    };
    const controller = new AbortController();

    async function load() {
      if (loaded || disposed || !inView || document.hidden || !capable.matches) return;
      loaded = true;
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      if (!context) return;
      context.getExtension("WEBGL_lose_context")?.loseContext();
      try {
        const [{ Application }, response] = await Promise.all([
          import("@splinetool/runtime"),
          fetch(SCENE, { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error("Robot scene unavailable");
        const bytes = await response.arrayBuffer();
        if (disposed) return;
        const scene = new Application(canvas!, {
          renderMode: "manual",
          renderer: "webgl",
          htmlContentMode: "none",
          wasmPath: "/assets/3d/runtime/",
        });
        app = scene;
        await scene.start(bytes, { interactive: false });
        if (disposed) return;
        scene.setBackgroundColor("transparent");
        const robot = scene.findObjectByName("Bot");
        if (robot) {
          robot.rotation.y = 0;
          robot.scale.x *= 1.38;
          robot.scale.y *= 1.38;
          robot.scale.z *= 1.38;
        }
        const light = scene.findObjectByName("Point Light");
        if (light) { light.position.x = -250; light.position.z = 550; light.intensity = 40; }
        scene.findObjectByName("logo_ddc")?.hide();
        const head = scene.findObjectByName("Head");
        const base = head ? { x: head.rotation.x, y: head.rotation.y } : null;
        const target = { x: 0, y: 0 };
        const current = { x: 0, y: 0 };
        const draw = () => {
          frame = 0;
          if (!canMove() || !head || !base) return;
          current.x += (target.x - current.x) * 0.12;
          current.y += (target.y - current.y) * 0.12;
          head.rotation.x = base.x + current.x;
          head.rotation.y = base.y + current.y;
          scene.requestRender();
          if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.0005) frame = requestAnimationFrame(draw);
        };
        const wake = () => { if (!frame && canMove()) frame = requestAnimationFrame(draw); };
        const onPointer = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" || !canMove()) return;
          target.y = Math.max(-0.38, Math.min(0.38, (event.clientX / window.innerWidth - 0.5) * 0.7));
          target.x = Math.max(-0.14, Math.min(0.14, (event.clientY / window.innerHeight - 0.5) * 0.24));
          wake();
        };
        const reset = () => { target.x = 0; target.y = 0; wake(); };
        let resizePending = true;
        const resize = () => {
          if (!canMove()) return;
          const { width, height } = stage!.getBoundingClientRect();
          if (width && height) {
            scene.setSize(width, height);
            scene.setZoom(1.25);
            scene.requestRender();
            resizePending = false;
          }
        };
        const resizeObserver = new ResizeObserver(() => { resizePending = true; resize(); });
        resizeObserver.observe(stage!);
        const visibilityChange = () => {
          if (!canMove()) {
            cancelAnimationFrame(frame);
            frame = 0;
            scene.stop();
          } else {
            scene.play();
            if (resizePending) resize();
            scene.requestRender();
            wake();
          }
        };
        playbackRef.current = visibilityChange;
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.documentElement.addEventListener("pointerleave", reset);
        setReady(capable.matches);
        visibilityChange();
        cleanupScene = () => {
          resizeObserver.disconnect();
          window.removeEventListener("pointermove", onPointer);
          document.documentElement.removeEventListener("pointerleave", reset);
        };
      } catch {
        disposeApp();
        if (!disposed) setReady(false);
        // The visible local poster remains usable when 3D cannot load.
      }
    }
    const scheduleLoad = () => {
      if (loaded || disposed || !inView || document.hidden || !capable.matches) return;
      if (idle) window.cancelIdleCallback(idle);
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => void load(), { timeout: 1800 });
      else void load();
    };
    const mediaChange = () => {
      setReady(Boolean(playbackRef.current) && capable.matches);
      playbackRef.current?.();
      scheduleLoad();
    };
    const visibilityChange = () => { playbackRef.current?.(); scheduleLoad(); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      playbackRef.current?.();
      scheduleLoad();
    }, { threshold: 0.1 });
    capable.addEventListener("change", mediaChange);
    document.addEventListener("visibilitychange", visibilityChange);
    observer.observe(stage);
    return () => {
      disposed = true;
      controller.abort();
      observer.disconnect();
      if (idle) window.cancelIdleCallback(idle);
      cancelAnimationFrame(frame);
      cleanupScene?.();
      capable.removeEventListener("change", mediaChange);
      document.removeEventListener("visibilitychange", visibilityChange);
      disposeApp();
      playbackRef.current = null;
    };
  }, []);

  const togglePaused = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    playbackRef.current?.();
  };

  return (
    <div className={`${styles.companion} ${ready ? styles.ready : ""}`}>
      <div className={`data-sculpture ${styles.stage} ${ready ? "sculpture-ready" : ""}`} ref={stageRef}>
        <div className={`sculpture-fallback ${styles.poster}`} role="img" aria-label="The DDCNB 3D robot, a curious digital companion">
          <Image src="/assets/3d/robot-poster-dark.png" alt="" width={311} height={500} sizes="(max-width: 650px) 180px, 280px" loading="eager" className={styles.darkPoster} />
          <Image src="/assets/3d/robot-poster-light.png" alt="" width={311} height={500} sizes="(max-width: 650px) 180px, 280px" loading="eager" className={styles.lightPoster} />
        </div>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.orbit} aria-hidden="true" />
      </div>
      <div className={styles.controls}>
        <span className="mono">{ready ? paused ? "TAKING A MOMENT" : "A LITTLE CURIOSITY" : "A DIGITAL COMPANION"}</span>
        {ready && <button type="button" onClick={togglePaused} aria-label={paused ? "Resume robot animation" : "Pause robot animation"} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? "Resume" : "Pause"}</span></button>}
      </div>
      <a href="https://spline.design" target="_blank" rel="noopener noreferrer" className={styles.credit}>Made with Spline</a>
    </div>
  );
}
