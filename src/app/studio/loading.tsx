import styles from "@/features/studio/components/studio.module.css";
export default function Loading() {
  return (
    <section className={styles.modulePage} aria-busy="true">
      <p className={styles.eyebrow}>OPENING THE EXPERIMENT</p>
      <h1>Making room for an idea.</h1>
      <p>The lab is loading. Your browser’s back button remains available.</p>
    </section>
  );
}
