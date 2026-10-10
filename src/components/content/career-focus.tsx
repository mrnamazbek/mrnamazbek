import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/page-heading";

const examples = [
  {
    title: "Explain the slow query.",
    description: "A scoped review of query plans, expensive operations and candidate changes, with a reproducible measurement plan.",
    tools: ["SQL", "PostgreSQL", "Oracle", "PL/SQL", "Vertica", "Greenplum"],
    demo: "post-a-postgres",
    linkLabel: "Explore the public Postgres demo",
    note: "The demo illustrates Postgres query analysis. Oracle, Vertica and Greenplum are separate experience areas.",
  },
  {
    title: "Make the pipeline easier to trust.",
    description: "A defined ETL issue, dbt data-quality improvement or Airflow reliability review. Agree on inputs, checks and ownership before implementation.",
    tools: ["dbt", "Airflow", "ETL", "ELT", "Data warehouse", "Trino", "Iceberg", "Power BI"],
    demo: "post-b-feature-pipeline",
    linkLabel: "Explore the public Python ETL demo",
    note: "A small Python ETL example; the listed tools describe my wider focus, rather than dependencies of this demo.",
  },
  {
    title: "Measure before changing.",
    description: "Inspect a pipeline bottleneck, compare approaches and keep a repeatable example of the behaviour.",
    tools: ["Python", "Data pipelines", "Profiling"],
    demo: "post-c-python-perf",
    linkLabel: "Explore the public performance demo",
    note: "Public learning examples. Client results and delivery estimates require an agreed scope.",
  },
];

export function CareerFocus({ email }: { email: string }) {
  return (
    <section className="content-section" id="career">
      <SectionHeading number="06" title="A clear scope. Reliable data." />
      <p className="muted">Python, SQL, PostgreSQL, dbt and Airflow are at the centre of my data work. Explore the examples below and let’s discuss the problem, the expected outcome and the working schedule.</p>
      <div className="repository-grid">
        {examples.map((example) => (
          <article className="signal-panel career-card" key={example.demo}>
            <h3>{example.title}</h3>
            <p>{example.description}</p>
            <div className="tag-list">
              {example.tools.map((tool) => <span key={tool} id={`career-${tool.toLowerCase().replace(/[ /]+/g, "-")}`}>{tool}</span>)}
            </div>
            <a className="text-link" href={`https://github.com/mrnamazbek/mrnamazbek/tree/main/blog/demos/${example.demo}`} target="_blank" rel="noopener noreferrer">{example.linkLabel} <ArrowUpRight size={16} /></a>
            <p className="tool-footnote">{example.note}</p>
          </article>
        ))}
      </div>
      <div className="telegram-banner">
        <div><p className="eyebrow">JOB HUNTER AGENT</p><h3>My private workspace.</h3><p>Targeted searches, application materials and next steps.</p></div>
        <a className="button button-outline" href="https://job-hunter-agent-taupe.vercel.app/#focus" target="_blank" rel="noopener noreferrer">Open private workspace <ArrowUpRight size={17} /></a>
      </div>
      <a className="text-link" href={`mailto:${email}?subject=Data%20project%20enquiry`}>Discuss a project <ArrowUpRight size={16} /></a>
    </section>
  );
}
