"use client";

import { useEffect, useState } from "react";

const zones = [
  { name: "Almaty", zone: "Asia/Almaty", label: "Home base" },
  { name: "London", zone: "Europe/London", label: "Europe" },
  { name: "New York", zone: "America/New_York", label: "East coast" },
  { name: "Singapore", zone: "Asia/Singapore", label: "Asia Pacific" },
];
export function WorldClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="tool-panel">
      <div className="tool-heading">
        <p className="eyebrow">04 / SAME MOMENT, DIFFERENT PLACES</p>
        <h2>World clock</h2>
        <p>Working across time zones? Here’s where everyone’s day is.</p>
      </div>
      <div className="clock-grid">
        {zones.map((item) => (
          <article key={item.zone}>
            <div className="card-topline">
              <span className="eyebrow">{item.name}</span>
              <span className="mono">{item.label}</span>
            </div>
            <time>
              {now
                ? now.toLocaleTimeString("en-GB", {
                    timeZone: item.zone,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })
                : "—:—:—"}
            </time>
            <p className="mono">
              {now
                ? now.toLocaleDateString("en-GB", {
                    timeZone: item.zone,
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : item.zone}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CostEstimator() {
  const [cpu, setCpu] = useState(4);
  const [ram, setRam] = useState(16);
  const [storage, setStorage] = useState(250);
  const [cpuRate, setCpuRate] = useState(15);
  const [ramRate, setRamRate] = useState(5);
  const [storageRate, setStorageRate] = useState(0.1);
  const [exchange, setExchange] = useState(500);
  const [currency, setCurrency] = useState("USD");
  const values = [cpu * cpuRate, ram * ramRate, storage * storageRate];
  const total = values.reduce((sum, item) => sum + item, 0);
  const multiplier = currency === "KZT" ? exchange : 1;
  return (
    <div className="tool-panel">
      <div className="tool-heading">
        <p className="eyebrow">03 / A LITTLE CAPACITY PLANNING</p>
        <h2>Infrastructure cost estimator</h2>
        <p>
          Build a rough monthly budget with your own unit prices. These are
          illustrative assumptions, not provider quotes.
        </p>
      </div>
      <div className="tool-two-columns">
        <div>
          <div className="range-field">
            <label htmlFor="cost-cpu">
              Compute <span>{cpu} vCPU</span>
            </label>
            <input
              id="cost-cpu"
              type="range"
              min={1}
              max={64}
              value={cpu}
              onChange={(event) => setCpu(Number(event.target.value))}
            />
          </div>
          <div className="range-field">
            <label htmlFor="cost-ram">
              Memory <span>{ram} GB</span>
            </label>
            <input
              id="cost-ram"
              type="range"
              min={1}
              max={256}
              value={ram}
              onChange={(event) => setRam(Number(event.target.value))}
            />
          </div>
          <div className="range-field">
            <label htmlFor="cost-storage">
              Storage <span>{storage} GB</span>
            </label>
            <input
              id="cost-storage"
              type="range"
              min={10}
              max={5000}
              step={10}
              value={storage}
              onChange={(event) => setStorage(Number(event.target.value))}
            />
          </div>
          <details className="cost-assumptions">
            <summary>
              Adjust the assumptions <span>+</span>
            </summary>
            <div className="field-grid">
              {[
                ["Compute / vCPU / month", cpuRate, setCpuRate],
                ["Memory / GB / month", ramRate, setRamRate],
                ["Storage / GB / month", storageRate, setStorageRate],
                ["KZT per USD", exchange, setExchange],
              ].map(([label, value, setter], index) => (
                <div className="field" key={String(label)}>
                  <label htmlFor={`cost-rate-${index}`}>{String(label)}</label>
                  <input
                    id={`cost-rate-${index}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number(value)}
                    onChange={(event) =>
                      (setter as (value: number) => void)(
                        Math.max(0, Number(event.target.value)),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </details>
        </div>
        <div className="cost-result">
          <div className="card-topline">
            <span className="eyebrow">ESTIMATED MONTHLY TOTAL</span>
            <button
              type="button"
              className="small-button"
              onClick={() =>
                setCurrency((value) => (value === "USD" ? "KZT" : "USD"))
              }
            >
              {currency} ↔
            </button>
          </div>
          <div className="cost-total" role="status">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }).format(total * multiplier)}
            <span>/ month</span>
          </div>
          <div className="cost-breakdown">
            {["Compute", "Memory", "Storage"].map((label, index) => (
              <div key={label}>
                <span>{label}</span>
                <div>
                  <i
                    style={{
                      width: `${total > 0 ? (values[index] / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>
                  {(values[index] * multiplier).toFixed(
                    currency === "USD" ? 2 : 0,
                  )}
                </strong>
              </div>
            ))}
          </div>
          <p className="tool-footnote">
            Taxes, network egress, backups, and managed-service fees are
            excluded. KZT uses your editable exchange-rate assumption (
            {exchange} KZT/USD).
          </p>
        </div>
      </div>
    </div>
  );
}
