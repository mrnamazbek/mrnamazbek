"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import type { GalleryPhoto } from "@/types/gallery";
import styles from "./photo-gallery.module.css";

interface PhotoGalleryProps {
  photos: readonly GalleryPhoto[];
  title?: string;
  intro?: string;
}

/**
 * Original React/native-scroll adaptation of the staggered photo layers in the
 * Awwwards pack's ElasticGridScroll, expanding-image Slider 2, and orbit Slider 25.
 * No demo images, copied scripts, or GSAP dependencies are shipped.
 */
export function PhotoGallery({
  photos,
  title = "Life beyond the editor.",
  intro = "A few moments, places, and people along the way.",
}: PhotoGalleryProps) {
  const headingId = useId();
  const railId = useId();
  const dialogHeadingId = useId();
  const dialogCaptionId = useId();
  const rail = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;
  const selectedPhoto = selectedIndex === null ? undefined : photos[selectedIndex];

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const maximumScroll = element.scrollWidth - element.clientWidth;
      if (maximumScroll <= 1) return;
      if (element.scrollLeft <= 1) {
        setActiveIndex(0);
        return;
      }
      if (element.scrollLeft >= maximumScroll - 1) {
        setActiveIndex(photos.length - 1);
        return;
      }
      const center = element.scrollLeft + element.clientWidth / 2;
      const cards = element.querySelectorAll<HTMLElement>("[data-gallery-card]");
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      cards.forEach((card, index) => {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      setActiveIndex((previous) => previous === nearestIndex ? previous : nearestIndex);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    element.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    return () => {
      element.removeEventListener("scroll", schedule);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [photos.length]);

  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    closeButton.current?.focus();
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = originalOverflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const scrollToPhoto = (index: number) => {
    const element = rail.current;
    const card = element?.querySelectorAll<HTMLElement>("[data-gallery-card]")[index];
    if (!element || !card) return;
    setActiveIndex(index);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({
      left: card.offsetLeft - (element.clientWidth - card.offsetWidth) / 2,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  };

  const moveRail = (direction: -1 | 1) => {
    scrollToPhoto(Math.max(0, Math.min(photos.length - 1, activeIndex + direction)));
  };

  const handleRailKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveRail(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      scrollToPhoto(event.key === "Home" ? 0 : photos.length - 1);
    }
  };

  const openPhoto = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener.current = event.currentTarget;
    setSelectedIndex(index);
  };

  const moveDialog = (direction: -1 | 1) => {
    setSelectedIndex((previous) => previous === null
      ? null
      : (previous + direction + photos.length) % photos.length);
  };

  const handleDialogKeys = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Tab") {
      const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveDialog(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  if (photos.length === 0) return null;

  return (
    <section className={styles.gallery} aria-labelledby={headingId} data-gallery>
      <div className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}><span aria-hidden="true" /> Personal archive</p>
          <h2 id={headingId}>{title}</h2>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
        </div>
        <div className={styles.controls} aria-label="Gallery controls">
          <button type="button" aria-label="Previous photograph" aria-controls={railId} disabled={activeIndex === 0} onClick={() => moveRail(-1)}>
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next photograph" aria-controls={railId} disabled={activeIndex === photos.length - 1} onClick={() => moveRail(1)}>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id={railId} ref={rail} className={styles.rail} role="region" aria-label="Personal photographs. Swipe or use the arrow keys to explore." tabIndex={0} onKeyDown={handleRailKeys}>
        <ol className={styles.filmstrip}>
          {photos.map((photo, index) => (
            <li key={photo.id} className={styles.card} data-gallery-card data-gallery-active={index === activeIndex}>
              <figure className={styles.figure}>
                <a href={photo.src} className={styles.photoLink} aria-label={`Enlarge photograph: ${photo.title}`} aria-haspopup="dialog" onClick={(event) => openPhoto(event, index)}>
                  <div className={styles.imageFrame}>
                    <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 600px) 78vw, (max-width: 1000px) 40vw, 380px" style={{ objectPosition: photo.position ?? "center" }} />
                    <span className={styles.enlarge} aria-hidden="true"><Expand size={17} /></span>
                  </div>
                </a>
                <figcaption className={styles.caption}>
                  <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{photo.title}</h3>{photo.caption ? <p>{photo.caption}</p> : null}</div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.footer}>
        <p className={styles.hint}>Swipe to explore <span aria-hidden="true">↔</span> Select to enlarge</p>
        <p className={styles.counter} aria-live="polite" aria-atomic="true"><span>{String(activeIndex + 1).padStart(2, "0")}</span> / {String(photos.length).padStart(2, "0")}</p>
      </div>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby={dialogHeadingId} aria-describedby={selectedPhoto?.caption ? dialogCaptionId : undefined} onClose={() => setSelectedIndex(null)} onKeyDown={handleDialogKeys} onClick={(event) => {
        if (event.target === event.currentTarget) setSelectedIndex(null);
      }}>
        {selectedPhoto ? (
          <div className={styles.dialogContent}>
            <div className={styles.dialogHeader}>
              <p className={styles.dialogCounter}>{String((selectedIndex ?? 0) + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</p>
              <button ref={closeButton} type="button" className={styles.close} aria-label="Close photograph" onClick={() => setSelectedIndex(null)}><X size={22} aria-hidden="true" /></button>
            </div>
            <div className={styles.dialogImage} key={selectedPhoto.id}>
              <Image src={selectedPhoto.src} alt={selectedPhoto.alt} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) 88vw, 1120px" style={{ objectFit: "contain" }} />
            </div>
            <div className={styles.dialogFooter}>
              <div aria-live="polite" aria-atomic="true"><h3 id={dialogHeadingId}>{selectedPhoto.title}</h3>{selectedPhoto.caption ? <p id={dialogCaptionId}>{selectedPhoto.caption}</p> : null}</div>
              {photos.length > 1 ? <div className={styles.dialogControls}>
                <button type="button" aria-label="View previous photograph" onClick={() => moveDialog(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
                <button type="button" aria-label="View next photograph" onClick={() => moveDialog(1)}><ArrowRight size={20} aria-hidden="true" /></button>
              </div> : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
