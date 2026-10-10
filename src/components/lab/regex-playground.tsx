"use client";

import { useEffect, useState } from "react";

type Match = { text: string; index: number };
const workerSource = `self.onmessage = function(event) {
  try {
    const { pattern, flags, text } = event.data;
    const regex = new RegExp(pattern, flags);
    const matches = []; let match;
    while ((match = regex.exec(text)) !== null && matches.length < 500) {
      matches.push({ text: match[0], index: match.index });
      if (!regex.global) break;
      if (match[0] === '') regex.lastIndex++;
    }
    self.postMessage({ matches });
  } catch (error) { self.postMessage({ error: error.message }); }
};`;
const presets = {
  Email: "[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}",
  Number: "\\b\\d+(?:\\.\\d+)?\\b",
  URL: "https?://[^\\s]+",
  UUID: "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
};

export function RegexPlayground() {
  const [pattern, setPattern] = useState(presets.Email);
  const [text, setText] = useState(
    "Let’s talk: namazbekzhan@gmail.com\nOr visit https://github.com/mrnamazbek",
  );
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let worker: Worker | undefined;
    let workerUrl = "";
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounce = setTimeout(() => {
      if (!pattern) {
        setMatches([]);
        setError("");
        return;
      }
      try {
        workerUrl = URL.createObjectURL(
          new Blob([workerSource], { type: "text/javascript" }),
        );
        worker = new Worker(workerUrl);
        timeout = setTimeout(() => {
          worker?.terminate();
          setMatches([]);
          setError(
            "This pattern took too long to evaluate. Try a simpler expression.",
          );
        }, 500);
        worker.onmessage = (
          event: MessageEvent<{ matches?: Match[]; error?: string }>,
        ) => {
          clearTimeout(timeout);
          setMatches(event.data.matches ?? []);
          setError(event.data.error ?? "");
          worker?.terminate();
        };
        worker.onerror = () => {
          clearTimeout(timeout);
          setMatches([]);
          setError("The playground couldn’t start. Please try again.");
          worker?.terminate();
        };
        worker.postMessage({ pattern, flags, text });
      } catch {
        clearTimeout(timeout);
        setError("Regex workers are unavailable in this browser.");
      }
    }, 180);
    return () => {
      clearTimeout(debounce);
      clearTimeout(timeout);
      worker?.terminate();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
    };
  }, [pattern, text, flags]);
  return (
    <div className="tool-panel">
      <div className="tool-heading">
        <p className="eyebrow">01 / PATTERN MATCHING</p>
        <h2>Regex playground</h2>
        <p>
          Test JavaScript expressions locally. Your text stays in this browser.
        </p>
      </div>
      <div className="tool-two-columns">
        <div>
          <div className="field">
            <label htmlFor="regex-pattern">Regular expression</label>
            <input
              id="regex-pattern"
              className="code-input"
              value={pattern}
              maxLength={300}
              onChange={(event) => setPattern(event.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="flag-controls">
            {[
              ["g", "Global"],
              ["i", "Ignore case"],
              ["m", "Multiline"],
            ].map(([flag, label]) => (
              <label key={flag}>
                <input
                  type="checkbox"
                  checked={flags.includes(flag)}
                  onChange={() =>
                    setFlags((value) =>
                      value.includes(flag)
                        ? value.replace(flag, "")
                        : `${value}${flag}`,
                    )
                  }
                />
                {label} <span className="mono">{flag}</span>
              </label>
            ))}
          </div>
          <div className="preset-buttons">
            {Object.entries(presets).map(([name, expression]) => (
              <button
                type="button"
                key={name}
                onClick={() => setPattern(expression)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="regex-text">Test string</label>
            <textarea
              id="regex-text"
              value={text}
              rows={5}
              maxLength={10000}
              onChange={(event) => setText(event.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
        <div className="regex-results">
          <p className="eyebrow" role="status">
            {error
              ? "INVALID EXPRESSION"
              : `${matches.length}${matches.length === 500 ? "+" : ""} MATCHES`}
          </p>
          {error ? (
            <p className="error-text">{error}</p>
          ) : matches.length ? (
            <ol>
              {matches.map((match, index) => (
                <li key={`${index}-${match.index}`}>
                  <code>{match.text || "(empty match)"}</code>
                  <span className="mono">at {match.index}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">
              No matches yet. Try a different expression or test string.
            </p>
          )}
          <p className="tool-footnote">
            Evaluation runs in a separate worker with a 500 ms limit and up to
            500 displayed matches.
          </p>
        </div>
      </div>
    </div>
  );
}
