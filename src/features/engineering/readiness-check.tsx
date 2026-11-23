"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { engineeringWork } from "./work";
import styles from "./engineering.module.css";

const checks = {
  data: [
    ["Schema and ownership are documented", "Write a source contract with required fields, keys, and an owner."],
    ["Freshness and data quality are monitored", "Add freshness, uniqueness, and null checks to the first critical table."],
    ["A backfill can be repeated safely", "Replay a small date range and compare keys and counts with the previous load."],
  ],
  software: [
    ["The main user flow has a regression test", "Test one full journey through the UI, API, and data layer."],
    ["Failures have a visible recovery path", "Trigger an unavailable dependency and check what the user can do next."],
    ["A release has a rollback plan", "Document how to revert the release and verify recovery against a preview."],
  ],
  ai: [
    ["Representative inputs and expected outputs are labeled", "Collect a small evaluation set that includes ambiguous and failing examples."],
    ["Invalid model output is caught", "Validate the output schema and test the fallback with malformed examples."],
    ["High-impact actions require review", "Route uncertain or consequential outputs through a human approval step."],
  ],
} as const;

type Track = keyof typeof checks;

export function ReadinessCheck() {
  const id = useId();
  const [track, setTrack] = useState<Track>("data");
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const items = checks[track];
  const relatedWork = engineeringWork.find((work) => work.theme === track);
  const missing = items.filter(([label]) => !confirmed.includes(label));

  return (
    <section className={styles.section} id="readiness-check" aria-labelledby={`${id}-title`}>
      <div className={styles.checkLayout}>
        <div className={styles.checkIntro}>
          <h2 id={`${id}-title`}>What’s ready to ship?</h2>
          <p>Pick a system and mark the practices you already have in place. Get a short list of what to check next.</p>
          <p className={styles.hint}>Self-assessment. Runs locally in your browser.</p>
        </div>
        <div className={styles.checkForm}>
          <label htmlFor={`${id}-track`}>System type</label>
          <select id={`${id}-track`} value={track} onChange={(event) => {
            const next = engineeringWork.find((work) => work.theme === event.currentTarget.value);
            if (!next) return;
            setTrack(next.theme);
            setConfirmed([]);
            setSubmitted(false);
          }}>
            {engineeringWork.map((work) => <option value={work.theme} key={work.slug}>{work.discipline}</option>)}
          </select>
          <fieldset>
            <legend>What can you verify today?</legend>
            {items.map(([label]) => (
              <label className={styles.checkbox} key={label}>
                <input type="checkbox" checked={confirmed.includes(label)} onChange={(event) => {
                  setConfirmed(event.currentTarget.checked ? [...confirmed, label] : confirmed.filter((item) => item !== label));
                  setSubmitted(false);
                }} />
                {label}
              </label>
            ))}
          </fieldset>
          <button className={styles.control} type="button" onClick={() => setSubmitted(true)}>Review readiness</button>
          <div className={styles.result} aria-live="polite">
            {submitted && (
              <>
                <h3>{items.length - missing.length} of {items.length} practices confirmed</h3>
                {missing.length > 0 ? <ol>{missing.map(([label, next]) => <li key={label}>{next}</li>)}</ol> : <p>Recheck these practices on a real change before your next release.</p>}
                {relatedWork && <Link href={`/projects/${relatedWork.slug}`} className="text-link">Case study: {relatedWork.title} <ArrowUpRight size={15} aria-hidden="true" /></Link>}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
