import type { ReactNode } from "react";
import styles from "./route-transition.module.css";

/** Original, contained SVG trace inspired by Page Transitions / 5.
 * https://drive.google.com/drive/folders/1JRRsWv2nJ_8L0QaY2esh-oG49JPvSw05
 * Next's template remount plays the entrance; links and history stay native. */
export function RouteTransition({ children }: { children: ReactNode }) {
  return (
    <div className={styles.route}>
      <svg className={styles.trace} viewBox="0 0 1280 8" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 4H1280" pathLength="1" />
      </svg>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
