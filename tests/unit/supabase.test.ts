import assert from "node:assert/strict";
import test from "node:test";
import {
  createSupabaseAdminClient,
  createSupabaseContentClient,
} from "../../src/lib/supabase/server";
import { createSupabaseContactStore } from "../../src/lib/server/contact-store";

const modernEnvironment = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SECRET_KEY: "test-only-server-credential",
  SUPABASE_PUBLISHABLE_KEY: "test-only-publishable-key",
};

test("server clients require a valid API URL and their own key, with legacy aliases supported", () => {
  assert.equal(createSupabaseAdminClient({}), null);
  assert.equal(createSupabaseContentClient({}), null);
  assert.equal(createSupabaseAdminClient({ SUPABASE_URL: modernEnvironment.SUPABASE_URL }), null);
  assert.equal(createSupabaseContentClient({
    SUPABASE_URL: modernEnvironment.SUPABASE_URL,
    SUPABASE_SECRET_KEY: modernEnvironment.SUPABASE_SECRET_KEY,
  }), null);
  for (const url of ["not-a-url", "http://untrusted.example", "ftp://project.supabase.co", "https://user:secret@project.supabase.co", "https://project.supabase.co?secret=value"]) {
    assert.equal(createSupabaseAdminClient({ ...modernEnvironment, SUPABASE_URL: url }), null);
  }
  assert.ok(createSupabaseAdminClient(modernEnvironment));
  assert.ok(createSupabaseContentClient(modernEnvironment));
  assert.ok(createSupabaseAdminClient({ SUPABASE_URL: "http://127.0.0.1:54321", SUPABASE_SERVICE_ROLE_KEY: "legacy-test-key" }));
  assert.ok(createSupabaseContentClient({ SUPABASE_URL: modernEnvironment.SUPABASE_URL, SUPABASE_ANON_KEY: "legacy-test-key" }));
});

test("contact adapter sends the exact durable RPC and private insert contract without caching", async (context) => {
  const calls: { url: string; options: RequestInit }[] = [];
  context.mock.method(globalThis, "fetch", async (url: RequestInfo | URL, options?: RequestInit) => {
    calls.push({ url: String(url), options: options ?? {} });
    return String(url).includes("/rpc/")
      ? Response.json([{ allowed: true, retry_after: 0 }])
      : new Response(null, { status: 201 });
  });
  const store = createSupabaseContactStore(modernEnvironment);
  assert.ok(store);
  assert.deepEqual(await store.consumeRateLimit(`ip:${"a".repeat(64)}`, 5, 3_600), { allowed: true, retryAfter: 0 });
  await store.saveMessage({ name: "Ada Lovelace", email: "ada@example.com", message: "Please contact me about this project." });
  assert.equal(calls.length, 2);
  assert.equal(new URL(calls[0].url).pathname, "/rest/v1/rpc/consume_contact_rate_limit");
  assert.deepEqual(JSON.parse(String(calls[0].options.body)), { p_key: `ip:${"a".repeat(64)}`, p_limit: 5, p_window_seconds: 3_600 });
  assert.equal(new URL(calls[1].url).pathname, "/rest/v1/contact_messages");
  assert.deepEqual(JSON.parse(String(calls[1].options.body)), { name: "Ada Lovelace", email: "ada@example.com", message: "Please contact me about this project." });
  for (const call of calls) {
    assert.equal(call.options.method, "POST");
    assert.equal(call.options.cache, "no-store");
    assert.ok(call.options.signal);
    assert.equal(new Headers(call.options.headers).get("apikey"), modernEnvironment.SUPABASE_SECRET_KEY);
  }
});

test("contact adapter refuses invalid RPC responses and failed private inserts", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: RequestInfo | URL) =>
    String(url).includes("/rpc/")
      ? Response.json({ allowed: true })
      : Response.json({ code: "42501", message: "permission denied" }, { status: 403 }),
  );
  const store = createSupabaseContactStore(modernEnvironment);
  assert.ok(store);
  await assert.rejects(store.consumeRateLimit(`ip:${"a".repeat(64)}`, 5, 3_600), /invalid data/);
  await assert.rejects(store.saveMessage({ name: "Ada", email: "ada@example.com", message: "Please contact me." }), /persistence unavailable/);
});

test("content reads use only the publishable key", async (context) => {
  let usedKey: string | null = null;
  context.mock.method(globalThis, "fetch", async (_url: RequestInfo | URL, options?: RequestInit) => {
    usedKey = new Headers(options?.headers).get("apikey");
    return Response.json([]);
  });
  const client = createSupabaseContentClient(modernEnvironment);
  assert.ok(client);
  const result = await client.from("projects").select("name").eq("published", true);
  assert.equal(result.error, null);
  assert.equal(usedKey, modernEnvironment.SUPABASE_PUBLISHABLE_KEY);
});

test("failed mutations are attempted once so messages and throttle consumption cannot duplicate", async (context) => {
  let calls = 0;
  context.mock.method(globalThis, "fetch", async () => {
    calls++;
    return Response.json({ code: "503", message: "Unavailable" }, { status: 503 });
  });
  const store = createSupabaseContactStore(modernEnvironment);
  assert.ok(store);
  await assert.rejects(store.consumeRateLimit(`ip:${"a".repeat(64)}`, 5, 3_600), /limiter unavailable/);
  assert.equal(calls, 1);
  await assert.rejects(store.saveMessage({ name: "Ada", email: "ada@example.com", message: "Please contact me." }), /persistence unavailable/);
  assert.equal(calls, 2);
});
