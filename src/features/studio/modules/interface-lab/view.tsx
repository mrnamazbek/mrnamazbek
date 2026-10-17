"use client";
import { useState } from "react";
import type { ModuleViewProps } from "../types";
import type { SampleGroup } from "./domain";
import { NavigationSample } from "./samples/navigation-sample";
import { StateSample } from "./samples/state-sample";
import { MotionSample } from "./samples/motion-sample";
import styles from "../../components/studio.module.css";
import bench from "../../components/workbench.module.css";

const groups: readonly { id: SampleGroup; label: string }[] = [
  { id: "navigation", label: "Navigation & appearance" },
  { id: "states", label: "States & disclosures" },
  { id: "motion", label: "Motion & media" },
];
export default function InterfaceLabView({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const [group, setGroup] = useState<SampleGroup>("navigation");
  const [generation, setGeneration] = useState(0);
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} workbench`}
    >
      <div className={bench.heading}>
        <div>
          <span className={styles.eyebrow}>04 / LOCAL SIMULATION</span>
          <h2>One interaction. A clear purpose.</h2>
        </div>
        <span className={styles.badge}>Owned samples · memory only</span>
      </div>
      <div className={bench.tabs} aria-label="Interface sample groups">
        {groups.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={group === item.id}
            onClick={() => setGroup(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div key={`${group}-${generation}`}>
        {group === "navigation" ? (
          <NavigationSample />
        ) : group === "states" ? (
          <StateSample />
        ) : (
          <MotionSample />
        )}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => {
            setGroup("navigation");
            setGeneration((value) => value + 1);
          }}
        >
          Reset demo
        </button>
      </div>
    </section>
  );
}
