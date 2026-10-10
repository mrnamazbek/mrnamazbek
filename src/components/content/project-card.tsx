import { ArrowUpRight, Code2, Database, GitBranch } from "lucide-react";
import type { Project } from "@/types/content";
import { InteractiveCard } from "@/components/ui/interactive-card";

export function ProjectCard({
  project,
  index = 0,
  visual = false,
}: {
  project: Project;
  index?: number;
  visual?: boolean;
}) {
  const title = project.name.replaceAll("_", " ").replaceAll("-", " ");
  return (
    <InteractiveCard
      className={`project-card ${visual ? "project-card-featured" : ""}`}
    >
      {visual && (
        <div
          className={`project-visual visual-${index % 3}`}
          aria-hidden="true"
        >
          <span className="visual-caption">
            EXPERIMENT / {String(index + 1).padStart(2, "0")}
          </span>
          {index % 2 === 0 ? (
            <div className="visual-pipeline">
              <div>
                <Database size={24} />
                <span>SOURCE</span>
              </div>
              <i />
              <div>
                <GitBranch size={24} />
                <span>TRANSFORM</span>
              </div>
              <i />
              <div>
                <Code2 size={24} />
                <span>BUILD</span>
              </div>
            </div>
          ) : (
            <div className="visual-code">
              <span>const curiosity = true;</span>
              <span>while (curiosity) &#123;</span>
              <span>&nbsp;&nbsp;learn();</span>
              <span>&nbsp;&nbsp;build();</span>
              <span>&#125;</span>
            </div>
          )}
          <div className="visual-grid" />
        </div>
      )}
      <div className="project-card-body">
        <div className="card-topline">
          <span className="eyebrow">{project.language ?? "OPEN SOURCE"}</span>
          <ArrowUpRight size={20} className="card-arrow" />
        </div>
        <h3>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="stretched-link"
          >
            {title}
          </a>
        </h3>
        <p>{project.description}</p>
        <div className="project-meta">
          <span>
            <GitBranch size={13} /> Public repository
          </span>
          {project.stars > 0 && <span>★ {project.stars}</span>}
        </div>
      </div>
    </InteractiveCard>
  );
}
