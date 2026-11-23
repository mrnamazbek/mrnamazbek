import type { EngineeringWork } from "./work";
import styles from "./engineering.module.css";

export function WorkVisual({ work }: { work: EngineeringWork }) {
  return (
    <div className={styles.visual} data-theme={work.theme} aria-hidden="true">
      <div className={styles.mesh} />
      <div className={styles.coordinate} />
      <div className={styles.specimen}>
        {work.theme === "data" ? (
          <div className={styles.bars}>
            {[3, 6, 4, 9, 7, 12, 10, 15].map((height, index) => (
              <i key={index} style={{ "--bar": height } as React.CSSProperties} />
            ))}
          </div>
        ) : work.theme === "software" ? (
          <div className={styles.layers}><i /><i /><i /><i /></div>
        ) : (
          <div className={styles.orbits}><i /><i /><i /><i /><b /></div>
        )}
      </div>
      <div className={styles.visualSteps}>
        {work.steps.map((step) => <span key={step}>{step}</span>)}
      </div>
    </div>
  );
}
