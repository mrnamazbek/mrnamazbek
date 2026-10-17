"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Profile } from "@/types/content";
import { chapters } from "../content/story";
import { CustomMagneticCursor } from "../motion/custom-magnetic-cursor";
import { SceneHost } from "../scene/scene-host";
import { ChapterLink } from "./chapter-link";
import styles from "./studio.module.css";

function markNavigation(
  header: HTMLElement,
  section: string | null,
  connect: boolean,
) {
  header
    .querySelectorAll<HTMLAnchorElement>("[data-studio-section]")
    .forEach((link) => {
      if (link.dataset.studioSection === section)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  header
    .querySelectorAll<HTMLAnchorElement>("[data-studio-connect]")
    .forEach((link) => {
      if (connect) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
}
export function StudioShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: Profile;
}): React.JSX.Element {
  const menu = useRef<HTMLDetailsElement>(null);
  const header = useRef<HTMLElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    markNavigation(element, null, pathname === "/studio/connect");
    if (pathname !== "/studio") return;
    const visible = new Set<string>();
    let current: string | null = null;
    let observer: IntersectionObserver | null = null;
    const observeChapters = () => {
      observer?.disconnect();
      visible.clear();
      current = null;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          let next: string | null = null;
          for (const chapter of chapters) {
            if (visible.has(chapter.id)) next = chapter.id;
          }
          if (next === current) return;
          current = next;
          markNavigation(element, next, false);
        },
        {
          // Percentage root margins use viewport width, including vertical ones.
          rootMargin: `-${innerHeight * 0.15}px 0px -${innerHeight * 0.55}px 0px`,
          threshold: 0,
        },
      );
      chapters.forEach((chapter) => {
        const section = document.getElementById(chapter.id);
        if (section) observer?.observe(section);
      });
    };
    // A streamed client story can mount after this persistent layout effect.
    window.addEventListener("studio:story-ready", observeChapters);
    window.addEventListener("resize", observeChapters);
    observeChapters();
    return () => {
      window.removeEventListener("studio:story-ready", observeChapters);
      window.removeEventListener("resize", observeChapters);
      observer?.disconnect();
    };
  }, [pathname]);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <div className={styles.studio}>
      <CustomMagneticCursor />
      <SceneHost />
      <a href="#studio-main" className="skip-link">
        Skip to content
      </a>
      <header ref={header} className={styles.header}>
        <Link
          href="/studio"
          className={styles.brand}
          data-studio-section="studio-author"
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
            <ChapterLink key={c.id} chapter={c.id} data-studio-section={c.id}>
              {c.label}
            </ChapterLink>
          ))}
          <Link
            href="/studio/connect"
            data-studio-connect
            aria-current={pathname === "/studio/connect" ? "page" : undefined}
          >
            Let’s talk ↗
          </Link>
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
              <ChapterLink
                key={c.id}
                chapter={c.id}
                onClick={close}
                data-studio-section={c.id}
              >
                {c.label}
              </ChapterLink>
            ))}
            <Link
              href="/studio/connect"
              onClick={close}
              data-studio-connect
              aria-current={pathname === "/studio/connect" ? "page" : undefined}
            >
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
