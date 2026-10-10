import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { DynamicServerError } from "next/dist/client/components/hooks-server-context";
import { getAudience, getPostBySlug, getPosts, getProfile, getSiteContent } from "../../src/lib/content";
import { localContent } from "../../src/lib/content/local";
import { projectSchema } from "../../src/lib/content/schemas";

const originalFetch = globalThis.fetch;
const originalEnvironment = { ...process.env };

beforeEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_PUBLISHABLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnvironment };
});

function configureReadClient(): void {
  process.env.SUPABASE_URL = "https://portfolio-test.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
}

test("unconfigured site preserves migrated content and honestly reports its local source", async () => {
  const content = await getSiteContent();
  assert.equal(content.source, "local");
  assert.equal(content.profile.name, "Namazbek Bekzhanov");
  assert.equal(content.experience.length, 6);
  assert.equal(content.education.find((item) => item.id === "tum-ambition")?.status, "planned");
  assert.equal(content.certifications.length, 11);
  assert.equal(content.books.length, 6);
  assert.equal(content.posts.length, 3);
  assert.equal(content.projects.length, 24);
  assert.equal(content.audience.series.length, 6);
  assert.equal(content.audience.series[0].points.length, 24);
  assert.equal(content.telegram.posts.length, 0);
  assert.ok(content.audience.methodology.includes("not unique active users"));
  assert.equal(content.monthlyFeature.month, "2026-09");
  assert.ok(Object.values(content.sources).every((source) => source === "local"));
});

test("successful empty published collection is respected", async () => {
  configureReadClient();
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, "/rest/v1/posts");
    assert.equal(url.searchParams.get("published"), "eq.true");
    assert.ok(!url.searchParams.get("select")?.includes("*"));
    return new Response("[]", { headers: { "content-type": "application/json" } });
  };
  assert.deepEqual(await getPosts(), []);
});

test("invalid database content falls back to validated articles", async () => {
  configureReadClient();
  globalThis.fetch = async () => new Response('[{"slug":"broken"}]', {
    headers: { "content-type": "application/json" },
  });
  const posts = await getPosts();
  assert.equal(posts.length, 3);
  assert.ok(posts.every((post) => post.body.length > 1000));
});

test("database failure falls back and unknown article slugs return null", async () => {
  configureReadClient();
  globalThis.fetch = async () => new Response('{"message":"Unavailable","code":"503"}', {
    status: 503, headers: { "content-type": "application/json" },
  });
  assert.equal((await getPosts()).length, 3);
  assert.equal(await getPostBySlug("missing-post"), null);
});

test("project links reject executable protocols", () => {
  assert.equal(projectSchema.safeParse({ ...localContent.projects[0], url: "javascript:alert(1)" }).success, false);
});

test("Next dynamic rendering signals escape collection, profile, and snapshot fallback", async () => {
  configureReadClient();
  const bailout = new DynamicServerError("Content requires request-time rendering");
  globalThis.fetch = async () => { throw bailout; };
  await assert.rejects(getPosts(), (error) => error === bailout);
  await assert.rejects(getProfile(), (error) => error === bailout);
  await assert.rejects(getAudience(), (error) => error === bailout);
});

test("ordinary thrown network failures still use local content", async () => {
  configureReadClient();
  globalThis.fetch = async () => { throw new Error("Connection unavailable"); };
  assert.equal((await getPosts()).length, 3);
});
