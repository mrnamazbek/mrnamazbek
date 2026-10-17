import type { SceneRouteMode, SceneSignals } from "../modules/types";
export function createSceneSignals(): SceneSignals {
  return {
    mode: "ambient",
    chapter: 0,
    progress: 0,
    pointerX: 0,
    pointerY: 0,
    paused: false,
  };
}
export function resetSceneSignals(
  signals: SceneSignals,
  mode: SceneRouteMode,
): void {
  Object.assign(signals, {
    mode,
    chapter: 0,
    progress: 0,
    pointerX: 0,
    pointerY: 0,
    paused: false,
  });
}

/** Mutable signals are intentionally outside React render state. */
export function setScenePaused(signals: SceneSignals, paused: boolean): void {
  signals.paused = paused;
}
export function setScenePointer(
  signals: SceneSignals,
  x: number,
  y: number,
): void {
  signals.pointerX = x;
  signals.pointerY = y;
}
export function setSceneProgress(
  signals: SceneSignals,
  progress: number,
): void {
  signals.progress = progress;
  signals.chapter = Math.min(3, Math.floor(progress * 4));
}
