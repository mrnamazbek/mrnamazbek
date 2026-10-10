import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/page-heading";
import styles from "./live-signals.module.css";

const resources = [
  { name: "Hugging Face", url: "https://huggingface.co/" },
  { name: "SWE-bench", url: "https://www.swebench.com/" },
  { name: "Habr", url: "https://habr.com/" },
  { name: "Claude", url: "https://claude.ai/" },
  { name: "Gemini", url: "https://gemini.google.com/" },
  { name: "LinkedIn", url: "https://linkedin.com/" },
  { name: "Proglib", url: "https://proglib.io/" },
];

export function EngineeringResources() {
  return (
    <section className="content-section" id="resources">
      <SectionHeading number="11" title="Daily engineering resources" />
      <p className="muted">
        The learning platforms, communities, and tools I keep close.
      </p>
      <div className={styles.resources}>
        {resources.map((resource) => (
          <a
            href={resource.url}
            key={resource.name}
            target="_blank"
            rel="noopener noreferrer"
          >
            {resource.name}
            <ArrowUpRight size={16} />
          </a>
        ))}
      </div>
    </section>
  );
}
