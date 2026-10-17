"use client";
import { useId, useState, type CSSProperties } from "react";
import type { ModuleViewProps } from "../types";
import {
  advancePacket,
  resetPacket,
  type ServiceIllustration,
  type StackCategory,
  type StageId,
} from "./domain";
import {
  stages,
  architectureOptions,
  serviceIllustrations,
  stackEntries,
} from "./fixtures";
import styles from "../../components/studio.module.css";
import bench from "../../components/workbench.module.css";
import art from "./architecture.module.css";

const criteria = {
  latency: "Freshness / latency",
  cost: "Cost efficiency",
  complexity: "Operational simplicity",
  recovery: "Recovery clarity",
  auditability: "Auditability",
};
const sketches: Record<ServiceIllustration, React.ReactNode> = {
  support: (
    <>
      <path d="M55 50h100v65H95l-20 18v-18H55Z M245 80h100v65h-40l-20 18v-18h-40Z" />
      <path d="M155 82h45v30h45" strokeDasharray="4 6" />
      <circle cx="200" cy="55" r="18" />
      <path d="m192 55 6 6 10-12" />
    </>
  ),
  approval: (
    <>
      <path d="M95 35h95l20 20v125H95Z M190 35v25h20 M115 85h65 M115 105h45 M115 125h55" />
      <circle cx="280" cy="115" r="45" />
      <path d="m258 115 16 16 30-35 M210 115h25" />
    </>
  ),
  data: (
    <>
      <ellipse cx="70" cy="70" rx="30" ry="12" />
      <path d="M40 70v70c0 16 60 16 60 0V70 M100 105h55 M245 105h55" />
      <rect x="155" y="65" width="90" height="80" rx="12" />
      <path d="m177 105 17 17 30-35" />
      <rect x="300" y="70" width="65" height="70" rx="6" />
    </>
  ),
  cloud: (
    <>
      <path d="M130 95c-45 0-45-60 0-60 15-40 80-30 83 10 50-10 70 50 25 50Z M170 95v35 M170 130H80v30 M170 130h100v30" />
      <rect x="45" y="160" width="70" height="30" rx="5" />
      <rect x="235" y="160" width="70" height="30" rx="5" />
      <circle cx="170" cy="160" r="12" />
    </>
  ),
  controls: (
    <>
      <path d="M70 55h240 M70 105h240 M70 155h240" />
      <circle cx="125" cy="55" r="14" />
      <circle cx="250" cy="105" r="14" />
      <circle cx="175" cy="155" r="14" />
      <path d="m335 70 12 12 22-26 M335 140l12 12 22-26" />
    </>
  ),
};

