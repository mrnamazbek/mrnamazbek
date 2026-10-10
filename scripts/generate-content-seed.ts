import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { localContent } from "../src/lib/content/local";

function snakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);
}

function literal(value: unknown, json = false): string {
  if (json) return `${literal(JSON.stringify(value))}::jsonb`;
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return `array[${value.map((entry) => literal(entry)).join(",")}]::text[]`;
  if (typeof value === "object") return literal(value, true);
  if (typeof value !== "string") throw new Error("Unsupported seed value");
  return `'${value.replace(/'/g, "''")}'`;
}

function databaseRow(row: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [snakeCase(key), value]));
}

function insert(table: string, row: Record<string, unknown>, key = "id"): string {
  // Identifiers come from this script; all content values are escaped SQL literals.
  const columns = Object.keys(row);
  const values = columns.map((column) => literal(row[column], column === "payload"));
  const updates = columns.filter((column) => column !== key).map((column) => `${column} = excluded.${column}`);
  return `insert into public.${table} (${columns.join(",")})\nvalues (${values.join(",")})\non conflict (${key}) do update set ${updates.join(", ")};\n`;
}

const statements = [
  "-- Idempotent public-content seed. Review before applying to a production project.\n-- Re-running updates matching IDs; it does not delete added rows or touch private contacts.\nbegin;\n",
  insert("site_profiles", { id: "main", ...databaseRow(localContent.profile), published: true }),
];

const collections = [
  ["experiences", localContent.experience], ["education", localContent.education],
  ["certifications", localContent.certifications], ["skill_groups", localContent.skills],
  ["projects", localContent.projects], ["books", localContent.books], ["posts", localContent.posts],
] as const;

for (const [table, rows] of collections) {
  rows.forEach((row, position) => statements.push(insert(table,
    { ...databaseRow(row), position, published: true }, table === "posts" ? "slug" : "id")));
}

const snapshots = [
  ["telegram", localContent.telegram, localContent.telegram.updated],
  ["rankings", localContent.rankings, localContent.rankings[0]?.as_of ?? null],
  ["monthlyFeature", localContent.monthlyFeature, localContent.monthlyFeature.month],
  ["featureHistory", localContent.featureHistory, localContent.featureHistory.at(-1)?.month ?? null],
  ["audience", localContent.audience, localContent.audience.as_of],
  ["keywords", localContent.keywords, null],
] as const;

for (const [key, payload, asOf] of snapshots) {
  statements.push(insert("content_snapshots", { key, payload, as_of: asOf, published: true }, "key"));
}
statements.push("commit;\n");

const destination = resolve("supabase/seed.sql");
writeFileSync(destination, statements.join("\n"));
console.info(`Validated content seed written to ${destination}`);
