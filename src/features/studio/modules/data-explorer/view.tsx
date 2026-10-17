"use client";
import { useState } from "react";
import type { ModuleViewProps } from "../types";
import {
  getRoleFixture,
  searchNotes,
  searchRoles,
  type Note,
  type SampleRole,
} from "./domain";
import { notes } from "./fixtures";
import { LocalDialog } from "../../components/local-dialog";
import styles from "../../components/studio.module.css";
import bench from "../../components/workbench.module.css";

type Selection =
  | { kind: "note"; value: Note }
  | { kind: "role"; value: SampleRole };
const categories = ["systems", "interfaces", "workflows", "research"] as const;
const departments = ["Platform", "Operations", "Design", "Product"];

export default function DataExplorerView({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const [mode, setMode] = useState<"notes" | "roles">("notes");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Note["category"] | "all">("all");
  const [department, setDepartment] = useState("all");
  const [fixture, setFixture] = useState<"seeded" | "empty" | "unavailable">(
    "seeded",
  );
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);
  const roles = getRoleFixture(fixture);
  const notePage = searchNotes(notes, query, category, page);
  const rolePage = searchRoles(roles.roles, query, department, page);
  const current = mode === "notes" ? notePage : rolePage;
  const changeMode = (value: "notes" | "roles") => {
    setMode(value);
    setQuery("");
    setPage(1);
    setSelection(null);
    setCategory("all");
    setDepartment("all");
  };
  const reset = () => {
    changeMode("notes");
    setFixture("seeded");
  };
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} workbench`}
    >
      <div className={bench.heading}>
        <div>
          <span className={styles.eyebrow}>02 / SEEDED DEMO</span>
          <h2>A small archive. A useful signal.</h2>
        </div>
        <span className={styles.badge}>Local fixtures only</span>
      </div>
      <div className={bench.tabs} aria-label="Explorer mode">
        <button
          type="button"
          aria-pressed={mode === "notes"}
          onClick={() => changeMode("notes")}
        >
          Notes
        </button>
        <button
          type="button"
          aria-pressed={mode === "roles"}
          onClick={() => changeMode("roles")}
        >
          Sample roles
        </button>
      </div>
      <p>
        {mode === "notes"
          ? "19 invented notes. Dates and examples belong to this fictional archive."
          : "Fictional roles, not current openings."}
      </p>
      <div className={styles.controls}>
        <label>
          {mode === "notes" ? "Search notes" : "Search sample roles"}
          <input
            type="search"
            value={query}
            placeholder={
              mode === "notes"
                ? "Try contracts, café, recovery…"
                : "Try platform, remote, design…"
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              setSelection(null);
            }}
          />
        </label>
        {mode === "notes" ? (
          <label>
            Note category
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as Note["category"] | "all");
                setPage(1);
                setSelection(null);
              }}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label>
              Department
              <select
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setPage(1);
                  setSelection(null);
                }}
              >
                <option value="all">All departments</option>
                {departments.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Role fixture
              <select
                value={fixture}
                onChange={(event) => {
                  setFixture(event.target.value as typeof fixture);
                  setPage(1);
                  setSelection(null);
                }}
              >
                <option value="seeded">Seeded · nine roles</option>
                <option value="empty">Empty fixture</option>
                <option value="unavailable">Unavailable fixture</option>
              </select>
            </label>
          </>
        )}
      </div>
      <p role="status" className={bench.subtle}>
        {current.total} {mode === "notes" ? "notes" : "sample roles"} ·{" "}
        {current.items.length} on this page
      </p>
      {mode === "roles" && roles.state === "unavailable" ? (
        <div className={`${styles.status} ${styles.error}`}>
          <h3>The local adapter is unavailable.</h3>
          <p>
            This is a selected fixture. No recruiting service was contacted.
          </p>
          <button
            type="button"
            onClick={() => {
              setFixture("seeded");
              setPage(1);
            }}
          >
            Retry local fixture
          </button>
        </div>
      ) : current.total === 0 ? (
        <div className={styles.panel}>
          <h3>
            {mode === "roles" && fixture === "empty"
              ? "The selected fixture contains no roles."
              : "No matching records."}
          </h3>
          <p>Try a shorter query, change the filter, or reset the demo.</p>
        </div>
      ) : (
        <ul
          className={bench.list}
          aria-label={mode === "notes" ? "Invented notes" : "Sample team roles"}
        >
          {mode === "notes"
            ? notePage.items.map((note) => (
                <li className={bench.row} key={note.id}>
                  <div>
                    <span className={styles.eyebrow}>
                      {note.category} / {note.date}
                    </span>
                    <h3>{note.title}</h3>
                    <p>{note.summary}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Read ${note.title}`}
                    onClick={() => setSelection({ kind: "note", value: note })}
                  >
                    Read ↗
                  </button>
                </li>
              ))
            : rolePage.items.map((role) => (
                <li className={bench.row} key={role.id}>
                  <div>
                    <span className={styles.eyebrow}>
                      {role.department} / {role.kind}
                    </span>
                    <h3>{role.title}</h3>
                    <p>{role.location} · Sample team role</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Inspect ${role.title}`}
                    onClick={() => setSelection({ kind: "role", value: role })}
                  >
                    Inspect ↗
                  </button>
                </li>
              ))}
        </ul>
      )}
      <div className={styles.controls} aria-label="Result pagination">
        <button
          type="button"
          aria-label="Previous page"
          disabled={current.page <= 1}
          onClick={() => setPage(current.page - 1)}
        >
          ← Previous
        </button>
        <span className={styles.mono}>
          Page {current.page} of {current.pages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={current.page >= current.pages}
          onClick={() => setPage(current.page + 1)}
        >
          Next →
        </button>
        <button type="button" onClick={reset}>
          Reset demo
        </button>
      </div>
      {selection ? (
        <LocalDialog
          key={selection.value.id}
          title={selection.value.title}
          onClose={() => setSelection(null)}
        >
          {selection.kind === "note" ? (
            <>
              <p className={styles.eyebrow}>
                Invented note / {selection.value.date}
              </p>
              <p>{selection.value.summary}</p>
              <p className={styles.mono}>{selection.value.terms.join(" / ")}</p>
              <p>
                This local detail illustrates an archive reading flow. It is not
                a report about a real project.
              </p>
            </>
          ) : (
            <>
              <p className={styles.eyebrow}>
                Sample team role / {selection.value.department}
              </p>
              <p>{selection.value.description}</p>
              <p>
                {selection.value.location} · {selection.value.kind}
              </p>
              <p>Fictional role. There is no application or hiring process.</p>
            </>
          )}
        </LocalDialog>
      ) : null}
    </section>
  );
}
