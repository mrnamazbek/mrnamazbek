"use client";

import { useState, type FormEvent } from "react";
import type { MonthlyFeature, TradeoffMatrix } from "@/types/content";

function TradeoffExperiment({
  widget,
  id,
}: {
  widget: TradeoffMatrix;
  id: string;
}) {
  const [selected, setSelected] = useState(0);
  const option = widget.config.options[selected];
  const outcome = widget.config.outcomes.reduce<
    TradeoffMatrix["config"]["outcomes"][number] | undefined
  >((best, candidate) => {
    if (!option) return best;
    return !best ||
      (option.scores[candidate.id] ?? 0) > (option.scores[best.id] ?? 0)
      ? candidate
      : best;
  }, undefined);
  return (
    <div className="tradeoff-experiment">
      <fieldset>
        <legend>{widget.config.question}</legend>
        {widget.config.options.map((item, index) => (
          <label key={item.label}>
            <input
              type="radio"
              name={`tradeoff-${id}`}
              checked={selected === index}
              onChange={() => setSelected(index)}
            />
            <span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {outcome && (
        <div className="tradeoff-outcome" role="status">
          <p className="eyebrow">A DIRECTION TO EXPLORE</p>
          <h4>{outcome.title}</h4>
          <p>{outcome.description}</p>
        </div>
      )}
      <p className="tool-footnote">
        An illustrative decision aid from the saved experiment. Use your own
        workload and requirements to validate the trade-offs.
      </p>
    </div>
  );
}

export function MonthlyExperiment({ feature }: { feature: MonthlyFeature }) {
  const initial =
    feature.widget.type === "impact_estimator"
      ? feature.widget.config.default
      : 0;
  const [value, setValue] = useState(initial);
  return (
    <article className="monthly-experiment">
      <p className="eyebrow">ARCHIVED EXPERIMENT / {feature.month}</p>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      {feature.widget.type === "impact_estimator" ? (
        <>
          <div className="range-field">
            <label htmlFor={`experiment-${feature.id}`}>
              {feature.widget.config.input_label}
              <span>{value}</span>
            </label>
            <input
              id={`experiment-${feature.id}`}
              type="range"
              min={feature.widget.config.min}
              max={feature.widget.config.max}
              step={feature.widget.config.step}
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
            />
          </div>
          <p className="experiment-result">
            <strong>
              {(
                feature.widget.config.baseline_hours *
                feature.widget.config.efficiency_factor *
                (value / 100)
              ).toFixed(1)}
            </strong>{" "}
            modeled hours saved
          </p>
          <p className="tool-footnote">
            Original illustrative model: {feature.widget.config.baseline_hours}{" "}
            baseline hours × {feature.widget.config.efficiency_factor}{" "}
            efficiency × input / 100. This is an experiment, not a measured
            outcome.
          </p>
        </>
      ) : feature.widget.type === "roadmap_planner" ? (
        <ol className="roadmap">
          {feature.widget.config.steps.map((step) => (
            <li key={step.name}>
              <strong>{step.name}</strong>
              <span>{step.detail}</span>
              <small>{step.weeks} weeks</small>
            </li>
          ))}
        </ol>
      ) : (
        <TradeoffExperiment widget={feature.widget} id={feature.id} />
      )}
      <p className="source-note mono">
        Source: {feature.source.type.replaceAll("_", " ")} ·{" "}
        {feature.source.geo} · Captured{" "}
        {feature.source.captured_at.slice(0, 10)}
      </p>
    </article>
  );
}

export function SystemConsole() {
  const [lines, setLines] = useState([
    "Welcome to Namazbek’s small corner of the terminal.",
    "Type help to explore. This is a browser simulation.",
  ]);
  const [command, setCommand] = useState("");
  const run = (event: FormEvent) => {
    event.preventDefault();
    const input = command.trim().toLowerCase();
    if (!input) return;
    setCommand("");
    if (input === "clear") {
      setLines([]);
      return;
    }
    const result: Record<string, string> = {
      help: "Commands: about · stack · projects · contact · pwd · clear",
      about:
        "Namazbek Bekzhanov — Data Engineer & Backend Developer. Almaty, Kazakhstan.",
      stack:
        "Python / SQL / Apache Airflow / dbt / Apache Iceberg / Trino / Docker",
      projects:
        "Explore my public repositories at github.com/mrnamazbek or open /projects.",
      contact: "namazbekzhan@gmail.com — or open /contact.",
      pwd: "/home/namazbek/curiosity",
    };
    setLines((items) => [
      ...items.slice(-48),
      `$ ${command.trim()}`,
      result[input] ??
        `Unknown command: ${command.trim()}. Type help for available commands.`,
    ]);
  };
  return (
    <section className="console-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">10 / A FAMILIAR INTERFACE</p>
          <h2>System console</h2>
        </div>
        <span className="mono muted">BROWSER SIMULATION</span>
      </div>
      <div className="system-console">
        <div className="console-topline">
          <span>
            <i />
            <i />
            <i />
          </span>
          <p className="mono">namazbek@almaty: ~</p>
        </div>
        <div className="console-output" role="log" aria-live="polite">
          {lines.map((line, index) => (
            <p key={`${index}-${line}`}>{line}</p>
          ))}
        </div>
        <form onSubmit={run} className="console-input">
          <label htmlFor="console-command">
            $<span className="sr-only">Console command</span>
          </label>
          <input
            id="console-command"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            maxLength={100}
            spellCheck={false}
            autoComplete="off"
            placeholder="help"
          />
          <button type="submit" className="small-button">
            Run ↵
          </button>
        </form>
      </div>
    </section>
  );
}
