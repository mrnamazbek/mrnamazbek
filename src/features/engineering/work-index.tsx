"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Circle, CircleDot } from "lucide-react";
import { engineeringWork } from "./work";
import { WorkVisual } from "./work-visual";
import styles from "./engineering.module.css";

export function WorkIndex() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const feature = useRef<HTMLDivElement>(null);
  const bounds = useRef<DOMRect | null>(null);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = engineeringWork.length;
    const destination = {
      ArrowRight: (index + 1) % count,
      ArrowDown: (index + 1) % count,
      ArrowLeft: (index + count - 1) % count,
      ArrowUp: (index + count - 1) % count,
      Home: 0,
      End: count - 1,
    }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    tabs.current[destination]?.focus();
  }

  return (
    <section className={styles.section} id="selected-work" aria-labelledby={`${id}-title`}>
      <header className={styles.heading}>
        <h2 id={`${id}-title`}>Selected work</h2>
        <Link href="/projects" className="text-link">All projects <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </header>
      <div className={styles.index}>
        <div className={styles.tabList} role="tablist" aria-label="Engineering case studies" aria-orientation="vertical">
          {engineeringWork.map((work, index) => (
            <button
              key={work.slug}
              ref={(element) => { tabs.current[index] = element; }}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={index === selected ? 0 : -1}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse" && !feature.current?.contains(document.activeElement)) setSelected(index);
              }}
              onFocus={() => setSelected(index)}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => navigate(event, index)}
            >
              <span className={styles.discipline}>{work.discipline}</span>
              <strong>{work.title}</strong>
              {index === selected ? <CircleDot size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div className={styles.feature} ref={feature}>
          <div
            className={styles.preview}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") bounds.current = event.currentTarget.getBoundingClientRect();
            }}
            onPointerMove={(event) => {
              const rect = bounds.current;
              if (event.pointerType !== "mouse" || !rect) return;
              event.currentTarget.style.setProperty("--light-x", `${(event.clientX - rect.left) / rect.width * 100}%`);
              event.currentTarget.style.setProperty("--light-y", `${(event.clientY - rect.top) / rect.height * 100}%`);
            }}
            onPointerLeave={(event) => {
              bounds.current = null;
              event.currentTarget.style.removeProperty("--light-x");
              event.currentTarget.style.removeProperty("--light-y");
            }}
          >
            <WorkVisual key={selected} work={engineeringWork[selected]} />
          </div>
          {engineeringWork.map((work, index) => (
            <div
              key={work.slug}
              className={styles.previewCopy}
              role="tabpanel"
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-tab-${index}`}
              hidden={index !== selected}
              tabIndex={index === selected ? 0 : -1}
            >
              <h3>{work.headline}</h3>
              <p>{work.summary}</p>
              <Link className="text-link" href={`/projects/${work.slug}`}>Read case study <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          ))}
        </div>
      </div>
      <noscript>
        <nav className={styles.caseLinks} aria-label="Case study links">
          {engineeringWork.map((work) => <Link key={work.slug} href={`/projects/${work.slug}`}>{work.title} <ArrowUpRight size={14} aria-hidden="true" /></Link>)}
        </nav>
      </noscript>
    </section>
  );
}
