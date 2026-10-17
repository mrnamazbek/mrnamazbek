"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { Group, InstancedMesh, Object3D, PointLight } from "three";
import type { SceneSignals } from "../modules/types";
import { poseChannelAt } from "./core-pose";

function updateCamera(
  camera: import("three").Camera,
  x: number,
  y: number,
  z: number,
) {
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
}
function poseApproach(
  current: number,
  signals: SceneSignals,
  channel: Parameters<typeof poseChannelAt>[1],
  alpha: number,
  remaining: { current: number },
  offset = 0,
  multiplier = 1,
) {
  const target =
    poseChannelAt(signals.progress, channel, signals.mode) * multiplier +
    offset;
  const difference = target - current;
  remaining.current = Math.max(remaining.current, Math.abs(difference));
  return Math.abs(difference) < 0.0002 ? target : current + difference * alpha;
}
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
  const remaining = useRef(0);
  const { invalidate, camera } = useThree();

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
    remaining.current = 0;
    root.current.rotation.set(
      poseApproach(
        root.current.rotation.x,
        signals,
        "rotationX",
        alpha,
        remaining,
        signals.pointerY * 0.07,
      ),
      poseApproach(
        root.current.rotation.y,
        signals,
        "rotationY",
        alpha,
        remaining,
        signals.pointerX * 0.1,
      ),
      poseApproach(
        root.current.rotation.z,
        signals,
        "rotationZ",
        alpha,
        remaining,
      ),
    );
    root.current.scale.setScalar(
      poseApproach(root.current.scale.x, signals, "scale", alpha, remaining),
    );
    updateCamera(
      camera,
      poseApproach(camera.position.x, signals, "cameraX", alpha, remaining),
      poseApproach(camera.position.y, signals, "cameraY", alpha, remaining),
      poseApproach(camera.position.z, signals, "cameraZ", alpha, remaining),
    );
    expansion.current = poseApproach(
      expansion.current,
      signals,
      "layerExpansion",
      alpha,
      remaining,
    );
    if (layers.current) {
      for (let index = 0; index < layers.current.children.length; index++) {
        layers.current.children[index].position.y =
          (index - 2) * (0.23 + expansion.current * 0.31);
      }
    }
    if (material.current)
      material.current.distortion = poseApproach(
        material.current.distortion,
        signals,
        "distortion",
        alpha,
        remaining,
      );
    if (light.current)
      light.current.intensity = poseApproach(
        light.current.intensity,
        signals,
        "lightIntensity",
        alpha,
        remaining,
        0,
        16,
      );
    if (remaining.current > 0.0002) invalidate();
  });

  return (
    <group ref={root} position={[0, 0, 0]} rotation={[0.2, 0, -0.13]}>
      <group rotation={[0.5, 0.1, -0.38]} scale={0.66}>
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
                  color={i === 0 ? "#567c8e" : "#314f5e"}
                  metalness={0.3}
                  roughness={0.36}
                  emissive="#14313e"
                  emissiveIntensity={0.5}
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
    </group>
  );
}
