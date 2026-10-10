"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";

const navigation = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/lab", label: "Lab" },
  { href: "/library", label: "Library" },
];
const subscribeTheme = (listener: () => void) => {
  window.addEventListener("nb-theme-change", listener);
  return () => window.removeEventListener("nb-theme-change", listener);
};
const readTheme = () => document.documentElement.dataset.theme ?? "dark";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nb-theme");
      if (stored === "light") {
        document.documentElement.dataset.theme = stored;
        window.dispatchEvent(new Event("nb-theme-change"));
      }
    } catch {
      /* Storage may be disabled. */
    }
  }, []);
  useEffect(() => {
    if (!open) return;
    const firstLink = drawerRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab") {
        const links = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
        );
        const first = links[0];
        const last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          toggleRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggleRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.dispatchEvent(new Event("nb-theme-change"));
    try {
      localStorage.setItem("nb-theme", next);
    } catch {
      /* Theme still works without storage. */
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Namazbek Bekzhanov home"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            n<span>.</span>
          </span>
          <span className="brand-name">
            NAMAZBEK
            <br />
            BEKZHANOV
          </span>
        </Link>
        <nav className="desktop-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              className={pathname.startsWith(item.href) ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link href="/contact" className="header-contact">
            Let’s talk <ArrowUpRight size={16} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="icon-button mobile-menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div
          id="mobile-navigation"
          ref={drawerRef}
          className="mobile-navigation"
        >
          <nav aria-label="Mobile navigation">
            {navigation.map((item, index) => (
              <Link
                href={item.href}
                key={item.href}
                aria-current={
                  pathname.startsWith(item.href) ? "page" : undefined
                }
                onClick={() => setOpen(false)}
              >
                <span className="mono">0{index + 1}</span>
                {item.label}
                <ArrowUpRight size={19} />
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)}>
              <span className="mono">06</span>Contact
              <ArrowUpRight size={19} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
