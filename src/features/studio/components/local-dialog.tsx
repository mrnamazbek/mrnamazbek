"use client";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import styles from "./studio.module.css";

function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getClientRects().length > 0);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first) {
    event.preventDefault();
    event.currentTarget.focus();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function LocalDialog({
  title,
  children,
  onClose,
  className,
  closeLabel = "Close detail",
  closeOnBackdrop = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
}): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={className ?? styles.dialog}
      aria-labelledby={titleId}
      data-lenis-prevent
      tabIndex={-1}
      onKeyDown={trapDialogFocus}
      onClick={closeOnBackdrop ? (event) => {
        if (event.target !== event.currentTarget) return;
        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect();
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) onClose();
      } : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.controls}>
        <h3 id={titleId}>{title}</h3>
        <button type="button" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
      {children}
    </dialog>
  );
}
