"use client";
import { useEffect } from "react";
import { Canvas, useThree, useFrame, addAfterEffect } from "@react-three/fiber";
import type { SceneSignals } from "../modules/types";
import { EngineeringCore } from "./engineering-core";

function Diagnostics() {
  const { gl } = useThree();
  useFrame(() => {
    gl.info.autoReset = false;
    gl.info.reset();
  }, -100);
  useEffect(() => {
    let frames = 0;
    // Observe completed render passes without scheduling any new frames.
    const detach = addAfterEffect(() => {
      gl.domElement.dataset.frames = String(++frames);
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
      gl.domElement.dataset.textures = String(gl.info.memory.textures);
      gl.domElement.dataset.passScope = "all-renderer-passes-since-frame-reset";
    });
    return detach;
  }, [gl]);
  return null;
}
export default function SceneCanvas({
  signals,
}: {
  signals: SceneSignals;
}): React.JSX.Element {
  return (
    <Canvas
      onCreated={({ gl }) => { gl.domElement.setAttribute("data-studio-canvas", ""); }}
      data-studio-canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [-1.65, 0.15, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={1.4} color="#a6bdc7" />
      <directionalLight position={[-3, 4, 2]} intensity={3} color="#bdeeff" />
      <directionalLight position={[3, -2, -3]} intensity={2} color="#99e0c0" />
      <EngineeringCore signals={signals} />
      <Diagnostics />
    </Canvas>
  );
}
