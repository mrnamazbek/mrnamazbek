"use client";
import { useSyncExternalStore } from "react";
const query =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";
function subscribe(callback: () => void) {
  const media = matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function snapshot() {
  return matchMedia(query).matches;
}
function serverSnapshot() {
  return false;
}
export function useInteractionPolicy(): boolean {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
