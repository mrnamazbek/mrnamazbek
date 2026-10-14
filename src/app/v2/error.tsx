"use client";

import styles from "./portfolio.module.css";

export default function LiquidError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className={styles.pageIntro}><p className={styles.eyebrow}>A BRIEF INTERRUPTION</p><h1>Let’s try<br />that again.</h1><p>This page couldn’t load. Try again, or <a href="mailto:namazbekzhan@gmail.com">email me directly</a>.</p><button type="button" className={styles.primary} onClick={reset}>Try again</button></section>;
}
