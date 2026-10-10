import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, test } from "node:test";
import { parseSyncArguments, syncContentSnapshots, type SnapshotRow } from "../../scripts/sync-content-snapshots";
import telegram from "../../assets/telegram_posts.json";
import feature from "../../assets/ai_monthly_feature.json";

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "portfolio-content-sync-"));
  await mkdir(join(root, "assets"));
  await writeFile(join(root, "assets", "telegram_posts.json"), JSON.stringify(telegram));
  await writeFile(join(root, "assets", "ai_monthly_feature.json"), JSON.stringify(feature));
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

test("snapshot selection rejects unknown keys and paths", () => {
  assert.deepEqual(parseSyncArguments(["--only=monthlyFeature,featureHistory"]), { database: false, keys: ["monthlyFeature", "featureHistory"] });
  assert.throws(() => parseSyncArguments(["--only=../profile"]), /known snapshot keys/);
  assert.throws(() => parseSyncArguments(["--only="]), /known snapshot keys/);
});

test("default local sync copies only selected feeds and never calls a database uploader", async () => {
  let uploaded = false;
  const result = await syncContentSnapshots({ root, keys: ["telegram"], upload: async () => { uploaded = true; } });
  assert.equal(result.copied, 1);
  assert.equal(result.published, 0);
  assert.equal(uploaded, false);
  assert.deepEqual(JSON.parse(await readFile(join(root, "src", "content", "snapshots", "telegram_posts.json"), "utf8")), telegram);
  await assert.rejects(readFile(join(root, "src", "content", "profile.json")), /ENOENT/);
  await assert.rejects(readFile(join(root, "src", "content", "snapshots", "ai_monthly_feature.json")), /ENOENT/);
});

test("all selected feeds must validate before any existing local snapshot is replaced", async () => {
  const destination = join(root, "src", "content", "snapshots");
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, "telegram_posts.json"), "existing-content");
  await writeFile(join(root, "assets", "ai_monthly_feature.json"), '{"id":"broken"}');
  await assert.rejects(syncContentSnapshots({ root, keys: ["telegram", "monthlyFeature"] }), /Invalid ai_monthly_feature.json/);
  assert.equal(await readFile(join(destination, "telegram_posts.json"), "utf8"), "existing-content");
});

test("explicit database sync publishes only the selected snapshot with provenance", async () => {
  let rows: SnapshotRow[] = [];
  const result = await syncContentSnapshots({ root, keys: ["monthlyFeature"], database: true, upload: async (received) => { rows = received; } });
  assert.equal(result.published, 1);
  assert.deepEqual(rows.map((row) => row.key), ["monthlyFeature"]);
  assert.equal(rows[0].as_of, feature.month);
  assert.equal(rows[0].published, true);
  assert.deepEqual(rows[0].payload, feature);
});

test("database upload failures reject rather than reporting a successful publication", async () => {
  await assert.rejects(syncContentSnapshots({ root, keys: ["telegram"], database: true, upload: async () => { throw new Error("Upload failed"); } }), /Upload failed/);
});

test("Telegram exporter may omit timestamp and view metadata without inventing values", async () => {
  const payload = { ...telegram, posts: [{ id: "tech_digest_kz/1", url: "https://t.me/tech_digest_kz/1", text: "Public channel update", date: null, views: null }] };
  await writeFile(join(root, "assets", "telegram_posts.json"), JSON.stringify(payload));
  const result = await syncContentSnapshots({ root, keys: ["telegram"] });
  assert.equal(result.copied, 1);
  assert.deepEqual(JSON.parse(await readFile(join(root, "src", "content", "snapshots", "telegram_posts.json"), "utf8")), payload);
});

test("monthly sync accepts the exporter's tradeoff matrix widget variant", async () => {
  const payload = { ...feature, widget: {
    type: "tradeoff_matrix", heading: "Strategy matrix", description: "", config: {
      question: "Which outcome matters most?",
      options: [{ label: "Fast releases", hint: "", scores: { fast: 9, reliable: 4 } }, { label: "Stable operations", hint: "", scores: { fast: 3, reliable: 9 } }],
      outcomes: [{ id: "fast", title: "Rapid mode", description: "Ship smaller increments." }, { id: "reliable", title: "Reliability mode", description: "Increase test coverage." }],
    },
  } };
  await writeFile(join(root, "assets", "ai_monthly_feature.json"), JSON.stringify(payload));
  const result = await syncContentSnapshots({ root, keys: ["monthlyFeature"] });
  assert.equal(result.copied, 1);
});
