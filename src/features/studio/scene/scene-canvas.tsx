"use client";
import { useEffect, useRef } from "react";
import { Canvas, useThree, useFrame, addAfterEffect } from "@react-three/fiber";
import type { WebGLRenderer } from "three";
import type { SceneSignals } from "../modules/types";
import { EngineeringCore } from "./engineering-core";

function resetCounters(gl: WebGLRenderer, pending: { current: boolean }) {
  pending.current = true;
  gl.info.autoReset = false;
  gl.info.reset();
}
function attachDiagnostics(
  canvas: HTMLCanvasElement,
  snapshot: object,
): () => void {
  const target = canvas as HTMLCanvasElement & { __studioDiagnostics?: object };
  target.__studioDiagnostics = snapshot;
  return () => {
    delete target.__studioDiagnostics;
  };
}
function Diagnostics({ signals }: { signals: SceneSignals }) {
  const { gl } = useThree();
  const pending = useRef(false);
  const snapshot = useRef({
    frames: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    mode: signals.mode,
    progress: 0,
    passScope: "all-renderer-passes-since-frame-reset",
  });
  useFrame(() => resetCounters(gl, pending), -100);
  useEffect(() => {
    const target = gl.domElement;
    const removeSnapshot = attachDiagnostics(target, snapshot.current);
    const detach = addAfterEffect(() => {
      // R3F global tail effects may run without rendering this root.
      if (!pending.current) return;
      pending.current = false;
      const value = snapshot.current;
      value.frames++;

      value.drawCalls = gl.info.render.calls;
      value.triangles = gl.info.render.triangles;
      value.geometries = gl.info.memory.geometries;
      value.textures = gl.info.memory.textures;
      value.mode = signals.mode;
      value.progress = signals.progress;
      if (value.frames === 1)
        target
          .closest("[data-scene-policy]")
          ?.setAttribute("data-scene-ready", "true");
    });
    return () => {
      detach();
      removeSnapshot();
    };
  }, [gl, signals]);
  return null;
}
export default function SceneCanvas({
  signals,
}: {
  signals: SceneSignals;
}): React.JSX.Element {
  return (
    <Canvas
      onCreated={({ gl }) =>
        gl.domElement.setAttribute("data-studio-canvas", "")
      }
      frameloop={signals.paused ? "never" : "demand"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={1.4} color="#a6bdc7" />
      <directionalLight position={[-3, 4, 2]} intensity={3} color="#bdeeff" />
      <directionalLight position={[3, -2, -3]} intensity={2} color="#99e0c0" />
      <EngineeringCore signals={signals} />
      <Diagnostics signals={signals} />
    </Canvas>
  );
}
