import type { SceneRouteMode } from "../modules/types";
export type PoseChannel =
  | "rotationX"
  | "rotationY"
  | "rotationZ"
  | "scale"
  | "cameraX"
  | "cameraY"
  | "cameraZ"
  | "layerExpansion"
  | "distortion"
  | "lightIntensity";
const channels: readonly PoseChannel[] = [
  "rotationX",
  "rotationY",
  "rotationZ",
  "scale",
  "cameraX",
  "cameraY",
  "cameraZ",
  "layerExpansion",
  "distortion",
  "lightIntensity",
];
const frames = Object.freeze([
  Object.freeze([0, 0, 0, 1, 0, 0, 6, 0, 0.02, 1]),
  Object.freeze([0.15, 0.35, 0, 0.95, 0.15, 0.1, 6.2, 0.8, 0.04, 1.1]),
  Object.freeze([0, 0.65, 0, 0.85, 0.3, 0.05, 6.6, 1, 0.02, 1]),
  Object.freeze([0, 1.05, 0.1, 0.8, 0.2, 0.15, 7, 1.4, 0.01, 0.9]),
  Object.freeze([0, 1.3, 0, 0.9, 0, 0.1, 6.5, 0.55, 0.02, 1]),
]);
const neutral = Object.freeze([0, 0, 0, 0.8, 0, 0, 6, 0.1, 0, 0.8]);
export function poseChannelAt(
  progress: number,
  channel: PoseChannel,
  mode: SceneRouteMode,
): number {
  const c = channels.indexOf(channel);
  if (mode === "ambient") return neutral[c];
  const p =
    Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0)) * 4;
  const index = Math.min(3, Math.floor(p));
  const t = p - index,
    smooth = t * t * (3 - 2 * t);
  return frames[index][c] + (frames[index + 1][c] - frames[index][c]) * smooth;
}
