"use client";
import { useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { normalizeSamplePreferences } from "../domain";
import { initialPreferences } from "../fixtures";
import { useInteractionPolicy } from "../../../motion/use-interaction-policy";
import styles from "../../../components/studio.module.css";
import lab from "../interface-lab.module.css";

const previews = [
  { title: "Systems", copy: "Systems preview: contracts and clear ownership." },
  {
    title: "Interfaces",
    copy: "Interfaces preview: feedback and stable focus.",
  },
  {
    title: "Workflows",
    copy: "Workflows preview: reversible steps and recovery.",
  },
];
export function NavigationSample(): React.JSX.Element {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [icon, setIcon] = useState<"outline" | "solid">("outline");
  const [preview, setPreview] = useState(0);
  const menu = useRef<HTMLDetailsElement>(null);
  const enhanced = useInteractionPolicy();
  const change = (patch: object) =>
    setPreferences(normalizeSamplePreferences({ ...preferences, ...patch }));
  return (
    <>
      <p>
        Appearance controls affect only the sample below. Preferences stay in
        memory.
      </p>
      <div className={lab.preferences}>
        <label>
          Sample theme
          <select
            value={preferences.theme}
            onChange={(event) => change({ theme: event.target.value })}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label>
          Text size
          <select
            value={preferences.scale}
            onChange={(event) => change({ scale: Number(event.target.value) })}
          >
            {[100, 125, 150, 200].map((scale) => (
              <option key={scale} value={scale}>
                {scale}%
              </option>
            ))}
          </select>
        </label>
        <label>
          Color scheme
          <select
            value={preferences.scheme}
            onChange={(event) => change({ scheme: event.target.value })}
          >
            <option value="default">Default</option>
            <option value="high-contrast">High contrast</option>
            <option value="warm">Warm</option>
          </select>
        </label>
        <label>
          Sample palette
          <select
            value={preferences.palette}
            onChange={(event) => change({ palette: event.target.value })}
          >
            <option value="ice">Ice</option>
            <option value="mint">Mint</option>
          </select>
        </label>
        <label>
          Text spacing
          <select
            value={preferences.spacing}
            onChange={(event) => change({ spacing: event.target.value })}
          >
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </label>
        <label>
          Sample font
          <select
            value={preferences.font}
            onChange={(event) => change({ font: event.target.value })}
          >
            <option value="sans">Sans serif</option>
            <option value="serif">Serif</option>
          </select>
        </label>
        <label>
          Icon style
          <select
            value={icon}
            onChange={(event) => setIcon(event.target.value as typeof icon)}
          >
            <option value="outline">Outline</option>
            <option value="solid">Solid</option>
          </select>
        </label>
        <label className={lab.check}>
          <input
            type="checkbox"
            checked={preferences.grayscale}
            onChange={(event) => change({ grayscale: event.target.checked })}
          />
          Grayscale sample
        </label>
      </div>
      <div
        className={lab.sample}
        data-interface-sample
        data-theme={preferences.theme}
        data-scale={preferences.scale}
        data-palette={preferences.palette}
        data-scheme={preferences.scheme}
        data-spacing={preferences.spacing}
        data-font={preferences.font}
        data-grayscale={preferences.grayscale}
        style={{ fontSize: `${preferences.scale}%` } as CSSProperties}
      >
        <div className={lab.sampleHeader}>
          <strong>Boundary / sample</strong>
          <details
            ref={menu}
            className={lab.sampleMenu}
            onKeyDown={(event) => {
              if (event.key === "Escape" && menu.current) {
                menu.current.open = false;
                menu.current.querySelector("summary")?.focus();
              }
            }}
          >
            <summary role="button" aria-label="Sample menu">
              Explore +
            </summary>
            <nav aria-label="Sample navigation">
              {previews.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => {
                    setPreview(index);
                    if (menu.current) {
                      menu.current.open = false;
                      menu.current.querySelector("summary")?.focus();
                    }
                  }}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </details>
        </div>
        <h3>Give every action a clear destination.</h3>
        <p>
          Focus or choose a card. A preview supports the decision without moving
          the control.
        </p>
        <div className={lab.previewGrid}>
          {previews.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Preview ${item.title}`}
              aria-pressed={preview === index}
              onFocus={() => setPreview(index)}
              onClick={() => setPreview(index)}
            >
              <svg
                viewBox="0 0 32 32"
                fill={icon === "solid" ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                {index === 0 ? (
                  <>
                    <rect x="4" y="5" width="24" height="8" rx="2" />
                    <rect x="4" y="19" width="24" height="8" rx="2" />
                  </>
                ) : index === 1 ? (
                  <>
                    <circle cx="11" cy="16" r="7" />
                    <path d="m21 7 8 9-8 9" />
                  </>
                ) : (
                  <>
                    <path d="M5 7h22v18H5Z M5 13h22 M12 13v12" />
                  </>
                )}
              </svg>
              {item.title}
            </button>
          ))}
        </div>
        <motion.div
          className={lab.previewCopy}
          key={preview}
          initial={enhanced ? { opacity: 0.5, y: 4 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: enhanced ? 0.18 : 0 }}
        >
          <p>{previews[preview].copy}</p>
        </motion.div>
      </div>
      <p className={styles.caption}>
        Compare outline and solid icons, then try a different palette.
      </p>
    </>
  );
}
