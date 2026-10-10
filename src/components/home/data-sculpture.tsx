"use client";

import { useEffect, useRef } from "react";
import type { WebGLRenderer } from "three";

/** Adapted from the coherent particle-wave / proximity techniques in
 * mrnamazbek/ddc-nbk-website, components/three/LogoParticleReveal.tsx.
 * The geometry is an original data torus; no DDC brand assets are reused.
 */
const vertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  attribute float aBrightness;
  varying float vBrightness;
  void main() {
    vec3 p = position;
    float phase = p.x * 0.8 + p.z * 0.7 - uTime * 0.26;
    p.y += sin(phase) * 0.07 + sin(phase * 1.8 + 1.7) * 0.025;
    p.z += sin(p.x * 0.3 - uTime * 0.2) * 0.05;
    float proximity = 1.0 - smoothstep(0.0, 1.5, distance(p.xy, uPointer));
    p.z += proximity * 0.16;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(2.5 * uPixelRatio * (5.0 / -mv.z), 0.7, 3.3);
    vBrightness = aBrightness * (0.82 + proximity * 0.18);
  }
`;
const fragmentShader = `
  varying float vBrightness;
  uniform vec3 uColor;
  void main() {
    float distanceFromCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.08, distanceFromCenter);
    if (alpha < 0.03) discard;
    gl_FragColor = vec4(uColor, alpha * vBrightness);
  }
`;

export function DataSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (
      !container ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 768
    )
      return;
    let disposed = false;
    let renderer: WebGLRenderer | undefined;
    let cleanup: (() => void) | undefined;
    import("three")
      .then((THREE) => {
        if (disposed) return;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 40);
        camera.position.set(0, 0, 9.5);
        const count = 12800;
        const positions = new Float32Array(count * 3);
        const brightness = new Float32Array(count);
        for (let index = 0; index < count; index++) {
          const u = ((index % 160) / 160) * Math.PI * 2;
          const v = (Math.floor(index / 160) / 80) * Math.PI * 2;
          const radius = 1.52 + 0.58 * Math.cos(v);
          positions[index * 3] = radius * Math.cos(u);
          positions[index * 3 + 1] = radius * Math.sin(u);
          positions[index * 3 + 2] = 0.58 * Math.sin(v);
          brightness[index] = 0.3 + (Math.sin(index * 17.3) + 1) * 0.3;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        geometry.setAttribute(
          "aBrightness",
          new THREE.BufferAttribute(brightness, 1),
        );
        const accent = () =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--accent")
            .trim();
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2(10, 10) },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.6) },
            uColor: { value: new THREE.Color(accent()) },
          },
        });
        const themeObserver = new MutationObserver(() =>
          material.uniforms.uColor.value.set(accent()),
        );
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
        const points = new THREE.Points(geometry, material);
        points.rotation.set(0.72, -0.44, -0.5);
        scene.add(points);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");
        container.appendChild(renderer.domElement);
        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          renderer?.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();
        let visible = true;
        let pageVisible = !document.hidden;
        let raf = 0;
        let time = 0;
        let previous = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible || !pageVisible || now - previous < 32) return;
          time += Math.min((now - previous) / 1000, 0.06);
          previous = now;
          material.uniforms.uTime.value = time;
          points.rotation.y = -0.44 + Math.sin(time * 0.13) * 0.13;
          points.rotation.z = -0.5 + Math.sin(time * 0.08) * 0.06;
          renderer?.render(scene, camera);
        };
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        visibilityObserver.observe(container);
        const onVisibility = () => {
          pageVisible = !document.hidden;
          previous = performance.now();
        };
        const onMove = (event: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          material.uniforms.uPointer.value.set(
            ((event.clientX - rect.left) / rect.width - 0.5) * 5,
            -((event.clientY - rect.top) / rect.height - 0.5) * 5,
          );
        };
        const onLeave = () => material.uniforms.uPointer.value.set(10, 10);
        container.addEventListener("pointermove", onMove, { passive: true });
        container.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVisibility);
        container.classList.add("sculpture-ready");
        raf = requestAnimationFrame(frame);
        cleanup = () => {
          cancelAnimationFrame(raf);
          observer.disconnect();
          themeObserver.disconnect();
          visibilityObserver.disconnect();
          container.removeEventListener("pointermove", onMove);
          container.removeEventListener("pointerleave", onLeave);
          document.removeEventListener("visibilitychange", onVisibility);
          geometry.dispose();
          material.dispose();
          renderer?.dispose();
          renderer?.domElement.remove();
          container.classList.remove("sculpture-ready");
        };
      })
      .catch(() => {
        /* The SVG remains as the progressive enhancement fallback. */
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="data-sculpture" ref={containerRef} aria-hidden="true">
      <svg className="sculpture-fallback" viewBox="0 0 500 480">
        <defs>
          <linearGradient id="sculpture-gradient">
            <stop stopColor="#d0ec93" />
            <stop offset="1" stopColor="#6b8350" />
          </linearGradient>
        </defs>
        <g
          transform="translate(250 240) rotate(-26)"
          fill="none"
          stroke="url(#sculpture-gradient)"
          strokeWidth="1"
          opacity=".7"
        >
          {Array.from({ length: 18 }, (_, index) => (
            <ellipse
              key={index}
              rx={142 + index * 3}
              ry={57 + index * 5}
              strokeDasharray="1 5"
            />
          ))}
          {Array.from({ length: 15 }, (_, index) => (
            <ellipse
              key={`v${index}`}
              rx={62 + index * 7}
              ry={108}
              strokeDasharray="1 5"
              transform={`rotate(${index * 12})`}
            />
          ))}
        </g>
      </svg>
      <div className="sculpture-crosshair crosshair-top" />
      <div className="sculpture-crosshair crosshair-bottom" />
    </div>
  );
}
