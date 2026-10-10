import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { snapshotAsOf, snapshotCatalog, snapshotKeys, type SnapshotKey } from "../src/lib/content/snapshot-catalog";

export interface SnapshotRow {
  key: SnapshotKey;
  payload: unknown;
  as_of: string | null;
  published: true;
}

interface SyncOptions {
  root?: string;
  keys?: SnapshotKey[];
  database?: boolean;
  upload?: (rows: SnapshotRow[]) => Promise<void>;
}

export function parseSyncArguments(arguments_: string[]): { database: boolean; keys: SnapshotKey[] } {
  let database = false;
  let keys = snapshotKeys;
  for (let index = 0; index < arguments_.length; index++) {
    const argument = arguments_[index];
    if (argument === "--database") { database = true; continue; }
    if (argument === "--only" || argument.startsWith("--only=")) {
      const selection = argument === "--only" ? arguments_[++index] : argument.slice("--only=".length);
      const requested = selection?.split(",").filter(Boolean) ?? [];
      if (requested.length === 0 || requested.some((key) => !snapshotKeys.includes(key as SnapshotKey))) {
        throw new Error(`--only must contain known snapshot keys: ${snapshotKeys.join(",")}`);
      }
      keys = [...new Set(requested)] as SnapshotKey[];
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return { database, keys };
}

export async function syncContentSnapshots(options: SyncOptions = {}) {
  const root = resolve(options.root ?? process.cwd());
  const keys = options.keys ?? snapshotKeys;
  if (keys.length === 0 || keys.some((key) => !snapshotKeys.includes(key))) throw new Error("Unknown or empty snapshot selection");

  // Validate every selected source before replacing any local file or touching the database.
  const snapshots = await Promise.all(keys.map(async (key) => {
    const definition = snapshotCatalog[key];
    const source = join(root, "assets", definition.filename);
    const raw = await readFile(source, "utf8");
    const payload: unknown = JSON.parse(raw);
    const parsed = definition.schema.safeParse(payload);
    if (!parsed.success) throw new Error(`Invalid ${definition.filename}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
    return { filename: definition.filename, raw, row: { key, payload, as_of: snapshotAsOf(key, payload), published: true } satisfies SnapshotRow };
  }));

  let upload = options.upload;
  if (options.database && !upload) {
    const client = createSupabaseAdminClient();
    if (!client) throw new Error("Database sync requires SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).");
    upload = async (rows) => {
      const { error } = await client.from("content_snapshots").upsert(rows, { onConflict: "key" }).retry(false);
      if (error) throw new Error("Supabase snapshot upload failed; database content was not confirmed updated.");
    };
  }

  const destination = join(root, "src", "content", "snapshots");
  await mkdir(destination, { recursive: true });
  for (const snapshot of snapshots) {
    const target = join(destination, snapshot.filename);
    const temporary = `${target}.tmp`;
    await writeFile(temporary, snapshot.raw);
    await rename(temporary, target);
  }

  // Credentials alone never opt a build into remote writes.
  if (options.database) await upload!(snapshots.map((snapshot) => snapshot.row));
  return { copied: snapshots.length, published: options.database ? snapshots.length : 0, keys };
}

async function main() {
  const options = parseSyncArguments(process.argv.slice(2));
  if (options.database && existsSync(".env.local")) process.loadEnvFile(".env.local");
  const result = await syncContentSnapshots(options);
  console.info(`Validated and copied ${result.copied} content snapshots.${options.database ? ` Published ${result.published} snapshots to Supabase.` : " No database writes requested."}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Snapshot synchronization failed");
    process.exitCode = 1;
  });
}
