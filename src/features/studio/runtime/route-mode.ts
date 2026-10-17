import type { SceneRouteMode } from "../modules/types";
export function isStudioPath(pathname: string): boolean {
  return pathname === "/studio" || pathname.startsWith("/studio/");
}
export function getSceneRouteMode(pathname: string): SceneRouteMode {
  return pathname === "/studio" ? "story" : "ambient";
}
