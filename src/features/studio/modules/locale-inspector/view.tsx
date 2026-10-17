"use client";
import { useState } from "react";
import type { ModuleViewProps } from "../types";
import {
  getLocaleCard,
  parseDemoLocale,
  type DemoLocale,
  type LocaleCard,
} from "./domain";
import styles from "../../components/studio.module.css";
import bench from "../../components/workbench.module.css";

const languages: readonly { id: DemoLocale; label: string }[] = [
  { id: "en", label: "English · en" },
  { id: "ru", label: "Русский · ru" },
  { id: "kk", label: "Қазақша · kk" },
];
export default function LocaleInspectorView({
  definition,
}: ModuleViewProps): React.JSX.Element {
  const [locale, setLocale] = useState<DemoLocale>("en");
  const [missing, setMissing] = useState<keyof LocaleCard | undefined>();
  const { card, fallbackKeys } = getLocaleCard(locale, missing);
  return (
    <section
      className={styles.workbench}
      aria-label={`${definition.title} workbench`}
    >
      <div className={bench.heading}>
        <div>
          <span className={styles.eyebrow}>05 / SEEDED DEMO</span>
          <h2>One contract. Three local voices.</h2>
        </div>
        <span className={styles.badge}>Card language only</span>
      </div>
      <p>
        Choose a language, then remove one key to inspect its English fallback.
        The rest of the card keeps the selected language.
      </p>
      <div className={bench.tabs} role="group" aria-label="Sample language">
        {languages.map((language) => (
          <button
            key={language.id}
            type="button"
            aria-pressed={locale === language.id}
            onClick={() => setLocale(parseDemoLocale(language.id))}
          >
            {language.label}
          </button>
        ))}
      </div>
      <div className={styles.controls}>
        <label>
          Missing key fixture
          <select
            value={missing ?? "none"}
            onChange={(event) =>
              setMissing(
                event.target.value === "none"
                  ? undefined
                  : (event.target.value as keyof LocaleCard),
              )
            }
          >
            <option value="none">All keys present</option>
            <option value="title">Missing title</option>
            <option value="description">Missing description</option>
            <option value="action">Missing action</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setLocale("en");
            setMissing(undefined);
          }}
        >
          Reset demo
        </button>
      </div>
      <div className={bench.split}>
        <section
          className={bench.inspector}
          data-locale-card
          lang={locale}
          aria-label="Translated sample card"
        >
          <span className={styles.eyebrow}>Aa / {locale}</span>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <dl className={bench.facts}>
            <div>
              <dt>Action label</dt>
              <dd>{card.action}</dd>
            </div>
          </dl>
        </section>
        <aside className={styles.panel}>
          <span className={styles.eyebrow}>INSPECTOR / LOCAL OUTPUT</span>
          <h3>Metadata follows the same contract.</h3>
          <pre
            className={styles.mono}
            style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
          >
            {JSON.stringify(
              {
                lang: locale,
                title: card.title,
                description: card.description,
              },
              null,
              2,
            )}
          </pre>
          <p className={styles.caption}>
            This output describes the sample. The page title, address and
            document language remain English.
          </p>
        </aside>
      </div>
      <p role="status" className={styles.status}>
        {fallbackKeys.length
          ? `${fallbackKeys.join(", ")} → English fallback`
          : "All three keys are present in the selected language."}
      </p>
      <p className={styles.caption}>
        Language tags matter: the source route token was <code>kz</code>; Kazakh
        text uses <code>kk</code>. This inspector changes only the nested card.
      </p>
    </section>
  );
}
