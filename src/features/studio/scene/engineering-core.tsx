"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { Group, InstancedMesh, Object3D, PointLight } from "three";
import type { SceneSignals } from "../modules/types";
import { poseChannelAt } from "./core-pose";

export function EngineeringCore({
  signals,
}: {
  signals: SceneSignals;
}): React.JSX.Element {
  const root = useRef<Group>(null);
  const layers = useRef<Group>(null);
  const nodes = useRef<InstancedMesh>(null);
  const light = useRef<PointLight>(null);
  const material = useRef<{ distortion: number }>(null);
  const expansion = useRef(0);
  const { invalidate, camera, gl } = useThree();

  useLayoutEffect(() => {
    if (!nodes.current) return;
    const object = new Object3D();
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      object.position.set(
        Math.cos(angle) * 1.72,
        ((i % 4) - 1.5) * 0.35,
        Math.sin(angle) * 1.72,
      );
      object.updateMatrix();
      nodes.current.setMatrixAt(i, object.matrix);
    }
    nodes.current.instanceMatrix.needsUpdate = true;
  }, []);
  useEffect(() => {
    const wake = () => {
      if (!signals.paused) invalidate();
    };
    window.addEventListener("studio:invalidate", wake);
    return () => window.removeEventListener("studio:invalidate", wake);
  }, [signals, invalidate]);

  useFrame((_, delta) => {
    if (signals.paused || !root.current) return;
    const alpha = 1 - Math.exp(-18 * Math.min(delta, 0.05));
    let remaining = 0;
    const approach = (current: number, target: number) => {
      const difference = target - current;
      remaining = Math.max(remaining, Math.abs(difference));
      return Math.abs(difference) < 0.0002
        ? target
        : current + difference * alpha;
    };
    const sample = (channel: Parameters<typeof poseChannelAt>[1]) =>
      poseChannelAt(signals.progress, channel, signals.mode);
    root.current.rotation.set(
      approach(
        root.current.rotation.x,
        sample("rotationX") + signals.pointerY * 0.07,
      ),
      approach(
        root.current.rotation.y,
        sample("rotationY") + signals.pointerX * 0.1,
      ),
      approach(root.current.rotation.z, sample("rotationZ")),
    );
    const scale = approach(root.current.scale.x, sample("scale"));
    root.current.scale.setScalar(scale);
    camera.position.set(
      approach(camera.position.x, sample("cameraX") - 1.65),
      approach(camera.position.y, sample("cameraY") + 0.15),
      approach(camera.position.z, sample("cameraZ")),
    );
    camera.lookAt(-1.65, 0, 0);
    expansion.current = approach(expansion.current, sample("layerExpansion"));
    layers.current?.children.forEach((child, index) => {
      child.position.y = (index - 2) * (0.23 + expansion.current * 0.31);
    });
    if (material.current)
      material.current.distortion = approach(
        material.current.distortion,
        sample("distortion"),
      );
    if (light.current)
      light.current.intensity = approach(
        light.current.intensity,
        sample("lightIntensity") * 16,
      );
    gl.domElement.dataset.mode = signals.mode;
    gl.domElement.dataset.progress = signals.progress.toFixed(4);
    if (remaining > 0.0002) invalidate();
  });

  return (
    <group ref={root} rotation={[0.2, 0, -0.13]}>
      <pointLight
        ref={light}
        position={[2, 3, 3]}
        color="#BDEEFF"
        intensity={16}
      />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.64, 0.19, 12, 72]} />
        <MeshTransmissionMaterial
          ref={material}
          resolution={256}
          samples={4}
          backside={false}
          thickness={0.4}
          roughness={0.18}
          transmission={1}
          chromaticAberration={0.025}
          distortion={0.02}
          temporalDistortion={0}
          color="#bdeeff"
        />
      </mesh>
      <group ref={layers}>
        {[-2, -1, 0, 1, 2].map((i) => (
          <group key={i} position={[0, i * 0.23, 0]}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[1.85, 0.085, 1.85]} />
              <meshStandardMaterial
                color={i === 0 ? "#294B53" : "#17262e"}
                metalness={0.85}
                roughness={0.3}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
              <torusGeometry args={[0.75, 0.012, 4, 4]} />
              <meshBasicMaterial color="#8ad8e3" />
            </mesh>
          </group>
        ))}
      </group>
      <instancedMesh ref={nodes} args={[undefined, undefined, 32]}>
        <sphereGeometry args={[0.027, 6, 6]} />
        <meshBasicMaterial color="#99E0C0" />
      </instancedMesh>
      <mesh rotation={[Math.PI / 2, 0.2, 0]}>
        <torusGeometry args={[2.04, 0.006, 4, 96]} />
        <meshBasicMaterial color="#3c6876" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
