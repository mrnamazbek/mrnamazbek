import assert from "node:assert/strict";
import test from "node:test";
import { createSignalsHandler } from "../../src/lib/server/signals";

const fx = {
  result: "success", base_code: "USD", time_last_update_unix: 1_791_590_400,
  rates: { USD: 1, KZT: 500, RUB: 100, GBP: 0.8, EUR: 0.9 },
};
const weather = {
  current_units: { temperature_2m: "°C", apparent_temperature: "°C" },
  current: { time: 1_791_626_400, temperature_2m: 12.5, apparent_temperature: 10, weather_code: 3 },
};
const now = () => new Date("2026-10-10T10:05:00Z");
const request = () => new Request("https://portfolio.example/api/signals");

test("currency cross-rates and weather retain actual provider timestamps and fixed cache policies", async () => {
  const calls: Array<{ url: URL; options: RequestInit & { next?: { revalidate: number } } }> = [];
  const response = await createSignalsHandler({ now, fetcher: async (url, options) => {
    const parsedUrl = new URL(String(url));
    calls.push({ url: parsedUrl, options: options ?? {} });
    return Response.json(parsedUrl.hostname === "open.er-api.com" ? fx : weather);
  } })(request());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.fx.rates, { USD: 500, RUB: 5, GBP: 625, EUR: 500 / 0.9 });
  assert.equal(result.fx.updatedAt, new Date(fx.time_last_update_unix * 1_000).toISOString());
  assert.equal(result.fx.sourceUrl, "https://www.exchangerate-api.com");
  assert.equal(result.fetchedAt, now().toISOString());
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.weather.map((item: { city: string }) => item.city), ["Almaty", "Astana", "Shymkent"]);
  assert.equal(result.weather[0].updatedAt, new Date(weather.current.time * 1_000).toISOString());
  assert.equal(result.weather[0].temperatureC, 12.5);
  assert.equal(calls.length, 4);
  const fxCall = calls.find((call) => call.url.hostname === "open.er-api.com")!;
  assert.equal(fxCall.url.href, "https://open.er-api.com/v6/latest/USD");
  assert.equal(fxCall.options.next?.revalidate, 3_600);
  for (const call of calls.filter((item) => item.url.hostname === "api.open-meteo.com")) {
    assert.equal(call.url.pathname, "/v1/forecast");
    assert.equal(call.url.searchParams.get("timeformat"), "unixtime");
    assert.equal(call.url.searchParams.get("timezone"), "UTC");
    assert.equal(call.options.next?.revalidate, 900);
    assert.equal(call.options.cache, "force-cache");
    assert.ok(call.options.signal instanceof AbortSignal);
  }
  assert.match(response.headers.get("cache-control") ?? "", /s-maxage=60/);
});

test("FX failure does not discard successful cities and one city's failure preserves its neighbors", async () => {
  const response = await createSignalsHandler({ now, fetcher: async (url) => {
    const parsedUrl = new URL(String(url));
    if (parsedUrl.hostname === "open.er-api.com" || parsedUrl.searchParams.get("latitude") === "51.1694") {
      throw new Error("network exception containing private provider context");
    }
    return Response.json(weather);
  } })(request());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.fx, null);
  assert.deepEqual(result.weather.map((item: { city: string }) => item.city), ["Almaty", "Shymkent"]);
  assert.deepEqual(result.errors, ["Exchange rates are temporarily unavailable.", "Astana weather is temporarily unavailable."]);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(!JSON.stringify(result).includes("private provider context"));
});

test("weather failure preserves valid currency data instead of fabricated city observations", async () => {
  const response = await createSignalsHandler({ now, fetcher: async (url) => {
    return Response.json(String(url).includes("open.er-api.com") ? fx : { error: true }, { status: String(url).includes("open.er-api.com") ? 200 : 429 });
  } })(request());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.fx.rates.USD, 500);
  assert.deepEqual(result.weather, []);
  assert.equal(result.errors.length, 3);
});

test("invalid units, nonfinite conversion and error payloads fail closed with honest unavailability", async () => {
  for (const invalidFx of [{ ...fx, rates: { ...fx.rates, RUB: 0 } }, { ...fx, result: "error" }, { ...fx, rates: { ...fx.rates, RUB: Number.MIN_VALUE } }]) {
    const response = await createSignalsHandler({ now, fetcher: async (url) => Response.json(
      String(url).includes("open.er-api.com") ? invalidFx : { ...weather, current_units: { temperature_2m: "°F", apparent_temperature: "°F" } },
    ) })(request());
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("retry-after"), "60");
    const result = await response.json();
    assert.equal(result.fx, null);
    assert.deepEqual(result.weather, []);
    assert.equal(result.errors.length, 4);
  }
});

test("caller-supplied locations and upstream URLs never become fetch targets", async () => {
  let fetched = false;
  const response = await createSignalsHandler({ fetcher: async () => { fetched = true; return Response.json({}); } })(
    new Request("https://portfolio.example/api/signals?url=http://169.254.169.254&latitude=0"),
  );
  assert.equal(response.status, 400);
  assert.equal(fetched, false);
});
