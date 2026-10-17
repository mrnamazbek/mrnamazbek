"use client";
import { useRef, useState } from "react";
import { galleryStudies, milestones, regions } from "../fixtures";
import { CurveSample } from "./curve-sample";
import { LocalDialog } from "../../../components/local-dialog";
import { useInteractionPolicy } from "../../../motion/use-interaction-policy";
import { usePointerBounds } from "../../../motion/use-pointer-bounds";
import styles from "../../../components/studio.module.css";
import bench from "../../../components/workbench.module.css";
import lab from "../interface-lab.module.css";

function Study({ id }: { id: string }) {
  return (
    <svg
      className={lab.study}
      viewBox="0 0 260 210"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {id === "layers" ? (
        <>
          {[0, 1, 2, 3].map((index) => (
            <path
              key={index}
              d={`M40 ${65 + index * 22} 130 ${25 + index * 22} 220 ${65 + index * 22} 130 ${110 + index * 22}Z`}
              fill="#153747"
              fillOpacity=".65"
            />
          ))}
        </>
      ) : id === "grid" ? (
        <>
          {Array.from({ length: 16 }, (_, index) => (
            <rect
              key={index}
              x={45 + (index % 4) * 44}
              y={25 + Math.floor(index / 4) * 44}
              width="32"
              height="32"
              rx={index === 6 ? 16 : 3}
              fill={index === 6 ? "#99e0c0" : "#193a4c"}
            />
          ))}
        </>
      ) : (
        <>
          <ellipse cx="130" cy="105" rx="90" ry="60" />
          <ellipse
            cx="130"
            cy="105"
            rx="90"
            ry="60"
            transform="rotate(60 130 105)"
          />
          <ellipse
            cx="130"
            cy="105"
            rx="90"
            ry="60"
            transform="rotate(-60 130 105)"
          />
          <circle cx="130" cy="105" r="10" fill="#99e0c0" />
        </>
      )}
    </svg>
  );
}
function PointerSample({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const { bounds, measure } = usePointerBounds(root);
  const center = () => {
    root.current?.style.setProperty("--field-x", "50%");
    root.current?.style.setProperty("--field-y", "50%");
  };
  return (
    <>
      <h3>A field that follows, without taking over.</h3>
      <p>
        Native cursor retained. Focus a position for an equivalent static
        preview.
      </p>
      <div
        ref={root}
        className={lab.pointerField}
        onPointerEnter={measure}
        onPointerMove={
          active
            ? (event) => {
                const current = bounds.current;
                if (!current) return;
                root.current?.style.setProperty(
                  "--field-x",
                  `${((event.pageX - current.left) / current.width) * 100}%`,
                );
                root.current?.style.setProperty(
                  "--field-y",
                  `${((event.pageY - current.top) / current.height) * 100}%`,
                );
              }
            : undefined
        }
        onPointerLeave={center}
      >
        {["Left", "Center", "Right"].map((item, index) => (
          <button
            type="button"
            key={item}
            onFocus={() => {
              root.current?.style.setProperty(
                "--field-x",
                `${20 + index * 30}%`,
              );
              root.current?.style.setProperty("--field-y", "45%");
            }}
            onBlur={center}
            onClick={() => {
              root.current?.style.setProperty(
                "--field-x",
                `${20 + index * 30}%`,
              );
            }}
          >
            Preview {item.toLowerCase()} field
          </button>
        ))}
      </div>
    </>
  );
}
export function MotionSample(): React.JSX.Element {
  const [sample, setSample] = useState("icons");
  const [paused, setPaused] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState<number | null>(null);
  const [milestone, setMilestone] = useState(0);
  const [region, setRegion] = useState(0);
  const [choice, setChoice] = useState(0);
  const enhanced = useInteractionPolicy();
  const staticMode = paused || !enhanced;
  return (
    <>
      <div className={styles.controls}>
        <label>
          Motion sample
          <select
            value={sample}
            onChange={(event) => {
              setSample(event.target.value);
              setSelectedStudy(null);
            }}
          >
            <option value="icons">Owned icon studies</option>
            <option value="cube">CSS cube</option>
            <option value="choice">Three choices</option>
            <option value="pointer">Pointer field</option>
            <option value="gallery">Abstract gallery</option>
            <option value="timeline">Fictional timeline</option>
            <option value="regions">Abstract regions</option>
            <option value="curve">Bezier curve editor</option>
          </select>
        </label>
        <button
          type="button"
          disabled={!enhanced}
          onClick={() => setPaused(!paused)}
        >
          {staticMode ? "Resume sample motion" : "Pause sample motion"}
        </button>
      </div>
      <p className={styles.caption}>
        {!enhanced
          ? "Your input or motion preference keeps this sample static. All controls remain available."
          : staticMode
            ? "Motion is paused. Resume only when useful."
            : "Motion is active in this sample only. Pause at any time."}
      </p>
      <div className={lab.catalog} data-motion-catalog data-paused={staticMode}>
        {sample === "icons" ? (
          <>
            <h3>Three owned icon studies</h3>
            <div
              className={lab.icons}
              aria-label="Boundary, decision and connection icons"
            >
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    aria-hidden="true"
                  >
                    {index === 0 ? (
                      <>
                        <rect x="6" y="6" width="28" height="28" rx="4" />
                        <path d="M6 16h28 M16 16v18" />
                      </>
                    ) : index === 1 ? (
                      <>
                        <path d="m20 4 16 16-16 16L4 20Z" />
                        <path d="m13 20 5 5 10-12" />
                      </>
                    ) : (
                      <>
                        <circle cx="10" cy="10" r="4" />
                        <circle cx="30" cy="30" r="4" />
                        <path d="M14 10h16v16 M10 14v16h16" />
                      </>
                    )}
                  </svg>
                </div>
              ))}
            </div>
            <p>
              Original vector shapes. No icon library request or inherited
              animation file.
            </p>
          </>
        ) : null}
        {sample === "cube" ? (
          <>
            <h3>One CSS object. No extra renderer.</h3>
            <div className={lab.cubeScene} aria-label="Owned six-face CSS cube">
              <div className={lab.cube}>
                {["INPUT", "CHECK", "MAP", "VIEW", "OWN", "RESET"].map(
                  (face) => (
                    <span key={face}>{face}</span>
                  ),
                )}
              </div>
            </div>
            <p>
              Six local surfaces demonstrate depth while every control remains
              ordinary DOM.
            </p>
          </>
        ) : null}
        {sample === "choice" ? (
          <>
            <h3>Choose a value to inspect.</h3>
            <div className={lab.choices}>
              {["Clarity", "Recovery", "Ownership"].map((item, index) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={choice === index}
                  onClick={() => setChoice(index)}
                >
                  <span aria-hidden="true" />
                  {item}
                </button>
              ))}
            </div>
            <p>
              {
                [
                  "Clarity makes the next action understandable.",
                  "Recovery makes a failed action reversible.",
                  "Ownership makes a boundary accountable.",
                ][choice]
              }
            </p>
            <p className={styles.caption}>
              A local three-choice composition. No people or assessment workflow
              is represented.
            </p>
          </>
        ) : null}
        {sample === "pointer" ? <PointerSample active={!staticMode} /> : null}
        {sample === "gallery" ? (
          <>
            <h3>Three studies, authored for the lab.</h3>
            <div className={lab.gallery}>
              {galleryStudies.map((item, index) => (
                <button
                  type="button"
                  aria-label={`Open ${item.title}`}
                  key={item.id}
                  onClick={() => setSelectedStudy(index)}
                >
                  <Study id={item.id} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
            <p className={styles.caption}>
              Owned procedural SVGs. No event media or people appear in these
              studies.
            </p>
          </>
        ) : null}
        {sample === "timeline" ? (
          <>
            <h3>A fictional experiment lifecycle</h3>
            <div className={lab.timeline}>
              {milestones.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  aria-label={`Select ${item.title} milestone`}
                  aria-pressed={milestone === index}
                  onClick={() => setMilestone(index)}
                >
                  <span>0{index + 1}</span>
                  {item.title}
                </button>
              ))}
            </div>
            <p>{milestones[milestone].description}</p>
            <p className={styles.caption}>
              A sample sequence, not personal or organizational history.
            </p>
          </>
        ) : null}
        {sample === "regions" ? (
          <>
            <h3>Abstract boundaries, local details</h3>
            <div className={lab.regionMap}>
              <svg
                viewBox="0 0 620 280"
                fill="#173344"
                stroke="#6bacc4"
                aria-hidden="true"
              >
                <path d="m55 100 100-55 110 30-20 145-120 12-80-70Z M265 75l90-40 95 40-10 130-90 35-105-20Z M450 75l100 25 45 70-55 65-100-30Z" />
              </svg>
              {regions.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  className={lab.pin}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  aria-label={`Inspect ${item.title} region`}
                  aria-pressed={region === index}
                  onClick={() => setRegion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <p>{regions[region].description}</p>
            <p className={styles.caption}>
              Invented outlines. No addresses, locations or geolocation are
              used.
            </p>
          </>
        ) : null}
        {sample === "curve" ? <CurveSample /> : null}
      </div>
      {selectedStudy !== null ? (
        <LocalDialog
          title={galleryStudies[selectedStudy].title}
          onClose={() => setSelectedStudy(null)}
        >
          <Study id={galleryStudies[selectedStudy].id} />
          <p>{galleryStudies[selectedStudy].description}</p>
          <p className={styles.caption}>
            Owned abstract study / local lightbox
          </p>
        </LocalDialog>
      ) : null}
      <p className={bench.subtle}>
        One selected sample mounts at a time. Static reading is always
        available.
      </p>
    </>
  );
}
