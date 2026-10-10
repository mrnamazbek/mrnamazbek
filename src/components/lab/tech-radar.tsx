"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";

type Repository = {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
};
export function TechRadar() {
  const [category, setCategory] = useState("dataeng");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/github?category=${category}`, { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        setRepositories(data.repositories);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRepositories([]);
          setStatus("error");
        }
      });
    return () => abort.abort();
  }, [category]);
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">06 / OPEN-SOURCE SIGNALS</p>
          <h2>Tech radar</h2>
        </div>
        <div className="filter-tabs">
          {[
            ["dataeng", "Data engineering"],
            ["python", "Python"],
            ["devops", "DevOps"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={category === id}
              className={category === id ? "active" : ""}
              onClick={() => {
                setCategory(id);
                setStatus("loading");
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {status === "error" ? (
        <p className="muted" role="status">
          GitHub is unavailable right now.{" "}
          <a
            className="text-link"
            href="https://github.com/topics/data-engineering"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore on GitHub ↗
          </a>
        </p>
      ) : status === "loading" ? (
        <p className="muted" role="status">
          Following the signal…
        </p>
      ) : (
        <div className="radar-grid">
          {repositories.slice(0, 6).map((repository) => (
            <article key={repository.id}>
              <div className="card-topline">
                <span className="eyebrow">
                  {repository.language ?? "OPEN SOURCE"}
                </span>
                <ArrowUpRight size={17} />
              </div>
              <h3>
                <a
                  href={repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repository.name}
                </a>
              </h3>
              <p>{repository.description}</p>
              <span className="mono">
                <Star size={12} />
                {repository.stars.toLocaleString()} stars
              </span>
            </article>
          ))}
        </div>
      )}
      <p className="source-note mono">
        Public GitHub search results. Cached to respect API limits.
      </p>
    </section>
  );
}
