"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import "lenis/dist/lenis.css";

const desktopMotion = "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const nativeRegions = "dialog, input, textarea, select, [contenteditable], [data-gallery], [data-lenis-prevent]";
const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"]);

/** Smooth desktop wheel gestures without owning navigation, focus, or touch. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const capability = window.matchMedia(desktopMotion);
    let lenis: Lenis | undefined;
    let frame = 0;
    let loading = false;
    let disposed = false;

    const eligible = () => !disposed && !document.hidden
      && window.matchMedia(desktopMotion).matches
      && !document.querySelector("dialog[open]")
      && !["hidden", "clip"].includes(document.body.style.overflow);

    const destroy = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      // Lenis 1.3.26 leaves a native velocity timeout behind on destroy.
      // Reset its state first so that timeout cannot restore stale root classes.
      lenis?.stop();
      lenis?.destroy();
      lenis = undefined;
    };

    const tick = (time: number) => {
      frame = 0;
      if (!eligible()) {
        destroy();
        return;
      }
      lenis?.raf(time);
      if (lenis?.isScrolling === "smooth") frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (frame || !eligible() || !lenis) return;
      // Prime the clock after idle time, so the first frame cannot jump ahead.
      lenis.raf(performance.now());
      frame = requestAnimationFrame(tick);
    };

    const reconcile = async () => {
      if (!eligible()) {
        destroy();
        return;
      }
      if (lenis || loading) return;
      loading = true;
      try {
        const { default: LenisConstructor } = await import("lenis");
        if (!eligible()) return;
        lenis = new LenisConstructor({
          lerp: 0.16,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
          allowNestedScroll: true,
          stopInertiaOnNavigate: true,
          respectReducedMotion: true,
          // Native anchors retain URL hashes, browser focus, and header offsets.
          anchors: false,
          prevent: node => node.matches(nativeRegions),
          virtualScroll: ({ event }) => eligible() && !event.shiftKey,
        });
        lenis.on("virtual-scroll", wake);
      } catch {
        // Native scrolling remains available if the enhancement fails to load.
        destroy();
      } finally {
        loading = false;
      }
    };

    const cancelInertia = () => {
      if (lenis?.isScrolling !== "smooth") return;
      // Recreate at the browser's position without issuing a scroll command.
      // This leaves native anchor animations and history restoration intact.
      destroy();
      void reconcile();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (scrollKeys.has(event.key)) cancelInertia();
    };
    const onClick = (event: MouseEvent) => {
      const link = event.composedPath().find(node => node instanceof HTMLAnchorElement);
      if (link instanceof HTMLAnchorElement && link.origin === window.location.origin) cancelInertia();
    };
    const onDialogToggle = () => queueMicrotask(() => { void reconcile(); });
    const onCapabilityChange = () => { void reconcile(); };
    const bodyStyle = new MutationObserver(onCapabilityChange);
    bodyStyle.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    capability.addEventListener("change", onCapabilityChange);
    document.addEventListener("visibilitychange", onCapabilityChange);
    document.addEventListener("beforetoggle", onDialogToggle, true);
    document.addEventListener("focusin", cancelInertia, true);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("popstate", cancelInertia);
    window.addEventListener("hashchange", cancelInertia);
    void reconcile();

    return () => {
      disposed = true;
      bodyStyle.disconnect();
      capability.removeEventListener("change", onCapabilityChange);
      document.removeEventListener("visibilitychange", onCapabilityChange);
      document.removeEventListener("beforetoggle", onDialogToggle, true);
      document.removeEventListener("focusin", cancelInertia, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", cancelInertia);
      window.removeEventListener("hashchange", cancelInertia);
      destroy();
    };
  }, [pathname]);

  return null;
}
