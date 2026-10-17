"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState } from "react";
import { useStudioSignals } from "../runtime/studio-runtime";
import { setScenePaused, setScenePointer } from "../runtime/signals";
import { getScenePolicy } from "./scene-policy";
import { ScenePoster } from "./scene-poster";
import styles from "./scene.module.css";
const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });
class SceneBoundary extends Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function SceneHost(): React.JSX.Element {
  const signals = useStudioSignals();
  const host = useRef<HTMLDivElement>(null);
  const [policy, setPolicy] = useState<"poster" | "paused" | "interactive">(
    "poster",
  );
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const queries = [
      "(prefers-reduced-motion: reduce)",
      "(pointer: coarse)",
      "(forced-colors: active)",
    ].map((q) => matchMedia(q));
    const reconcile = () => {
      const next = getScenePolicy({
        reducedMotion: queries[0].matches,
        coarsePointer: queries[1].matches,
        forcedColors: queries[2].matches,
        webglAvailable: true,
        hidden: document.hidden,
      });
      setScenePaused(signals, next !== "interactive");
      setPolicy(next);
      if (next === "interactive")
        window.dispatchEvent(new Event("studio:invalidate"));
    };
    const pointer = (event: PointerEvent) => {
      if (signals.paused) return;
      setScenePointer(
        signals,
        (event.clientX / innerWidth) * 2 - 1,
        (event.clientY / innerHeight) * 2 - 1,
      );
      window.dispatchEvent(new Event("studio:invalidate"));
    };
    const lost = (event: Event) => {
      event.preventDefault();
      setScenePaused(signals, true);
      setFailed(true);
    };
    const leave = () => {
      setScenePointer(signals, 0, 0);
      window.dispatchEvent(new Event("studio:invalidate"));
    };
    queries.forEach((q) => q.addEventListener("change", reconcile));
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerleave", leave);
    const element = host.current;
    element?.addEventListener("webglcontextlost", lost, true);
    reconcile();
    return () => {
      queries.forEach((q) => q.removeEventListener("change", reconcile));
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("pointerleave", leave);
      element?.removeEventListener("webglcontextlost", lost, true);
    };
  }, [signals, attempt]);
  return (
    <div
      ref={host}
      className={styles.host}
      data-scene-policy={failed ? "poster" : policy}
    >
      <div className={styles.art}>
        <ScenePoster />
      </div>
      {policy !== "poster" && !failed ? (
        <div className={styles.canvas}>
          <SceneBoundary key={attempt} onError={() => setFailed(true)}>
            <SceneCanvas signals={signals} />
          </SceneBoundary>
        </div>
      ) : null}
      {failed ? (
        <button
          type="button"
          className={styles.retry}
          onClick={() => {
            setFailed(false);
            setAttempt((n) => n + 1);
          }}
        >
          Retry visual
        </button>
      ) : null}
    </div>
  );
}
