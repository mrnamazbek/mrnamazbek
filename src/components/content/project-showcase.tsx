"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUpRight, Braces, Code2, GitBranch } from "lucide-react";
import type { Project } from "@/types/content";
import styles from "./project-showcase.module.css";

function projectTitle(project: Project) {
  return project.name.replaceAll("_", " ").replaceAll("-", " ");
}

export function ProjectShowcase({ projects }: { projects: readonly Project[] }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const project = projects[selected] ?? projects[0];

  if (!project) return null;

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (index + 1) % projects.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (index + projects.length - 1) % projects.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = projects.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  }

  return (
    <section className={styles.showcase} aria-labelledby={`${id}-heading`} data-project-showcase>
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">A CLOSER LOOK / SELECTED REPOSITORIES</p>
          <h2 id={`${id}-heading`}>Ideas, in working form.</h2>
        </div>
        <a href="#repository-index" className={`text-link ${styles.indexLink}`}>
          All repositories <ArrowDown size={16} aria-hidden="true" />
        </a>
      </div>
      <div className={styles.explorer}>
        <div className={styles.index}>
          <p className={`mono ${styles.instruction}`} id={`${id}-instruction`}>
            Choose a project to explore.
          </p>
          <div role="tablist" aria-label="Selected projects" aria-orientation="vertical" aria-describedby={`${id}-instruction`} className={styles.tabs}>
            {projects.map((item, index) => (
              <button
                key={item.id}
                ref={element => { buttons.current[index] = element; }}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={selected === index}
                aria-controls={`${id}-panel`}
                tabIndex={selected === index ? 0 : -1}
                className={styles.tab}
                onClick={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onPointerEnter={event => { if (event.pointerType === "mouse") setSelected(index); }}
                onKeyDown={event => navigate(event, index)}
              >
                <span className={`mono ${styles.number}`} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.tabText}>
                  <span className={styles.tabTitle}>{projectTitle(item)}</span>
                  <span className={`mono ${styles.tabLanguage}`}>{item.language ?? "Open source"}</span>
                </span>
                <ArrowUpRight size={22} className={styles.tabArrow} aria-hidden="true" />
              </button>
            ))}
          </div>
          <noscript><p className={styles.instruction}>Browse every project in the repository index below.</p></noscript>
        </div>
        <div
          className={styles.preview}
          id={`${id}-panel`}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`${id}-tab-${selected}`}
        >
          <div className={styles.blueprint} aria-hidden="true" data-variant={selected % 4}>
            <div className={styles.blueprintHeader}>
              <span>PROJECT / {String(selected + 1).padStart(2, "0")}</span>
              <span>{project.language ?? "OPEN SOURCE"}</span>
            </div>
            <div className={styles.blueprintDrawing} key={project.id} data-project-drawing>
              <div className={styles.orbit} />
              <div className={`${styles.tile} ${styles.tileBack}`}><GitBranch strokeWidth={1} /></div>
              <div className={`${styles.tile} ${styles.tileMiddle}`}><Braces strokeWidth={1} /></div>
              <div className={`${styles.tile} ${styles.tileFront}`}><Code2 strokeWidth={1} /></div>
              <span className={styles.axisX} />
              <span className={styles.axisY} />
              <i className={`${styles.point} ${styles.pointOne}`} />
              <i className={`${styles.point} ${styles.pointTwo}`} />
            </div>
            <div className={styles.blueprintFooter}>
              <span>{project.slug}</span>
              <span>PUBLIC REPOSITORY</span>
            </div>
          </div>
          <div className={styles.details} key={`details-${project.id}`}>
            <h3>{projectTitle(project)}</h3>
            <p className={styles.description}>{project.description}</p>
            <div className={styles.topics} aria-label="Project language and topics">
              {project.language ? <span>{project.language}</span> : null}
              {project.tags.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}
            </div>
            <div className={styles.links}>
              <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer">
                View repository <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              {project.homepage ? (
                <a className="text-link" href={project.homepage} target="_blank" rel="noopener noreferrer">
                  Visit project <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
