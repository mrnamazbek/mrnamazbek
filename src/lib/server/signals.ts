import "server-only";

import { z } from "zod";
import { jsonResponse } from "./http";

const fxUrl = "https://open.er-api.com/v6/latest/USD";
const cities = [
  { name: "Almaty", latitude: 43.238949, longitude: 76.889709 },
  { name: "Astana", latitude: 51.1694, longitude: 71.4491 },
  { name: "Shymkent", latitude: 42.3417, longitude: 69.5901 },
] as const;

const timestamp = z.number().int().positive().max(253_402_300_799);
const rate = z.number().positive().max(1_000_000_000);
const fxSchema = z.object({
  result: z.literal("success"),
  base_code: z.literal("USD"),
  time_last_update_unix: timestamp,
  rates: z.object({ USD: z.literal(1), KZT: rate, RUB: rate, GBP: rate, EUR: rate }),
});
const weatherSchema = z.object({
  current_units: z.object({
    temperature_2m: z.literal("°C"),
    apparent_temperature: z.literal("°C"),
  }),
  current: z.object({
    time: timestamp,
    temperature_2m: z.number().min(-100).max(100),
    apparent_temperature: z.number().min(-150).max(150),
    weather_code: z.number().int().min(0).max(99),
  }),
});

interface SignalsHandlerDependencies {
  fetcher?: typeof fetch;
  now?: () => Date;
}

/** Only the site's original cities and providers can be requested. */
export function createSignalsHandler(dependencies: SignalsHandlerDependencies = {}) {
  const fetcher = dependencies.fetcher ?? fetch;

  async function fetchData(url: string, revalidate: number): Promise<unknown> {
    const options: RequestInit & { next: { revalidate: number } } = {
      headers: { Accept: "application/json" },
      cache: "force-cache",
      next: { revalidate },
      signal: AbortSignal.timeout(8_000),
    };
    const response = await fetcher(url, options);
    if (!response.ok) throw new Error("Signals provider unavailable");
    return response.json();
  }

  return async function handleSignals(request: Request): Promise<Response> {
    if (new URL(request.url).search) {
      return jsonResponse({ error: "This endpoint does not accept custom locations or providers." }, 400);
    }

    // A single unavailable provider must not discard successful independent data.
    const [fxResult, ...weatherResults] = await Promise.allSettled([
      (async () => {
        const data = fxSchema.parse(await fetchData(fxUrl, 3_600));
        const { KZT, RUB, GBP, EUR } = data.rates;
        const rates = { USD: KZT, RUB: KZT / RUB, GBP: KZT / GBP, EUR: KZT / EUR };
        if (Object.values(rates).some((value) => !Number.isFinite(value) || value <= 0)) {
          throw new Error("Invalid converted currency rates");
        }
        return {
          rates,
          updatedAt: new Date(data.time_last_update_unix * 1_000).toISOString(),
          sourceUrl: "https://www.exchangerate-api.com",
        };
      })(),
      ...cities.map(async (city) => {
        const params = new URLSearchParams({
          latitude: String(city.latitude),
          longitude: String(city.longitude),
          current: "temperature_2m,apparent_temperature,weather_code",
          temperature_unit: "celsius",
          timezone: "UTC",
          timeformat: "unixtime",
        });
        const data = weatherSchema.parse(await fetchData(`https://api.open-meteo.com/v1/forecast?${params}`, 900));
        return {
          city: city.name,
          temperatureC: data.current.temperature_2m,
          feelsLikeC: data.current.apparent_temperature,
          weatherCode: data.current.weather_code,
          updatedAt: new Date(data.current.time * 1_000).toISOString(),
        };
      }),
    ] as const);

    const errors: string[] = [];
    const fx = fxResult.status === "fulfilled" ? fxResult.value : null;
    if (!fx) errors.push("Exchange rates are temporarily unavailable.");
    const weather = weatherResults.flatMap((result, index) => {
      if (result.status === "fulfilled") return [result.value];
      errors.push(`${cities[index].name} weather is temporarily unavailable.`);
      return [];
    });
    const payload = { fx, weather, errors, fetchedAt: (dependencies.now ?? (() => new Date()))().toISOString() };
    if (!fx && weather.length === 0) return jsonResponse(payload, 503, { "Retry-After": "60" });
    if (errors.length) return jsonResponse(payload);
    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
}
