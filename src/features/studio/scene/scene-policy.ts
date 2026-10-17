export function getScenePolicy(input: {
  reducedMotion: boolean;
  coarsePointer: boolean;
  forcedColors: boolean;
  webglAvailable: boolean;
  hidden: boolean;
}): "poster" | "paused" | "interactive" {
  if (
    input.reducedMotion ||
    input.coarsePointer ||
    input.forcedColors ||
    !input.webglAvailable
  )
    return "poster";
  return input.hidden ? "paused" : "interactive";
}
