"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { modules } from "../modules/registry";
import { TiltCard } from "../motion/tilt-card";
import type { ModuleSlug } from "../modules/types";
import { ModuleLoader } from "./module-loader";
import styles from "./studio.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function CapabilityMatrix(): React.JSX.Element {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [selected, setSelected] = useState<ModuleSlug | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const preview = modules.find((m) => m.slug === selected);
  useEffect(() => {
    if (!selected) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [selected]);
  const close = () => {
    const previous = selected;
    setSelected(null);
    if (previous) document.getElementById(`preview-${previous}`)?.focus();
  };
  return (
    <>
      <div className={styles.grid}>
        {modules.map((module, index) => (
          <TiltCard key={module.slug}>
            <article className={styles.card}>
              <div className={styles.cardTop}>
                <span>0{index + 1} / Workbench</span>
                <span className={styles.badge}>{module.boundary}</span>
              </div>
              <div className={styles.specimen} aria-hidden="true">
                {index === 0 ? (
                  <>
                    <span style={{ border: "1px solid #5b8a9d", padding: 12 }}>
                      240 LAB
                    </span>
                    <span>→</span>
                    <span style={{ color: "#99e0c0" }}>ALLOW ✓</span>
                  </>
                ) : null}
                {index === 1 ? (
                  <svg viewBox="0 0 260 90">
                    {[0, 1, 2].map((i) => (
                      <g key={i} transform={`translate(8 ${i * 28 + 4})`}>
                        <rect width="8" height="8" rx="2" fill="#8cd7e5" />
                        <path d="M24 4H220" stroke="#6192a7" />
                        <path d="M24 12H160" stroke="#304a5a" />
                      </g>
                    ))}
                  </svg>
                ) : null}
                {index === 2 ? (
                  <svg viewBox="0 0 260 90">
                    <path d="M30 45H230" stroke="#567f93" />
                    {[30, 95, 165, 230].map((x, i) => (
                      <g key={x}>
                        <rect
                          x={x - 18}
                          y="27"
                          width="36"
                          height="36"
                          rx="7"
                          fill="#162c38"
                          stroke={i === 2 ? "#bdeeff" : "#486e81"}
                        />
                        <circle cx={x} cy="45" r="4" fill="#99e0c0" />
                      </g>
                    ))}
                  </svg>
                ) : null}
                {index === 3 ? (
                  <>
                    <span
                      style={{
                        borderRadius: 20,
                        background: "#bdeeff",
                        width: 44,
                        height: 24,
                      }}
                    />
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: "1px solid #718e9e",
                      }}
                    >
                      ↗
                    </span>
                    <span style={{ fontSize: 30 }}>Aa</span>
                    <span
                      style={{
                        height: 28,
                        width: 28,
                        background: "#99e0c0",
                        borderRadius: "50%",
                      }}
                    />
                  </>
                ) : null}
                {index === 4 ? (
                  <>
                    <span style={{ fontSize: 28 }}>Aa</span>
                    <span style={{ color: "#739daf" }}> / </span>
                    <span style={{ fontSize: 28 }}>Яя</span>
                    <span style={{ color: "#739daf" }}> / </span>
                    <span style={{ fontSize: 28 }}>Әә</span>
                  </>
                ) : null}
                {index === 5 ? (
                  <svg viewBox="0 0 260 90">
                    <rect
                      x="15"
                      y="10"
                      width="230"
                      height="24"
                      rx="4"
                      fill="#132a36"
                      stroke="#527e91"
                    />
                    <path d="M28 22H126" stroke="#bdeeff" />
                    <rect
                      x="15"
                      y="44"
                      width="160"
                      height="24"
                      rx="4"
                      fill="#132a36"
                      stroke="#527e91"
                    />
                    <path d="M28 56H96" stroke="#bdeeff" />
                    <circle cx="220" cy="57" r="14" fill="#99e0c0" />
                    <path
                      d="m214 57 4 4 8-9"
                      stroke="#102128"
                      strokeWidth="2"
                    />
                  </svg>
                ) : null}
              </div>
              <h3>{module.title}</h3>
              <p>{module.summary}</p>
              <div className={styles.cardLinks}>
                <Link
                  href={`/studio/modules/${module.slug}`}
                  aria-label={`Open ${module.title}`}
                >
                  Open workbench <span aria-hidden="true">↗</span>
                </Link>
                <button
                  type="button"
                  disabled={!ready}
                  id={`preview-${module.slug}`}
                  aria-controls={
                    selected === module.slug
                      ? "studio-selected-preview"
                      : undefined
                  }
                  aria-expanded={selected === module.slug}
                  aria-label={`Preview ${module.title}`}
                  aria-pressed={selected === module.slug}
                  onClick={() =>
                    setSelected(selected === module.slug ? null : module.slug)
                  }
                >
                  Preview
                </button>
              </div>
            </article>
          </TiltCard>
        ))}
      </div>
      {preview ? (
        <aside
          className={styles.preview}
          id="studio-selected-preview"
          data-studio-preview
          aria-label="Selected workbench preview"
        >
          <div>
            <span className={styles.eyebrow}>Live workbench preview</span>
            <h3 ref={heading} tabIndex={-1}>
              {preview.title}
            </h3>
          </div>
          <dl>
            {preview.initialSample.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={close}>
            Close preview
          </button>
          <div className={styles.livePreview}>
            <ModuleLoader definition={preview} />
          </div>
        </aside>
      ) : null}
    </>
  );
}
