"use client";

import Image from "next/image";
import { ArrowUpRight, CodeXml, MapPin, Send } from "lucide-react";
import {
  useCallback, useEffect, useId, useLayoutEffect, useRef, useState,
  type MouseEvent, type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { socialProfiles, type SocialPlatform } from "@/content/social-profiles";
import styles from "./social-profile-link.module.css";

function LinkedInMark({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><text x="2" y="20" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="24">in</text></svg>;
}

const platformIcons = { github: CodeXml, linkedin: LinkedInMark, telegram: Send };
const EDGE = 12;
const GAP = 10;
const PREVIEW_EVENT = "portfolio:social-profile-preview";

/** A real link with a read-only preview: hover, keyboard focus, or first touch. */
export function SocialProfileLink({
  platform, href, className, children,
}: {
  platform: SocialPlatform;
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const profile = socialProfiles[platform];
  const Icon = platformIcons[platform];
  const id = useId();
  const anchor = useRef<HTMLAnchorElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissed = useRef(false);
  const touchStart = useRef<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [touchPreview, setTouchPreview] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setOpen(false);
    setPosition(null);
  }, [clearTimer]);

  const claimPreview = useCallback(() => {
    document.dispatchEvent(new CustomEvent(PREVIEW_EVENT, { detail: id }));
  }, [id]);

  const show = useCallback(() => {
    clearTimer();
    if (!dismissed.current) {
      claimPreview();
      setOpen(true);
    }
  }, [clearTimer, claimPreview]);

  const leave = () => {
    clearTimer();
    // Keyboard focus keeps the same information available after the mouse leaves.
    if (document.activeElement !== anchor.current) {
      timer.current = setTimeout(close, 160);
    }
  };

  useEffect(() => {
    // A visitor can tab to the server-rendered link before hydration attaches events.
    if (document.activeElement === anchor.current) show();
    return clearTimer;
  }, [clearTimer, show]);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      if (!anchor.current || !card.current) return;
      const trigger = anchor.current.getBoundingClientRect();
      // Focus can arrive before the browser's smooth scroll brings the link into view.
      if ((trigger.bottom < 0 || trigger.top > window.innerHeight) && document.activeElement !== anchor.current) {
        close();
        return;
      }
      const preview = card.current.getBoundingClientRect();
      const below = trigger.bottom + GAP;
      const above = trigger.top - preview.height - GAP;
      const preferred = below + preview.height <= window.innerHeight - EDGE ? below : above;
      const top = Math.max(EDGE, Math.min(preferred, window.innerHeight - preview.height - EDGE));
      const left = Math.max(EDGE, Math.min(
        trigger.left + trigger.width / 2 - preview.width / 2,
        window.innerWidth - preview.width - EDGE,
      ));
      setPosition((previous) => previous?.top === top && previous?.left === left
        ? previous : { top, left });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(schedule);
    observer.observe(card.current!);
    observer.observe(anchor.current!);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissed.current = true;
        close();
      }
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchor.current?.contains(target) && !card.current?.contains(target)) close();
    };
    const anotherPreview = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) close();
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    document.addEventListener(PREVIEW_EVENT, anotherPreview);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener(PREVIEW_EVENT, anotherPreview);
    };
  }, [open, close, id]);

  const click = (event: MouseEvent<HTMLAnchorElement>) => {
    const wasOpen = touchStart.current;
    touchStart.current = null;
    if (wasOpen === false && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      dismissed.current = false;
      setTouchPreview(true);
      show();
    }
  };

  return (
    <>
      <a
        ref={anchor}
        href={href ?? profile.url}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={open ? id : undefined}
        data-social-profile={platform}
        onPointerEnter={(event) => {
          if (event.pointerType === "touch") return;
          dismissed.current = false;
          setTouchPreview(false);
          clearTimer();
          // Close an older focused preview before waiting to reveal this one.
          // Otherwise a scroll can move that card over the newly hovered link,
          // firing pointerleave and cancelling this link's opening timer.
          claimPreview();
          timer.current = setTimeout(show, 140);
        }}
        onPointerLeave={leave}
        onPointerDown={(event) => {
          touchStart.current = event.pointerType === "touch" ? open : null;
        }}
        onPointerCancel={() => { touchStart.current = null; }}
        onFocus={() => {
          dismissed.current = false;
          show();
        }}
        onBlur={() => {
          dismissed.current = false;
          close();
        }}
        onClick={click}
      >
        {children}
      </a>
      {open && createPortal(
        <div
          ref={card}
          id={id}
          role="tooltip"
          aria-label={`${profile.platform} profile preview. ${profile.name}, ${profile.handle}. ${profile.headline} ${profile.description} ${profile.location ?? ""}`}
          className={`${styles.card} ${styles[platform]}`}
          style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? "visible" : "hidden" }}
          onPointerEnter={clearTimer}
          onPointerLeave={leave}
        >
          <div className={styles.cover} aria-hidden="true">
            <span className={styles.brand}><Icon size={15} /> {profile.platform}</span>
            <span className={styles.coverMark}><Icon size={70} strokeWidth={1} /></span>
          </div>
          <div className={styles.body}>
            <div className={styles.avatar} aria-hidden="true">
              {profile.avatar
                ? <Image src={profile.avatar} alt="" width={60} height={60} loading="eager" />
                : <span className={styles.initials}>nb<span>.</span></span>}
            </div>
            <span className={styles.kind}>{platform === "telegram" ? "PUBLIC CHANNEL" : "PROFILE"}</span>
            <p className={styles.name}>{profile.name}</p>
            <p className={styles.handle}>{profile.handle}</p>
            <p className={styles.headline}>{profile.headline}</p>
            <p className={styles.description}>{profile.description}</p>
            {profile.location && <p className={styles.location}><MapPin size={12} aria-hidden="true" />{profile.location}</p>}
            <div className={styles.tags}>{profile.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
          <div className={styles.hint}>
            <span>{touchPreview ? "Tap the link again to open" : `Open on ${profile.platform}`}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
