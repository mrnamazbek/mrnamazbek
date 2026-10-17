"use client";
import type { ModuleViewProps } from "../modules/types";
import styles from "./studio.module.css";
export function ModuleLoader({
  definition,
}: ModuleViewProps): React.JSX.Element {
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} enhancement`}
    >
      <span className={styles.eyebrow}>SERVER FIXTURE READY</span>
      <h2>Read the example. Inspect its boundary.</h2>
      <p>
        The interactive enhancement is being built. The initial fixture above is
        available without JavaScript.
      </p>
      <button type="button" disabled>
        Preparing workbench
      </button>
    </section>
  );
}
