"use client";

import { useState } from "react";
import { RegexPlayground } from "./regex-playground";
import { DockerGenerator } from "./docker-generator";
import { CostEstimator, WorldClock } from "./clock-cost";
import { PipelineBuilder } from "./pipeline-builder";

const tools = [
  "Regex",
  "Docker Compose",
  "Cost estimator",
  "World clock",
  "Pipeline architect",
];
export function DeveloperTools() {
  const [active, setActive] = useState(0);
  return (
    <section className="developer-tools" id="tools">
      <nav className="tool-navigation" aria-label="Developer tools">
        {tools.map((tool, index) => (
          <button
            key={tool}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            className={active === index ? "active" : ""}
          >
            <span className="mono">0{index + 1}</span>
            {tool}
          </button>
        ))}
      </nav>
      {active === 0 ? (
        <RegexPlayground />
      ) : active === 1 ? (
        <DockerGenerator />
      ) : active === 2 ? (
        <CostEstimator />
      ) : active === 3 ? (
        <WorldClock />
      ) : (
        <PipelineBuilder />
      )}
    </section>
  );
}
