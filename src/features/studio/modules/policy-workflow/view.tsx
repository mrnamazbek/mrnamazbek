"use client";

import { useState } from "react";
import type { ModuleViewProps } from "../types";
import {
  evaluatePolicy,
  nextPolicyStep,
  parsePolicyInput,
  type PolicyInput,
  type PolicyStep,
} from "./domain";
import { policyPresets } from "./fixtures";
import styles from "../../components/studio.module.css";
import bench from "../../components/workbench.module.css";

const steps: readonly PolicyStep[] = [
  "input",
  "validation",
  "policy",
  "receipt",
];
const reasonCopy = {
  recipient: "Only hub-a is eligible.",
  category: "Education and tools are eligible; travel is excluded.",
  limit: "The allocation exceeds the 1,000 credit limit.",
};

export default function PolicyWorkflowView({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const [draft, setDraft] = useState({
    credits: "240",
    recipient: "hub-a",
    category: "education",
  });
  const [step, setStep] = useState<PolicyStep>("input");
  const [request, setRequest] = useState<PolicyInput | null>(null);
  const [errors, setErrors] = useState<readonly string[]>([]);
  const result =
    request && (step === "policy" || step === "receipt")
      ? evaluatePolicy(request)
      : null;
  const cancel = () => {
    setStep("input");
    setRequest(null);
    setErrors([]);
  };
  const reset = () => {
    setDraft({ credits: "240", recipient: "hub-a", category: "education" });
    cancel();
  };
  const advance = () => {
    if (step === "input") {
      const parsed = parsePolicyInput({
        ...draft,
        credits: draft.credits.trim() ? Number(draft.credits) : NaN,
      });
      if (!parsed.ok) {
        setErrors(parsed.errors);
        return;
      }
      setRequest(parsed.value);
      setErrors([]);
    }
    setStep(nextPolicyStep(step));
  };
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} workbench`}
    >
      <div className={bench.heading}>
        <div>
          <span className={styles.eyebrow}>01 / LOCAL SIMULATION</span>
          <h2>A decision, made inspectable.</h2>
        </div>
        <span className={styles.badge}>No request is sent</span>
      </div>
      <ol className={bench.steps} aria-label="Policy phases">
        {steps.map((item, index) => (
          <li
            key={item}
            aria-current={step === item ? "step" : undefined}
            data-complete={steps.indexOf(step) > index}
          >
            <span>0{index + 1}</span>
            {item}
          </li>
        ))}
      </ol>
      <div className={bench.split}>
        <div>
          <div className={styles.controls} aria-label="Named presets">
            {policyPresets.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => {
                  setDraft({
                    ...preset.input,
                    credits: String(preset.input.credits),
                  });
                  cancel();
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <fieldset className={bench.fieldset} disabled={step !== "input"}>
            <legend>Allocation input</legend>
            <label>
              LAB credits
              <input
                type="number"
                min="1"
                step="1"
                value={draft.credits}
                onChange={(event) =>
                  setDraft({ ...draft, credits: event.target.value })
                }
                aria-invalid={errors.length > 0}
                aria-describedby={errors.length ? "policy-errors" : undefined}
              />
            </label>
            <div className={styles.controls}>
              <label>
                Recipient
                <select
                  value={draft.recipient}
                  onChange={(event) =>
                    setDraft({ ...draft, recipient: event.target.value })
                  }
                >
                  <option value="hub-a">hub-a · eligible</option>
                  <option value="hub-b">hub-b · excluded</option>
                </select>
              </label>
              <label>
                Category
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({ ...draft, category: event.target.value })
                  }
                >
                  <option value="education">Education</option>
                  <option value="tools">Tools</option>
                  <option value="travel">Travel</option>
                </select>
              </label>
            </div>
          </fieldset>
          {errors.length > 0 ? (
            <div
              id="policy-errors"
              role="alert"
              className={`${styles.status} ${styles.error}`}
            >
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
          {step !== "input" ? (
            <div
              role="status"
              className={`${styles.status} ${result && !result.allowed ? styles.error : ""}`}
            >
              {step === "validation"
                ? "Input validated. The policy has not run yet."
                : result?.allowed
                  ? "Allowed · every rule passed."
                  : "Denied · inspect the reasons below."}
            </div>
          ) : null}
          {result?.reasons.length ? (
            <ul className={bench.reasonList}>
              {result.reasons.map((reason) => (
                <li key={reason}>
                  <code>{reason}</code>
                  {reasonCopy[reason]}
                </li>
              ))}
            </ul>
          ) : null}
          <div className={styles.controls}>
            {step !== "receipt" ? (
              <button type="button" onClick={advance}>
                {step === "input"
                  ? "Validate input"
                  : step === "validation"
                    ? "Evaluate policy"
                    : "Create receipt"}
              </button>
            ) : null}
            {step !== "input" ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const previous = steps[steps.indexOf(step) - 1];
                    setStep(previous);
                  }}
                >
                  Back
                </button>
                <button type="button" onClick={cancel}>
                  Cancel run
                </button>
              </>
            ) : null}
            <button type="button" onClick={reset}>
              Reset demo
            </button>
          </div>
        </div>
        <aside className={bench.inspector} aria-label="Policy specification">
          <span className={styles.eyebrow}>RULESET / V1</span>
          <h3>Small rules. Visible consequences.</h3>
          <dl className={bench.facts}>
            <div>
              <dt>Recipient</dt>
              <dd>hub-a</dd>
            </div>
            <div>
              <dt>Categories</dt>
              <dd>Education · Tools</dd>
            </div>
            <div>
              <dt>Limit</dt>
              <dd>1,000 LAB credits</dd>
            </div>
          </dl>
          {step === "receipt" && result ? (
            <div className={bench.receipt} data-policy-receipt>
              <span>REPRODUCIBLE IDENTIFIER</span>
              <code>{result.receiptId}</code>
              <p>
                Same canonical input, same identifier. This is a local label.
              </p>
            </div>
          ) : (
            <div className={bench.empty}>
              <span>↳</span>
              <p>Step through the flow to construct a receipt.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
