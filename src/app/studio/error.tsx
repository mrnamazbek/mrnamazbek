"use client";
import Link from "next/link";
import styles from "@/features/studio/components/studio.module.css";
export default function StudioError({ reset }: { reset: () => void }) {
  return (
    <section className={styles.modulePage}>
      <p className={styles.eyebrow}>EXPERIMENT INTERRUPTED</p>
      <h1>This view could not load.</h1>
      <p>Try the view again, or return to the lab.</p>
      <div className={styles.actions}>
        <button type="button" onClick={reset}>
          Retry view
        </button>
        <Link href="/studio" className={styles.action}>
          Back to the lab
        </Link>
      </div>
    </section>
  );
}
