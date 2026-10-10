import {
  BrainCircuit,
  ChevronDown,
  Code2,
  Database,
  Layers3,
  Network,
  Terminal,
  Workflow,
} from "lucide-react";
import type { SkillGroup } from "@/types/content";
import styles from "./capabilities-panel.module.css";

const categoryIcons = {
  "Machine Learning & AI": BrainCircuit,
  "Big Data": Network,
  "Cold Data": Layers3,
  Languages: Code2,
  Databases: Database,
  DevOps: Workflow,
  Environment: Terminal,
};

interface CapabilitiesPanelProps {
  groups: readonly SkillGroup[];
}

/** Native disclosures keep every tool accessible before client JavaScript loads. */
export function CapabilitiesPanel({ groups }: CapabilitiesPanelProps) {
  const technologyCount = new Set(
    groups.flatMap((group) => group.technologies),
  ).size;

  return (
    <div className={styles.capabilities}>
      <div className={styles.topline}>
        <p>A toolkit that connects the whole system.</p>
        <span className={styles.inventory}>
          {groups.length} toolsets · {technologyCount} technologies
        </span>
      </div>
      <div className={styles.grid}>
        {groups.map((group, index) => {
          const Icon =
            categoryIcons[group.category as keyof typeof categoryIcons] ??
            Layers3;

          return (
            <details className={styles.panel} key={group.id} open>
              <summary className={styles.summary}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <h3 className={styles.heading}>
                  <span className={styles.index} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")} / TOOLSET
                  </span>
                  <span>{group.category}</span>
                </h3>
                <ChevronDown
                  className={styles.chevron}
                  size={18}
                  aria-hidden="true"
                />
              </summary>
              <div className={styles.body}>
                <div className={styles.circuit} aria-hidden="true">
                  <span className={styles.track} />
                  {group.technologies.slice(0, 3).map((tool) => (
                    <span className={styles.node} key={tool}>
                      <span className={styles.nodeDot} />
                      {tool}
                    </span>
                  ))}
                </div>
                <ul
                  className={styles.tools}
                  aria-label={`${group.category} technologies`}
                >
                  {group.technologies.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
