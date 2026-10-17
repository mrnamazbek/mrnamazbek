"use client";
import { useId, useState } from "react";
import { LocalDialog } from "../../../components/local-dialog";
import styles from "../../../components/studio.module.css";
import bench from "../../../components/workbench.module.css";
import lab from "../interface-lab.module.css";

const questions = [
  {
    title: "Does this connect to a service?",
    answer:
      "No request is sent. Every result in this sample is selected from a local fixture.",
  },
  {
    title: "What survives a failure?",
    answer:
      "The intended action and its input remain visible until an explicit reset.",
  },
  {
    title: "Can I use the keyboard?",
    answer:
      "The controls, disclosures and dialogs have native keyboard behavior and a visible focus path.",
  },
];
const roles = [
  {
    title: "Maintainer",
    description: "Owns the boundary and its recovery contract.",
  },
  {
    title: "Reviewer",
    description: "Questions assumptions and checks the evidence for a change.",
  },
  {
    title: "Contributor",
    description: "Proposes a bounded change with a reproducible example.",
  },
];
const principles = [
  {
    title: "Keep failure recoverable",
    description: "Preserve the original input and offer a bounded next step.",
  },
  {
    title: "Give state a name",
    description: "Describe the current state before introducing a transition.",
  },
  {
    title: "Keep ownership visible",
    description:
      "Explain who owns each decision and what that responsibility includes.",
  },
];
export function StateSample(): React.JSX.Element {
  const [state, setState] = useState<
    "ready" | "loading" | "empty" | "error" | "recovered"
  >("ready");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [role, setRole] = useState<number | null>(null);
  const base = useId();
  const toggle = (key: string) =>
    setExpanded((prior) => {
      const next = new Set(prior);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  return (
    <>
      <p>Choose a state to inspect its feedback, then recover the sample.</p>
      <div className={styles.controls}>
        {(["ready", "loading", "empty", "error"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={state === item}
            onClick={() => setState(item)}
          >
            {item[0].toUpperCase() + item.slice(1)} fixture
          </button>
        ))}
      </div>
      <div
        className={`${styles.panel} ${state === "error" ? styles.error : ""}`}
      >
        <p role="status">
          {state === "loading"
            ? "Loading fixture · waiting for a manual state choice."
            : state === "error"
              ? "Error fixture · the local sample is interrupted."
              : state === "empty"
                ? "Empty fixture · no example records to show."
                : state === "recovered"
                  ? "Recovered locally · the sample is ready again."
                  : "Ready fixture · a bounded example is available."}
        </p>
        {state === "loading" ? (
          <div className={lab.skeleton} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : state === "error" ? (
          <button type="button" onClick={() => setState("recovered")}>
            Retry sample
          </button>
        ) : (
          <p>
            {state === "empty"
              ? "Change the selected fixture to continue."
              : "The current state is visible, reversible and local."}
          </p>
        )}
      </div>
      <div className={bench.split}>
        <section className={styles.panel}>
          <h3>Questions with a visible answer</h3>
          {questions.map((item, index) => (
            <div className={lab.disclosure} key={item.title}>
              <button
                type="button"
                aria-expanded={expanded.has(`q${index}`)}
                aria-controls={`${base}-q${index}`}
                onClick={() => toggle(`q${index}`)}
              >
                {item.title}
                <span aria-hidden="true">
                  {expanded.has(`q${index}`) ? "−" : "+"}
                </span>
              </button>
              <div id={`${base}-q${index}`} hidden={!expanded.has(`q${index}`)}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </section>
        <section className={styles.panel}>
          <h3>Anonymous responsibility tree</h3>
          <p>Anonymous roles with a small responsibility hierarchy.</p>
          <ol className={lab.roleTree} aria-label="Anonymous role hierarchy">
            {roles.map((item, index) => (
              <li key={item.title} style={{ marginLeft: `${index * 16}px` }}>
                <button
                  type="button"
                  aria-label={`Inspect ${item.title} role`}
                  onClick={() => setRole(index)}
                >
                  {item.title} ↗
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <section className={styles.panel}>
        <h3>Principles that explain the hierarchy</h3>
        {principles.map((item, index) => (
          <div className={lab.disclosure} key={item.title}>
            <button
              type="button"
              aria-expanded={expanded.has(`p${index}`)}
              aria-controls={`${base}-p${index}`}
              onClick={() => toggle(`p${index}`)}
            >
              {item.title}
              <span aria-hidden="true">↳</span>
            </button>
            <div id={`${base}-p${index}`} hidden={!expanded.has(`p${index}`)}>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </section>
      <div className={bench.split}>
        <div className={styles.panel}>
          <span className={styles.badge}>Example status / prototype</span>
          <h3>Provenance is part of the interface.</h3>
          <p>A prototype state with an explicit source and next action.</p>
        </div>
        <div className={styles.panel}>
          <span className={styles.eyebrow}>INERT PRICE SAMPLE</span>
          <h3>24 illustrative units</h3>
          <p>
            Non-purchasable example. There is no checkout, subscription or
            purchase action.
          </p>
        </div>
      </div>
      {role !== null ? (
        <LocalDialog
          title={`${roles[role].title} responsibility`}
          onClose={() => setRole(null)}
        >
          <p className={styles.eyebrow}>Anonymous role / local example</p>
          <p>{roles[role].description}</p>
          <p>Inspect how this responsibility supports the surrounding roles.</p>
        </LocalDialog>
      ) : null}
    </>
  );
}
