"use client";
import { useCallback, useEffect, useRef, type RefObject } from "react";
type Bounds = { left: number; top: number; width: number; height: number };
/** Cache document coordinates at interaction boundaries, never in the move path. */
export function usePointerBounds<T extends HTMLElement>(
  root: RefObject<T | null>,
) {
  const bounds = useRef<Bounds | null>(null);
  const measure = useCallback(() => {
    const element = root.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    bounds.current = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  }, [root]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);
  return { bounds, measure };
}
