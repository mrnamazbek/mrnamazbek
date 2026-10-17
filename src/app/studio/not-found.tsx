import Link from "next/link";
import styles from "@/features/studio/components/studio.module.css";
export default function StudioNotFound() {
  return (
    <section className={styles.modulePage}>
      <p className={styles.eyebrow}>404 / OUTSIDE THE EXPERIMENT</p>
      <h1>This experiment does not exist.</h1>
      <p className={styles.moduleIntro}>
        There are six workbenches to explore. Return to the matrix to choose
        one.
      </p>
      <Link href="/studio" className={styles.action}>
        Back to the lab
      </Link>
    </section>
  );
}
