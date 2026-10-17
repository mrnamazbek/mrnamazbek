"use client";
import { useId, useState } from "react";
import type { DemoState, ModuleViewProps } from "../types";
import {
  simulateResponse,
  validateDemoForm,
  type AdapterMode,
  type DemoForm,
} from "./domain";
import { boundaryExamples, initialForm, invalidForm } from "./fixtures";
import styles from "../../components/studio.module.css";
import bench from "../../components/workbench.module.css";

export default function FormWorkbenchView({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const [draft, setDraft] = useState<DemoForm>(() => ({ ...initialForm }));
  const [phase, setPhase] = useState<DemoState>("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof DemoForm, string>>>(
    {},
  );
  const [mode, setMode] = useState<AdapterMode>("success");
  const [preset, setPreset] = useState("valid");
  const [boundary, setBoundary] = useState(200);
  const [response, setResponse] = useState<ReturnType<
    typeof simulateResponse
  > | null>(null);
  const base = useId();
  const example = boundaryExamples.find((item) => item.status === boundary)!;
  const edit = (field: keyof DemoForm, value: string) => {
    setDraft((prior) => ({ ...prior, [field]: value }));
    setPhase("idle");
    setErrors({});
    setResponse(null);
  };
  const start = () => {
    const next = validateDemoForm(draft);
    setErrors(next);
    setResponse(null);
    setPhase(Object.keys(next).length ? "invalid" : "pending");
  };
  const advance = () => {
    if (phase !== "pending") return;
    const next = simulateResponse(mode);
    setResponse(next);
    setPhase(
      next.status === 200
        ? "success"
        : next.status === 503
          ? "unavailable"
          : "error",
    );
  };
  const reset = () => {
    setDraft({ ...initialForm });
    setPhase("idle");
    setErrors({});
    setMode("success");
    setPreset("valid");
    setBoundary(200);
    setResponse(null);
  };
  const fieldProps = (field: keyof DemoForm) => ({
    id: `${base}-${field}`,
    value: draft[field],
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${base}-${field}-error` : undefined,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => edit(field, event.target.value),
  });
  const fieldError = (field: keyof DemoForm) =>
    errors[field] ? (
      <p id={`${base}-${field}-error`} className={bench.fieldError}>
        {errors[field]}
      </p>
    ) : null;
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} workbench`}
    >
      <div className={bench.heading}>
        <div>
          <span className={styles.eyebrow}>06 / LOCAL SIMULATION</span>
          <h2>Inspect the boundary before sending anything.</h2>
        </div>
        <span className={styles.badge}>No request is sent</span>
      </div>
      <p>
        Use fictional details to explore validation and recovery. Every response
        is a local fixture, advanced by you.
      </p>
      <div className={bench.split}>
        <div>
          <div className={styles.controls}>
            <label>
              Input fixture
              <select
                disabled={phase === "pending"}
                value={preset}
                onChange={(event) => {
                  setPreset(event.target.value);
                  setDraft({
                    ...(event.target.value === "invalid"
                      ? invalidForm
                      : initialForm),
                  });
                  setPhase("idle");
                  setErrors({});
                  setResponse(null);
                }}
              >
                <option value="valid">Valid sample</option>
                <option value="invalid">Invalid sample</option>
              </select>
            </label>
            <label>
              Adapter mode
              <select
                disabled={phase === "pending"}
                value={mode}
                onChange={(event) => setMode(event.target.value as AdapterMode)}
              >
                <option value="success">Simulated success · 200</option>
                <option value="unavailable">Unavailable · 503</option>
                <option value="failure">Failure · 502</option>
              </select>
            </label>
          </div>
          <fieldset className={bench.fieldset} disabled={phase === "pending"}>
            <legend>Fictional message</legend>
            <div className={styles.controls}>
              <div className={bench.field}>
                <label htmlFor={`${base}-name`}>Demo name</label>
                <input
                  type="text"
                  maxLength={101}
                  autoComplete="off"
                  {...fieldProps("name")}
                />
                {fieldError("name")}
              </div>
              <div className={bench.field}>
                <label htmlFor={`${base}-email`}>Demo email</label>
                <input
                  type="email"
                  maxLength={255}
                  autoComplete="off"
                  {...fieldProps("email")}
                />
                {fieldError("email")}
              </div>
            </div>
            <div className={bench.field}>
              <label htmlFor={`${base}-message`}>Demo message</label>
              <textarea rows={5} maxLength={5001} {...fieldProps("message")} />
              {fieldError("message")}
            </div>
            <p className={bench.subtle}>
              {draft.message.length.toLocaleString("en")} / 5,000 characters
            </p>
            <div className={bench.field}>
              <label htmlFor={`${base}-website`}>Website · leave empty</label>
              <input
                type="text"
                autoComplete="off"
                {...fieldProps("website")}
              />
              {fieldError("website")}
            </div>
          </fieldset>
          <div
            role="status"
            className={`${styles.status} ${phase === "error" || phase === "invalid" || phase === "unavailable" ? styles.error : ""}`}
          >
            {phase === "pending"
              ? "Pending simulation · advance the response or cancel."
              : phase === "invalid"
                ? "Validation stopped the simulation. Check the linked field errors."
                : response
                  ? response.message
                  : "Edit the sample, then validate it locally."}
          </div>
          <div className={styles.controls}>
            {phase === "pending" ? (
              <>
                <button type="button" onClick={advance}>
                  Advance response
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("idle");
                    setResponse(null);
                  }}
                >
                  Cancel simulation
                </button>
              </>
            ) : (
              <button type="button" onClick={start}>
                Start simulation
              </button>
            )}
            <button type="button" onClick={reset}>
              Reset demo
            </button>
          </div>
        </div>
        <aside className={bench.inspector}>
          <span className={styles.eyebrow}>BOUNDARY / REFERENCE</span>
          <h3>A response needs an explanation.</h3>
          <label>
            Boundary example
            <select
              value={boundary}
              onChange={(event) => setBoundary(Number(event.target.value))}
            >
              {boundaryExamples.map((item) => (
                <option key={item.status} value={item.status}>
                  {item.status} · {item.label}
                </option>
              ))}
            </select>
          </label>
          <div data-boundary-example className={styles.panel}>
            <span className={styles.eyebrow}>
              HTTP {example.status} / EXAMPLE
            </span>
            <h3>{example.label}</h3>
            <p>{example.explanation}</p>
          </div>
          {response ? (
            <div data-form-response className={bench.receipt}>
              <span>SIMULATED RESPONSE / {response.status}</span>
              <pre
                className={styles.mono}
                style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
              >
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          ) : (
            <div className={bench.empty}>
              <span>↳</span>
              <p>Validate, then advance a local response.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
