import { sampleRoles } from "./fixtures";

export type Note = {
  id: string;
  title: string;
  summary: string;
  terms: readonly string[];
  category: "systems" | "interfaces" | "workflows" | "research";
  date: string;
};
export type SampleRole = {
  id: string;
  title: string;
  department: string;
  location: string;
  kind: "full-time" | "contract";
  description: string;
};
export type Page<T> = {
  items: readonly T[];
  total: number;
  page: number;
  pages: number;
};

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .trim()
    .replace(/\s+/gu, " ");
}
function paginate<T>(items: readonly T[], requested: number): Page<T> {
  const pages = Math.max(1, Math.ceil(items.length / 6));
  const page = Math.max(
    1,
    Math.min(pages, Number.isFinite(requested) ? Math.floor(requested) : 1),
  );
  return {
    items: items.slice((page - 1) * 6, page * 6),
    total: items.length,
    page,
    pages,
  };
}
export function searchNotes(
  notes: readonly Note[],
  query: string,
  category: Note["category"] | "all",
  page: number,
): Page<Note> {
  const term = normalize(query);
  return paginate(
    notes.filter(
      (note) =>
        (category === "all" || category === note.category) &&
        normalize(
          `${note.title} ${note.summary} ${note.terms.join(" ")}`,
        ).includes(term),
    ),
    page,
  );
}
export function searchRoles(
  roles: readonly SampleRole[],
  query: string,
  department: string | "all",
  page: number,
): Page<SampleRole> {
  const term = normalize(query);
  return paginate(
    roles.filter(
      (role) =>
        (department === "all" || department === role.department) &&
        normalize(
          `${role.title} ${role.department} ${role.location} ${role.kind} ${role.description}`,
        ).includes(term),
    ),
    page,
  );
}
export function getRoleFixture(mode: "seeded" | "empty" | "unavailable"): {
  state: "ready" | "empty" | "unavailable";
  roles: readonly SampleRole[];
} {
  return mode === "seeded"
    ? { state: "ready", roles: sampleRoles }
    : { state: mode, roles: [] };
}
