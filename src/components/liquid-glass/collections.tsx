"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Code2, GitFork, Search, Star } from "lucide-react";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import type { Book, Post, Project } from "@/types/content";
import { GlassSurface } from "./surface";
import styles from "./collections.module.css";

type WritingSummary = Pick<Post, "slug" | "title" | "description" | "date" | "tags" | "readingTime">;

export function CollectionHeading({ eyebrow, title, children, count, countLabel }: {
  eyebrow: string; title: string; children: ReactNode; count: number; countLabel: string;
}) {
  return (
    <header className={styles.heading}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <div className={styles.introduction}>{children}</div>
      </div>
      <div className={styles.collectionMark} aria-label={`${count} ${countLabel}`}>
        <span>{String(count).padStart(2, "0")}</span>
        <p>{countLabel}</p>
      </div>
    </header>
  );
}

function CollectionSearch({ value, onChange, label }: {
  value: string; onChange: (value: string) => void; label: string;
}) {
  const id = useId();
  return (
    <label className={styles.search} htmlFor={id}>
      <Search size={18} aria-hidden="true" />
      <span className={styles.visuallyHidden}>{label}</span>
      <input id={id} type="search" placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Tags({ tags }: { tags: readonly string[] }) {
  return <ul className={styles.tags} aria-label="Topics">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>;
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function GlassProjects({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("All");
  const languages = ["All", ...new Set(projects.flatMap((project) => project.language ? [project.language] : []))];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = projects.filter((project) =>
    (language === "All" || language === project.language) &&
    `${project.name} ${project.description} ${project.tags.join(" ")}`.toLowerCase().includes(normalizedQuery),
  );
  return (
    <>
      <GlassSurface className={styles.toolbar} optics>
        <div className={styles.filters} role="group" aria-label="Filter projects by language">
          {languages.map((item) => <button type="button" key={item} aria-pressed={language === item} onClick={() => setLanguage(item)}>{item === "All" ? "All projects" : item}</button>)}
        </div>
        <CollectionSearch value={query} onChange={setQuery} label="Search projects" />
      </GlassSurface>
      <p className={styles.results} role="status">{filtered.length} {filtered.length === 1 ? "project" : "projects"} to explore</p>
      <div className={styles.projectGrid}>
        {filtered.map((project, index) => (
          <GlassSurface key={project.id} className={`${styles.card} ${styles.projectCard}`}>
            <article data-testid="v2-project-card" data-language={project.language ?? ""}>
              <div className={styles.cardTop}>
                <div className={`${styles.projectSymbol} ${styles[`tint${index % 3}`]}`} aria-hidden="true"><Code2 size={27} strokeWidth={1.5} /></div>
                <span className={styles.language}>{project.language ?? "Repository"}</span>
              </div>
              <h2><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name.replaceAll(/[-_]/g, " ")}<ArrowUpRight size={19} aria-hidden="true" /></a></h2>
              <p className={styles.cardDescription}>{project.description}</p>
              <Tags tags={project.tags.slice(0, 4)} />
              <div className={styles.cardFooter}>
                <span className={styles.repositoryStats}><span><Star size={14} aria-hidden="true" />{project.stars} <span className={styles.visuallyHidden}>stars</span></span><span><GitFork size={14} aria-hidden="true" />{project.forks} <span className={styles.visuallyHidden}>forks</span></span></span>
                {project.homepage ? <a href={project.homepage} target="_blank" rel="noopener noreferrer" className={styles.smallLink}>Open project <ArrowUpRight size={15} aria-hidden="true" /></a> : <span className={styles.updated}>Updated {dateLabel(project.updatedAt)}</span>}
              </div>
            </article>
          </GlassSurface>
        ))}
      </div>
      {filtered.length === 0 ? <div className={styles.empty}><Search size={28} aria-hidden="true" /><h2>No projects match that search.</h2><p>Try a different keyword or select all projects.</p><button type="button" onClick={() => { setQuery(""); setLanguage("All"); }}>Clear filters</button></div> : null}
    </>
  );
}

export function GlassWriting({ posts }: { posts: WritingSummary[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = posts.filter((post) => `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase().includes(normalizedQuery));
  return (
    <>
      <GlassSurface className={styles.toolbar} optics>
        <p className={styles.toolbarNote}><BookOpen size={18} aria-hidden="true" /> Essays, guides & engineering notes</p>
        <CollectionSearch value={query} onChange={setQuery} label="Search writing" />
      </GlassSurface>
      <p className={styles.results} role="status">{filtered.length} {filtered.length === 1 ? "note" : "notes"} from the field</p>
      <div className={styles.writingGrid}>
        {filtered.map((post, index) => (
          <GlassSurface key={post.slug} className={`${styles.card} ${styles.writingCard}`}>
            <article data-testid="v2-writing-card">
              <Link href={`/v2/writing/${post.slug}`} className={styles.writingLink}>
                <div className={styles.writingTop}><span className={styles.noteNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><ArrowUpRight size={24} aria-hidden="true" /></div>
                <div className={styles.postMeta}><time dateTime={post.date}>{dateLabel(post.date)}</time><span>{post.readingTime}</span></div>
                <h2>{post.title}</h2>
                <p className={styles.cardDescription}>{post.description}</p>
                <Tags tags={post.tags} />
                <span className={styles.readNote}>Read the note <ArrowUpRight size={16} aria-hidden="true" /></span>
              </Link>
            </article>
          </GlassSurface>
        ))}
      </div>
      {filtered.length === 0 ? <div className={styles.empty}><Search size={28} aria-hidden="true" /><h2>No notes match that search.</h2><p>Try a topic such as SQL, Python, or data.</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div> : null}
    </>
  );
}

const bookStatuses = { All: "All books", reading: "Reading now", completed: "Completed", "to-read": "On the list" } as const;

export function GlassLibrary({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<keyof typeof bookStatuses>("All");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = books.filter((book) => (status === "All" || status === book.status) && `${book.title} ${book.author} ${book.tags.join(" ")}`.toLowerCase().includes(normalizedQuery));
  return (
    <>
      <GlassSurface className={styles.toolbar} optics>
        <div className={styles.filters} role="group" aria-label="Filter books by reading status">
          {Object.entries(bookStatuses).map(([key, label]) => <button type="button" key={key} aria-pressed={status === key} onClick={() => setStatus(key as keyof typeof bookStatuses)}>{label}</button>)}
        </div>
        <CollectionSearch value={query} onChange={setQuery} label="Search the bookshelf" />
      </GlassSurface>
      <p className={styles.results} role="status">{filtered.length} {filtered.length === 1 ? "book" : "books"} on the shelf</p>
      <div className={styles.bookGrid}>
        {filtered.map((book, index) => (
          <GlassSurface key={book.id} className={`${styles.card} ${styles.bookCard}`}>
            <article data-testid="v2-book-card" data-reading-status={book.status}>
              <div className={styles.bookScene} aria-hidden="true">
                <div className={`${styles.bookObject} ${styles[`bookTint${index % 3}`]}`}><span className={styles.bookSpine} /><div className={styles.bookFront}><BookOpen size={25} strokeWidth={1.2} /><span>{book.title}</span><i /><small>{book.author}</small></div></div>
              </div>
              <div className={styles.bookBody}>
                <span className={styles.readingStatus}>{bookStatuses[book.status]}</span>
                <h2>{book.title}</h2><p className={styles.bookAuthor}>{book.author}</p><p className={styles.cardDescription}>{book.summary}</p>
                <details className={styles.bookDetails}><summary>Why it’s on the shelf <span aria-hidden="true">+</span></summary><p>{book.description}</p><Tags tags={book.tags} /><a href={`https://openlibrary.org/isbn/${encodeURIComponent(book.isbn)}`} target="_blank" rel="noopener noreferrer" className={styles.smallLink}>Book details <ArrowUpRight size={15} aria-hidden="true" /></a></details>
              </div>
            </article>
          </GlassSurface>
        ))}
      </div>
      {filtered.length === 0 ? <div className={styles.empty}><BookOpen size={28} aria-hidden="true" /><h2>No books match that search.</h2><p>Try another title, author, or reading status.</p><button type="button" onClick={() => { setQuery(""); setStatus("All"); }}>Clear filters</button></div> : null}
    </>
  );
}
