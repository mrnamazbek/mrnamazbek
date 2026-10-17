"use client";
import Link from "next/link";
import { useRef } from "react";
import type { Profile } from "@/types/content";
import { chapters } from "../content/story";
import { CustomMagneticCursor } from "../motion/custom-magnetic-cursor";
import styles from "./studio.module.css";
export function StudioShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: Profile;
}): React.JSX.Element {
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <div className={styles.studio}>
      <CustomMagneticCursor />
      <a href="#studio-main" className="skip-link">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link
          href="/studio"
          className={styles.brand}
          aria-label={`${profile.name} — Engineering Lab`}
        >
          <span className={styles.mark} aria-hidden="true">
            nb.
          </span>
          <span>
            FOUNDER’S
            <br />
            ENGINEERING LAB
          </span>
        </Link>
        <nav
          className={`${styles.nav} ${styles.desktopNav}`}
          aria-label="Studio navigation"
        >
          {chapters.slice(1).map((c) => (
            <a key={c.id} href={`/studio#${c.id}`}>
              {c.label}
            </a>
          ))}
          <Link href="/studio/connect">Let’s talk ↗</Link>
        </nav>
        <details
          ref={menu}
          className={styles.navigationDisclosure}
          onKeyDown={(event) => {
            if (event.key === "Escape" && menu.current) {
              menu.current.open = false;
              menu.current.querySelector("summary")?.focus();
            }
          }}
        >
          <summary
            className={styles.menu}
            aria-label="Navigation"
            role="button"
            aria-controls="studio-navigation"
          >
            Menu +
          </summary>
          <nav
            id="studio-navigation"
            className={styles.nav}
            aria-label="Mobile Studio navigation"
          >
            {chapters.slice(1).map((c) => (
              <a key={c.id} href={`/studio#${c.id}`} onClick={close}>
                {c.label}
              </a>
            ))}
            <Link href="/studio/connect" onClick={close}>
              Let’s talk ↗
            </Link>
          </nav>
        </details>
      </header>
      <main id="studio-main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <span>
          {profile.name} · {profile.location}
        </span>
        <span>Personal experiments. Explicit boundaries.</span>
        <Link href="/">Classic portfolio</Link>
        <Link href="/v2">V2 portfolio</Link>
      </footer>
    </div>
  );
}
