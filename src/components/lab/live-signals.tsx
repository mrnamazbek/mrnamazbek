"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CloudSun } from "lucide-react";
import { SectionHeading } from "@/components/ui/page-heading";
import styles from "./live-signals.module.css";

type SignalSnapshot = {
  fx: {
    rates: { USD: number; RUB: number; GBP: number; EUR: number };
    updatedAt: string;
    sourceUrl: string;
  } | null;
  weather: {
    city: string;
    temperatureC: number;
    feelsLikeC: number;
    weatherCode: number;
    updatedAt: string;
  }[];
  errors: string[];
  fetchedAt: string;
};

const currencies = ["USD", "RUB", "GBP", "EUR"] as const;

// WMO interpretation groups published by the Open-Meteo forecast API.
function weatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 97, 99].includes(code)) return "Thunderstorm";
  return `Weather code ${code}`;
}

function displayTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Timestamp unavailable"
    : new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Almaty",
      }).format(date);
}

export function LiveSignals() {
  const [snapshot, setSnapshot] = useState<SignalSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setStatus("error");
      controller.abort();
    }, 15000);
    fetch("/api/signals", { signal: controller.signal })
      .then((response) => {
        // A 503 still carries the source status and a fetch timestamp.
        if (!response.ok && response.status !== 503)
          throw new Error("Signals unavailable");
        return response.json() as Promise<SignalSnapshot>;
      })
      .then((payload) => {
        clearTimeout(timeout);
        setSnapshot(payload);
        setStatus(payload.fx || payload.weather.length > 0 ? "ready" : "error");
      })
      .catch((error: Error) => {
        clearTimeout(timeout);
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <section className="content-section" id="ai-live-signals-root">
      <SectionHeading number="07" title="A view from Kazakhstan">
        <span className="mono muted">RATES & WEATHER</span>
      </SectionHeading>
      {status === "loading" && (
        <p className={styles.status} role="status">
          Loading currency and weather signals…
        </p>
      )}
      {status === "error" && (
        <p className={styles.status} role="status">
          Live signals are unavailable right now. You can still check the
          sources below.
        </p>
      )}
      <div className="signals-grid">
        <article className="signal-panel">
          <p className="eyebrow">FOREIGN CURRENCY → KZT</p>
          <h3>Keeping an eye on the tenge.</h3>
          <p>
            How much one unit of each currency converts to in Kazakhstani tenge.
          </p>
          {snapshot?.fx ? (
            <>
              <dl className={styles.rates}>
                {currencies.map((currency) => (
                  <div key={currency}>
                    <dt>
                      <span className="mono">1 {currency}</span>
                    </dt>
                    <dd>
                      {new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(snapshot.fx!.rates[currency])}
                      <span>KZT</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="tool-footnote">
                Rate timestamp:{" "}
                <time dateTime={snapshot.fx.updatedAt}>
                  {displayTime(snapshot.fx.updatedAt)}
                </time>{" "}
                · Almaty time.
              </p>
            </>
          ) : status !== "loading" ? (
            <p className={styles.unavailable}>
              Exchange rates are temporarily unavailable.
            </p>
          ) : null}
          <a
            href={
              snapshot?.fx?.sourceUrl ?? "https://www.exchangerate-api.com/"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Rates by Exchange Rate API <ArrowUpRight size={15} />
          </a>
        </article>
        <article className="signal-panel">
          <p className="eyebrow">ALMATY / ASTANA / SHYMKENT</p>
          <h3>A little closer to home.</h3>
          <p>Current weather model conditions from Open-Meteo.</p>
          {snapshot?.weather.length ? (
            <div className={styles.weather}>
              {snapshot.weather.map((city) => (
                <div key={city.city}>
                  <div className={styles.weatherCity}>
                    <span>{city.city}</span>
                    <CloudSun size={17} aria-hidden="true" />
                  </div>
                  <div className={styles.temperature}>
                    {city.temperatureC.toFixed(1)}
                    <span>°C</span>
                  </div>
                  <p>
                    {weatherDescription(city.weatherCode)} · Feels like{" "}
                    {city.feelsLikeC.toFixed(1)}°C
                  </p>
                  <p className="tool-footnote">
                    As of{" "}
                    <time dateTime={city.updatedAt}>
                      {displayTime(city.updatedAt)}
                    </time>{" "}
                    · Almaty time.
                  </p>
                </div>
              ))}
            </div>
          ) : status !== "loading" ? (
            <p className={styles.unavailable}>
              Weather data is temporarily unavailable.
            </p>
          ) : null}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Weather by Open-Meteo <ArrowUpRight size={15} />
          </a>
        </article>
      </div>
      {snapshot && (
        <p className="source-note mono">
          Fetched {displayTime(snapshot.fetchedAt)} · Almaty time. Sources are
          cached; timestamps show when each value was recorded.
        </p>
      )}
      {snapshot?.errors.length ? (
        <p className="tool-footnote" role="status">
          {snapshot.errors.join(" ")}
        </p>
      ) : null}
    </section>
  );
}
