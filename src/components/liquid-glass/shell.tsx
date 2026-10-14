"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SocialProfileLink } from "@/components/ui/social-profile-link";
import { GlassSurface } from "./surface";
import styles from "./shell.module.css";

const THEME_KEY = "nb-glass-theme";
const THEME_EVENT = "nb-glass-theme-change";
type GlassTheme = "light" | "dark";
const navigation = [
  { href: "/v2/about", label: "About" },
  { href: "/v2/projects", label: "Projects" },
  { href: "/v2/writing", label: "Writing" },
  { href: "/v2/gallery", label: "Gallery" },
  { href: "/v2/lab", label: "Lab" },
  { href: "/v2/library", label: "Library" },
  { href: "/v2/contact", label: "Contact" },
];
let memoryTheme: GlassTheme = "light";
const subscribeHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

function readTheme(): GlassTheme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch { /* The in-memory choice still works when storage is disabled. */ }
  return memoryTheme;
}

function subscribeTheme(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_KEY || event.key === null) listener();
  };
  window.addEventListener(THEME_EVENT, listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function setTheme(theme: GlassTheme) {
  memoryTheme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* Optional persistence. */ }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function GlassShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light");
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
  const [menuOpen, setMenuOpen] = useState(false);
  const disclosureRef = useRef<HTMLDetailsElement>(null);
  const menuTriggerRef = useRef<HTMLElement>(null);

  const closeMenu = () => {
    if (disclosureRef.current) disclosureRef.current.open = false;
    setMenuOpen(false);
  };

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !disclosureRef.current?.contains(event.target)) {
        if (disclosureRef.current) disclosureRef.current.open = false;
      }
    };
    const breakpoint = window.matchMedia("(min-width: 1081px)");
    const closeOnDesktop = () => {
      if (breakpoint.matches && disclosureRef.current) disclosureRef.current.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && disclosureRef.current?.open) {
        disclosureRef.current.open = false;
        menuTriggerRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape);
    breakpoint.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape);
      breakpoint.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  return (
    <div className={styles.root} data-portfolio-version="liquid-glass" data-glass-theme={theme}>
      <div className={styles.atmosphere} aria-hidden="true" />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={styles.header}>
        <GlassSurface className={styles.navSurface} optics>
          <Link href="/v2" className={styles.brand} aria-label="Namazbek Bekzhanov home" onClick={closeMenu}>
            <span className={styles.brandMark} aria-hidden="true">n<span>.</span></span>
            <span className={styles.brandName}>Namazbek<span>Bekzhanov</span></span>
          </Link>
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {navigation.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>{label}</Link>
            ))}
          </nav>
          <div className={styles.actions}>
            <a href={pathname === "/v2" ? "/" : pathname.replace(/^\/v2/, "")} className={styles.classicLink}>Classic</a>
            <button
              type="button"
              disabled={!hydrated}
              className={styles.iconButton}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </button>
            <details
              ref={disclosureRef}
              className={styles.mobileDisclosure}
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setMenuOpen(open);
                if (open) event.currentTarget.querySelector<HTMLAnchorElement>("nav a")?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" && disclosureRef.current?.open) {
                  event.preventDefault();
                  closeMenu();
                  menuTriggerRef.current?.focus();
                }
              }}
            >
              <summary ref={menuTriggerRef} role="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-controls="glass-mobile-navigation">
                {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </summary>
              <GlassSurface className={styles.mobilePanel}>
                <nav id="glass-mobile-navigation" aria-label="Mobile navigation">
                  {navigation.map(({ href, label }) => (
                    <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined} onClick={closeMenu}>
                      {label}<ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Editions reset document-scoped theme and rendering state. */}
                  <a href="/" className={styles.mobileClassic} onClick={closeMenu}>Classic version<ArrowUpRight size={17} aria-hidden="true" /></a>
                </nav>
              </GlassSurface>
            </details>
          </div>
        </GlassSurface>
      </header>
      <main id="main-content" className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Link href="/v2/contact" className={styles.footerInvitation}>Let’s build something useful.<ArrowUpRight size={22} aria-hidden="true" /></Link>
          <div className={styles.socialLinks}>
            <SocialProfileLink platform="github">GitHub<ArrowUpRight size={14} aria-hidden="true" /></SocialProfileLink>
            <SocialProfileLink platform="linkedin">LinkedIn<ArrowUpRight size={14} aria-hidden="true" /></SocialProfileLink>
            <SocialProfileLink platform="telegram">Telegram<ArrowUpRight size={14} aria-hidden="true" /></SocialProfileLink>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getUTCFullYear()} Namazbek Bekzhanov</span>
          <span>Almaty, Kazakhstan</span>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Editions reset document-scoped theme and rendering state. */}
          <a href="/">Explore the classic version<ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
}
