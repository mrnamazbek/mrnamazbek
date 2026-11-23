import Link from "next/link";
import { ArrowUpRight, Braces, Database, Sparkles } from "lucide-react";
import { engineeringWork } from "./work";
import styles from "./engineering.module.css";

const icons = [Database, Braces, Sparkles];
const process = [
  ["Frame", "Agree on the outcome, constraints, and what to measure."],
  ["Prototype", "Build the smallest end-to-end slice that tests the hard part."],
  ["Harden", "Test the edges, make failures visible, and plan recovery."],
  ["Hand over", "Document how to run, verify, and change the system."],
] as const;

export function EngineeringPractice() {
  return (
    <section className={styles.section} id="engineering-practice" aria-labelledby="practice-heading">
      <div className={styles.heading}>
        <h2 id="practice-heading">Where I can help.</h2>
        <a href="#start-a-project" className="text-link">Talk through a project <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
      <div className={styles.practiceGrid}>
        {engineeringWork.map((work, index) => {
          const Icon = icons[index];
          return (
            <article key={work.slug} className={styles.practiceCard} data-theme={work.theme}>
              <Icon size={27} strokeWidth={1.5} aria-hidden="true" />
              <h3>{work.discipline}</h3>
              <ul>{work.practice.map((item) => <li key={item}>{item}</li>)}</ul>
              <Link className="text-link" href={`/projects/${work.slug}`}>See an example <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </article>
          );
        })}
      </div>
      <div className={styles.process}>
        <h3>How I work</h3>
        <ol>{process.map(([name, detail]) => (
          <li key={name}><strong>{name}</strong><p>{detail}</p></li>
        ))}</ol>
      </div>
    </section>
  );
}
