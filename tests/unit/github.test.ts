import assert from "node:assert/strict";
import test from "node:test";
import { createGitHubHandler } from "../../src/lib/server/github";

const repository = {
  id: 123,
  name: "portfolio",
  description: "A personal website",
  html_url: "https://github.com/mrnamazbek/portfolio",
  language: "TypeScript",
  stargazers_count: 10,
  forks_count: 2,
  updated_at: "2026-10-10T00:00:00Z",
  fork: false,
  private: false,
  unused_upstream_field: "must never be serialized",
};

test("public GitHub feed returns selected fields and excludes private repos and forks", async () => {
  const handler = createGitHubHandler({
    fetcher: async () => Response.json([
      repository,
      { ...repository, id: 124, private: true },
      { ...repository, id: 125, fork: true },
    ]),
  });
  const response = await handler(new Request("https://portfolio.example/api/github"));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.source, "github");
  assert.deepEqual(result.repositories, [{
    id: 123,
    name: "portfolio",
    description: "A personal website",
    url: "https://github.com/mrnamazbek/portfolio",
    language: "TypeScript",
    stars: 10,
    forks: 2,
    updatedAt: "2026-10-10T00:00:00Z",
  }]);
  assert.match(response.headers.get("cache-control") ?? "", /s-maxage=300/);
});

test("allowlisted categories use a fixed GitHub upstream with a server-only token and shared cache", async () => {
  let calledUrl = "";
  let calledOptions: RequestInit & { next?: { revalidate: number } } = {};
  const handler = createGitHubHandler({
    environment: { GITHUB_TOKEN: "private-token" },
    fetcher: async (url, options) => {
      calledUrl = String(url);
      calledOptions = options ?? {};
      return Response.json({ items: [repository] });
    },
  });
  const response = await handler(new Request("https://portfolio.example/api/github?category=dataeng"));
  assert.equal(response.status, 200);
  const url = new URL(calledUrl);
  assert.equal(url.origin, "https://api.github.com");
  assert.equal(url.pathname, "/search/repositories");
  assert.equal(url.searchParams.get("q"), "topic:data-engineering");
  assert.equal(new Headers(calledOptions.headers).get("authorization"), "Bearer private-token");
  assert.equal(calledOptions.next?.revalidate, 3_600);
  assert.equal(calledOptions.cache, "force-cache");
  assert.ok(!(await response.text()).includes("private-token"));
});

test("unknown category is rejected without calling GitHub", async () => {
  let called = false;
  const handler = createGitHubHandler({ fetcher: async () => { called = true; return Response.json([]); } });
  const response = await handler(new Request("https://portfolio.example/api/github?category=https://evil.example"));
  assert.equal(response.status, 400);
  assert.equal(called, false);
});

test("upstream failure and invalid upstream links produce 503 without fake repositories", async () => {
  for (const upstream of [
    Response.json({ message: "rate limited" }, { status: 403 }),
    Response.json([{ ...repository, html_url: "javascript:alert(1)" }]),
    Response.json([{ ...repository, html_url: "https://evil.example/repo" }]),
  ]) {
    const handler = createGitHubHandler({ fetcher: async () => upstream, logger: { error() {} } });
    const response = await handler(new Request("https://portfolio.example/api/github"));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("retry-after"), "300");
    const result = await response.json();
    assert.equal(result.ok, false);
    assert.equal(result.repositories, undefined);
  }
});