export default function ArchitectureView({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const [selected, setSelected] = useState<StageId>("source");
  const [packet, setPacket] = useState(resetPacket);
  const [illustration, setIllustration] =
    useState<ServiceIllustration>("support");
  const [category, setCategory] = useState<StackCategory>("project-tooling");
  const base = useId();
  const stage = stages.find((item) => item.id === selected)!;
  const service = serviceIllustrations.find(
    (item) => item.id === illustration,
  )!;
  const reset = () => {
    setSelected("source");
    setPacket(resetPacket());
    setIllustration("support");
    setCategory("project-tooling");
  };
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} workbench`}
    >
      <div className={bench.heading}>
        <div>
          <span className={styles.eyebrow}>03 / SEEDED DEMO</span>
          <h2>Follow the boundary, not the buzzword.</h2>
        </div>
        <span className={styles.badge}>Illustrative architecture</span>
      </div>
      <p>
        No jobs are running. Select a boundary, then move one fictional packet
        through the fixed flow.
      </p>
      <ol className={art.flow} aria-label="Ordered pipeline alternative">
        {stages.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              aria-label={`Select ${item.label} stage`}
              aria-pressed={selected === item.id}
              data-packet={packet.stage === item.id}
              onClick={() => setSelected(item.id)}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {item.label}
              <small>
                {packet.stage === item.id
                  ? packet.complete
                    ? "Complete"
                    : "Sample packet"
                  : "Boundary"}
              </small>
            </button>
          </li>
        ))}
      </ol>
      <div className={bench.split}>
        <div className={`${styles.panel} ${art.detail}`}>
          <span className={styles.eyebrow}>SELECTED / {stage.id}</span>
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
          <p className={styles.mono}>{stage.contract}</p>
          <div className={styles.controls}>
            <button
              type="button"
              disabled={selected === "source"}
              onClick={() =>
                setSelected(
                  stages[stages.findIndex((item) => item.id === selected) - 1]
                    .id,
                )
              }
            >
              Previous boundary
            </button>
            <button
              type="button"
              disabled={selected === "serve"}
              onClick={() =>
                setSelected(
                  stages[stages.findIndex((item) => item.id === selected) + 1]
                    .id,
                )
              }
            >
              Next boundary
            </button>
          </div>
        </div>
        <aside className={bench.inspector}>
          <span className={styles.eyebrow}>MANUAL PACKET STEPPER</span>
          <p role="status">
            {packet.complete
              ? "Sample complete at serve. No job was executed."
              : `Sample packet at ${packet.stage}. Awaiting your next step.`}
          </p>
          <div className={styles.controls}>
            <button
              type="button"
              disabled={packet.complete}
              onClick={() => {
                const next = advancePacket(packet);
                setPacket(next);
                setSelected(next.stage);
              }}
            >
              Advance packet
            </button>
            <button
              type="button"
              onClick={() => {
                setPacket(resetPacket());
                setSelected("source");
              }}
            >
              Cancel packet
            </button>
          </div>
        </aside>
      </div>
      <div className={styles.panel}>
        <h3>Five ways to inspect a handoff</h3>
        <div
          className={bench.tabs}
          role="tablist"
          aria-label="Service illustrations"
        >
          {serviceIllustrations.map((item, index) => (
            <button
              key={item.id}
              id={`${base}-${item.id}`}
              type="button"
              role="tab"
              aria-selected={illustration === item.id}
              aria-controls={`${base}-panel`}
              tabIndex={illustration === item.id ? 0 : -1}
              onClick={() => setIllustration(item.id)}
              onKeyDown={(event) => {
                const delta =
                  event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0;
                if (!delta && event.key !== "Home" && event.key !== "End")
                  return;
                event.preventDefault();
                const target =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 4
                      : (index + delta + 5) % 5;
                setIllustration(serviceIllustrations[target].id);
                event.currentTarget.parentElement
                  ?.querySelectorAll<HTMLButtonElement>("button")
                  [target]?.focus();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${base}-panel`}
          aria-labelledby={`${base}-${illustration}`}
          className={bench.split}
        >
          <div className={art.illustration}>
            <svg
              viewBox="0 0 400 220"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              {sketches[illustration]}
            </svg>
          </div>
          <div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p className={styles.caption}>{service.boundary}</p>
          </div>
        </div>
      </div>
      <div className={styles.panel}>
        <h3>Make the tradeoff explicit</h3>
        <div className={bench.scrollTable}>
          <table className={styles.table}>
            <caption>
              Hypothetical tradeoffs · scores 0–5, higher means a stronger
              illustrative fit for the stated criterion. These are not
              benchmarks.
            </caption>
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                {architectureOptions.map((option) => (
                  <th scope="col" key={option.id}>
                    {option.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(criteria).map(([key, label]) => (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  {architectureOptions.map((option) => (
                    <td key={option.id}>
                      <span
                        className={art.score}
                        style={
                          {
                            "--score":
                              option.scores[key as keyof typeof criteria],
                          } as CSSProperties
                        }
                      >
                        {option.scores[key as keyof typeof criteria]}
                        <span aria-hidden="true" />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.panel}>
        <div className={bench.heading}>
          <div>
            <span className={styles.eyebrow}>
              STACK / RESPONSIBILITY CATALOG
            </span>
            <h3>Choose the role before the tool.</h3>
          </div>
          <label>
            Stack category
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as StackCategory)
              }
            >
              <option value="project-tooling">Project tooling</option>
              <option value="platform-systems">Platform systems</option>
              <option value="development-tools">Development tools</option>
            </select>
          </label>
        </div>
        <div className={art.stack}>
          {stackEntries
            .filter((entry) => entry.category === category)
            .map((entry) => (
              <article key={entry.id}>
                <h4>{entry.name}</h4>
                <p>{entry.explanation}</p>
              </article>
            ))}
        </div>
        <p className={styles.caption}>
          Illustrative roles and tradeoffs. Names do not imply connected or
          running integrations.
        </p>
      </div>
      <button type="button" onClick={reset}>
        Reset demo
      </button>
    </section>
  );
}
