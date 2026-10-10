import assert from "node:assert/strict";
import test from "node:test";
import { createContactHandler } from "../../src/lib/server/contact";
import type { ContactMessage, ContactStore } from "../../src/lib/server/contact-store";

const validMessage = {
  name: "  Ada Lovelace  ",
  email: "ADA@EXAMPLE.COM",
  message: "  I would like to discuss a data platform project.  ",
  website: "",
};

function request(payload: unknown = validMessage, headers: Record<string, string> = {}): Request {
  return new Request("https://portfolio.example/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://portfolio.example",
      "Sec-Fetch-Site": "same-origin",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

function setup(options: { rateLimited?: boolean; failingRateLimit?: boolean; failingSave?: boolean } = {}) {
  const saved: ContactMessage[] = [];
  const rateCalls: { key: string; limit: number; window: number }[] = [];
  const logs: unknown[] = [];
  const store: ContactStore = {
    async consumeRateLimit(key, limit, window) {
      rateCalls.push({ key, limit, window });
      if (options.failingRateLimit) throw new Error("secret database error");
      return { allowed: !options.rateLimited, retryAfter: options.rateLimited ? 123 : 0 };
    },
    async saveMessage(message) {
      if (options.failingSave) throw new Error("secret insert error");
      saved.push(message);
    },
  };
  const handler = createContactHandler({
    environment: { CONTACT_RATE_LIMIT_SECRET: "test-server-only-secret", VERCEL: "1" },
    getStore: () => store,
    logger: { error: (...args) => logs.push(args) },
  });
  return { handler, saved, rateCalls, logs };
}

test("persists only normalized fields after two durable rate-limit checks", async () => {
  const { handler, saved, rateCalls } = setup();
  const response = await handler(request(validMessage, { "X-Vercel-Forwarded-For": "203.0.113.10" }));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).ok, true);
  assert.deepEqual(saved, [{
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I would like to discuss a data platform project.",
  }]);
  assert.equal(rateCalls.length, 2);
  assert.deepEqual(rateCalls.map(({ limit, window }) => [limit, window]), [[5, 3_600], [3, 3_600]]);
  assert.match(rateCalls[0].key, /^ip:[a-f0-9]{64}$/);
  assert.match(rateCalls[1].key, /^email:[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(rateCalls).includes("203.0.113.10"));
  assert.ok(!JSON.stringify(rateCalls).includes("ada@example.com"));
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("rejects invalid fields and honeypots before accessing persistence", async () => {
  for (const payload of [
    { ...validMessage, email: "not-an-email" },
    { ...validMessage, name: "A" },
    { ...validMessage, message: "short" },
    { ...validMessage, message: "x".repeat(5_001) },
    { ...validMessage, website: "https://spam.example" },
    { ...validMessage, admin: true },
  ]) {
    const { handler, saved, rateCalls } = setup();
    assert.equal((await handler(request(payload))).status, 400);
    assert.equal(saved.length, 0);
    assert.equal(rateCalls.length, 0);
  }
});

test("rejects missing, foreign, malformed and cross-site origins", async () => {
  for (const origin of ["", "null", "https://evil.example", "https://portfolio.example.evil.example", "https://portfolio.example/path"]) {
    const { handler, saved } = setup();
    assert.equal((await handler(request(validMessage, { Origin: origin }))).status, 403);
    assert.equal(saved.length, 0);
  }
  const { handler } = setup();
  assert.equal((await handler(request(validMessage, { "Sec-Fetch-Site": "cross-site" }))).status, 403);
  const noOrigin = request();
  noOrigin.headers.delete("origin");
  assert.equal((await handler(noOrigin)).status, 403);
});

test("rejects unsupported content types and malformed JSON", async () => {
  const { handler } = setup();
  assert.equal((await handler(request(validMessage, { "Content-Type": "text/plain" }))).status, 415);
  const malformed = new Request("https://portfolio.example/api/contact", {
    method: "POST",
    headers: { Origin: "https://portfolio.example", "Content-Type": "application/json" },
    body: "{bad-json",
  });
  assert.equal((await handler(malformed)).status, 400);
});

test("accepts the browser's actual host when Next normalizes its internal request URL", async () => {
  const { handler, saved } = setup();
  const actualRequest = new Request("http://localhost:4173/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "127.0.0.1:4173",
      Origin: "http://127.0.0.1:4173",
      "Sec-Fetch-Site": "same-origin",
    },
    body: JSON.stringify(validMessage),
  });
  assert.equal((await handler(actualRequest)).status, 201);
  assert.equal(saved.length, 1);
  actualRequest.headers.set("origin", "https://evil.example");
  assert.equal((await handler(actualRequest)).status, 403);
});

test("limits body bytes when Content-Length is absent or understated", async () => {
  for (const headers of [{}, { "Content-Length": "1" }, { "Content-Length": "25000" }]) {
    const { handler, saved } = setup();
    const response = await handler(request({ ...validMessage, message: "x".repeat(25_000) }, headers));
    assert.equal(response.status, 413);
    assert.equal(saved.length, 0);
  }
});

test("returns 429 with Retry-After and never writes when durable limit is reached", async () => {
  const { handler, saved, rateCalls } = setup({ rateLimited: true });
  const response = await handler(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "123");
  assert.equal(rateCalls.length, 1);
  assert.equal(saved.length, 0);
});

test("database and rate-limit failures return 503 without pretending success or logging secrets", async () => {
  for (const options of [{ failingSave: true }, { failingRateLimit: true }]) {
    const { handler, saved, logs } = setup(options);
    const response = await handler(request());
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
    assert.equal(saved.length, 0);
    assert.equal(logs.length, 1);
    assert.ok(!JSON.stringify(logs).includes("secret"));
    assert.ok(!JSON.stringify(logs).includes("ADA@EXAMPLE.COM"));
  }
});

test("unconfigured database and missing rate-limit secret fail closed", async () => {
  const withoutDatabase = createContactHandler({ environment: {}, getStore: () => null });
  assert.equal((await withoutDatabase(request())).status, 503);
  const { saved } = setup();
  const withoutSecret = createContactHandler({
    environment: {},
    getStore: () => ({
      consumeRateLimit: async () => ({ allowed: true, retryAfter: 0 }),
      saveMessage: async (message) => { saved.push(message); },
    }),
  });
  assert.equal((await withoutSecret(request())).status, 503);
  assert.equal(saved.length, 0);
});

test("untrusted non-Vercel forwarded IP headers cannot rotate the shared rate bucket", async () => {
  const keys: string[] = [];
  const handler = createContactHandler({
    environment: { CONTACT_RATE_LIMIT_SECRET: "secret" },
    getStore: () => ({
      async consumeRateLimit(key) {
        keys.push(key);
        return { allowed: true, retryAfter: 0 };
      },
      async saveMessage() {},
    }),
  });
  await handler(request(validMessage, { "X-Forwarded-For": "203.0.113.1" }));
  await handler(request(validMessage, { "X-Forwarded-For": "203.0.113.2" }));
  assert.equal(keys[0], keys[2]);
});
