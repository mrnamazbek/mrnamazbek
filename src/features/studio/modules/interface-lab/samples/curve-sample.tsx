"use client";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { moveCurvePoint, type Curve } from "../domain";
import { initialCurve } from "../fixtures";
import styles from "../../../components/studio.module.css";
import lab from "../interface-lab.module.css";

type PointIndex = 0 | 1 | 2 | 3;
type Drag = {
  index: PointIndex;
  pointerId: number;
  start: Curve;
  bounds: DOMRect;
  target: SVGGElement;
};
function curvePath(curve: Curve): string {
  return `M${curve[0].x} ${curve[0].y} C${curve[1].x} ${curve[1].y} ${curve[2].x} ${curve[2].y} ${curve[3].x} ${curve[3].y}`;
}
function drawCurve(svg: SVGSVGElement | null, curve: Curve) {
  if (!svg) return;
  svg.querySelector("[data-curve-path]")?.setAttribute("d", curvePath(curve));
  svg
    .querySelector("[data-curve-guides]")
    ?.setAttribute(
      "points",
      curve.map((point) => `${point.x},${point.y}`).join(" "),
    );
  svg
    .querySelectorAll("[data-curve-handle]")
    .forEach((element, index) =>
      element.setAttribute(
        "transform",
        `translate(${curve[index].x} ${curve[index].y})`,
      ),
    );
  svg.style.setProperty("--curve-path", `path("${curvePath(curve)}")`);
}
function cancelDrag(
  drag: RefObject<Drag | null>,
  live: RefObject<Curve>,
  svg: RefObject<SVGSVGElement | null>,
) {
  const current = drag.current;
  if (!current) return;
  drag.current = null;
  live.current = current.start;
  drawCurve(svg.current, current.start);
  if (current.target.hasPointerCapture(current.pointerId))
    current.target.releasePointerCapture(current.pointerId);
}
export function CurveSample(): React.JSX.Element {
  const [curve, setCurve] = useState<Curve>(initialCurve);
  const live = useRef<Curve>(initialCurve);
  const drag = useRef<Drag | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const instructions = useId();
  const commit = (next: Curve) => {
    live.current = next;
    drawCurve(svg.current, next);
    setCurve(next);
  };
  useEffect(() => {
    const cancel = () => cancelDrag(drag, live, svg);
    window.addEventListener("blur", cancel);
    return () => {
      cancel();
      window.removeEventListener("blur", cancel);
    };
  }, []);
  return (
    <>
      <h3>One curve. Four editable points.</h3>
      <p id={instructions}>
        Drag a handle, use arrow keys (Shift for ten units), or edit its numeric
        coordinates. Coordinates stay within 0–100. A cancelled drag restores
        the prior curve.
      </p>
      <svg
        ref={svg}
        data-curve-editor
        className={lab.curveSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="group"
        aria-label="Editable Bezier curve"
        aria-describedby={instructions}
        style={
          {
            "--curve-path": `path("${curvePath(curve)}")`,
          } as React.CSSProperties
        }
      >
        <polyline
          data-curve-guides
          points={curve.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke="#668da0"
          strokeWidth=".35"
          strokeDasharray="1 2"
        />
        <path
          data-curve-path
          d={curvePath(curve)}
          fill="none"
          stroke="#bdeeff"
          strokeWidth=".7"
        />
        <circle
          className={lab.curveDot}
          r="1.4"
          fill="#99e0c0"
          aria-hidden="true"
        />
        {curve.map((point, rawIndex) => {
          const index = rawIndex as PointIndex;
          return (
            <g
              key={index}
              data-curve-handle
              role="button"
              tabIndex={0}
              aria-label={`Curve point ${index + 1}`}
              transform={`translate(${point.x} ${point.y})`}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 10 : 1;
                const dx =
                  event.key === "ArrowRight"
                    ? step
                    : event.key === "ArrowLeft"
                      ? -step
                      : 0;
                const dy =
                  event.key === "ArrowDown"
                    ? step
                    : event.key === "ArrowUp"
                      ? -step
                      : 0;
                if (!dx && !dy) return;
                event.preventDefault();
                cancelDrag(drag, live, svg);
                commit(
                  moveCurvePoint(live.current, index, {
                    x: live.current[index].x + dx,
                    y: live.current[index].y + dy,
                  }),
                );
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                cancelDrag(drag, live, svg);
                if (!svg.current) return;
                drag.current = {
                  index,
                  pointerId: event.pointerId,
                  start: live.current,
                  bounds: svg.current.getBoundingClientRect(),
                  target: event.currentTarget,
                };
                event.currentTarget.focus();
                try {
                  event.currentTarget.setPointerCapture(event.pointerId);
                } catch {
                  /* Synthetic/cancelled pointers have no capture target. */
                }
              }}
              onPointerMove={(event) => {
                const current = drag.current;
                if (!current || current.pointerId !== event.pointerId) return;
                const next = moveCurvePoint(live.current, current.index, {
                  x: Math.round(
                    ((event.clientX - current.bounds.left) /
                      current.bounds.width) *
                      100,
                  ),
                  y: Math.round(
                    ((event.clientY - current.bounds.top) /
                      current.bounds.height) *
                      100,
                  ),
                });
                live.current = next;
                drawCurve(svg.current, next);
              }}
              onPointerUp={(event) => {
                const current = drag.current;
                if (!current || current.pointerId !== event.pointerId) return;
                drag.current = null;
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
                commit(live.current);
              }}
              onPointerCancel={() => cancelDrag(drag, live, svg)}
              onLostPointerCapture={() => cancelDrag(drag, live, svg)}
              onBlur={() => cancelDrag(drag, live, svg)}
            >
              <circle r="7.5" fill="transparent" />
              <circle
                r="2"
                fill={index === 0 || index === 3 ? "#99e0c0" : "#bdeeff"}
                stroke="#0b1922"
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
      <div className={lab.curveInputs}>
        {curve.map((point, rawIndex) => {
          const index = rawIndex as PointIndex;
          return (
            <fieldset key={index}>
              <legend>Point {index + 1}</legend>
              {(["x", "y"] as const).map((axis) => (
                <label key={axis}>
                  {axis.toUpperCase()}
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    aria-label={`Point ${index + 1} ${axis.toUpperCase()}`}
                    value={point[axis]}
                    onChange={(event) => {
                      cancelDrag(drag, live, svg);
                      commit(
                        moveCurvePoint(live.current, index, {
                          ...live.current[index],
                          [axis]: event.target.valueAsNumber,
                        }),
                      );
                    }}
                  />
                </label>
              ))}
            </fieldset>
          );
        })}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => {
            cancelDrag(drag, live, svg);
            commit(initialCurve);
          }}
        >
          Reset curve
        </button>
        <span className={styles.mono}>Local geometry · no save or export</span>
      </div>
    </>
  );
}
