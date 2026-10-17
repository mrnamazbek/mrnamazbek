import Link from "next/link";
import type { ModuleDefinition } from "../modules/types";
import styles from "./studio.module.css";
export function ModuleFrame({
  definition,
  children,
}: {
  definition: ModuleDefinition;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <article className={styles.modulePage}>
      <Link
        href="/studio#studio-capabilities"
        aria-label="Back to the lab"
        className={styles.eyebrow}
      >
        ← Back to the lab
      </Link>
      <h1>{definition.title}</h1>
      <p className={styles.moduleIntro}>{definition.summary}</p>
      <span className={styles.badge}>
        {definition.boundary} · memory only · resettable
      </span>
      <dl className={styles.sample} aria-label="Read-only initial fixture">
        {definition.initialSample.map((sample) => (
          <div key={sample.label}>
            <dt>{sample.label}</dt>
            <dd>{sample.value}</dd>
          </div>
        ))}
      </dl>
      {children}
      <p className={styles.caption}>
        A small, intentionally bounded experiment. All sample data is fictional.
        No business service is connected.
      </p>
    </article>
  );
}
