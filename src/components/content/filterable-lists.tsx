"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ProjectCard } from "./project-card";
import { PostCard, type PostSummary } from "./post-card";
import type { Book, Project } from "@/types/content";

function SearchField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="search-field">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        aria-label={label}
        type="search"
      />
    </label>
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("All");
  const languages = [
    "All",
    ...Array.from(
      new Set(
        projects
          .map((project) => project.language)
          .filter((item): item is string => Boolean(item)),
      ),
    ),
  ];
  const filtered = projects.filter(
    (project) =>
      (language === "All" || project.language === language) &&
      `${project.name} ${project.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="list-controls">
        <div className="filter-tabs" aria-label="Filter projects by language">
          {languages.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={language === item}
              className={language === item ? "active" : ""}
              onClick={() => setLanguage(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <SearchField
          label="Search projects"
          value={query}
          onChange={setQuery}
        />
      </div>
      <p className="results-count mono" role="status">
        {filtered.length}{" "}
        {filtered.length === 1 ? "repository" : "repositories"}
      </p>
      <div className="project-grid repository-grid">
        {filtered.map((project, index) => (
          <ProjectCard project={project} index={index} key={project.id} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="no-results">
          No projects match that search. Try another keyword.
        </p>
      )}
    </>
  );
}

export function WritingList({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const filtered = posts.filter((post) =>
    `${post.title} ${post.description} ${post.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="list-controls">
        <p className="mono muted">ESSAYS, GUIDES & ENGINEERING NOTES</p>
        <SearchField label="Search writing" value={query} onChange={setQuery} />
      </div>
      <div className="post-list">
        {filtered.map((post, index) => (
          <PostCard post={post} index={index} key={post.slug} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="no-results" role="status">
          No notes match that search.
        </p>
      )}
    </>
  );
}

const bookStatus = {
  All: "All books",
  reading: "Reading now",
  completed: "Completed",
  "to-read": "On the list",
} as const;
export function BookList({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<keyof typeof bookStatus>("All");
  const filtered = books.filter(
    (book) =>
      (status === "All" || book.status === status) &&
      `${book.title} ${book.author} ${book.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="list-controls">
        <div
          className="filter-tabs"
          aria-label="Filter books by reading status"
        >
          {Object.entries(bookStatus).map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-pressed={status === key}
              className={status === key ? "active" : ""}
              onClick={() => setStatus(key as keyof typeof bookStatus)}
            >
              {label}
            </button>
          ))}
        </div>
        <SearchField
          label="Search the bookshelf"
          value={query}
          onChange={setQuery}
        />
      </div>
      <p className="results-count mono" role="status">
        {filtered.length} books on this shelf
      </p>
      <div className="book-grid">
        {filtered.map((book, index) => (
          <article className="book-card" key={book.id}>
            <div
              className={`book-cover book-color-${index % 4}`}
              aria-hidden="true"
            >
              <span className="book-cover-author">{book.author}</span>
              <span className="book-cover-title">{book.title}</span>
              <span className="book-cover-rule" />
              <span className="book-cover-label">THE ENGINEER’S BOOKSHELF</span>
            </div>
            <div className="book-body">
              <span className={`tag book-status-${book.status}`}>
                {bookStatus[book.status]}
              </span>
              <h2>{book.title}</h2>
              <p className="book-author">{book.author}</p>
              <p>{book.summary}</p>
              <details>
                <summary>
                  Why it’s on the shelf <span>+</span>
                </summary>
                <p>{book.description}</p>
                <div className="tag-list">
                  {book.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={`https://openlibrary.org/isbn/${encodeURIComponent(book.isbn)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Book details ↗
                </a>
              </details>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="no-results">No books match that search.</p>
      )}
    </>
  );
}
