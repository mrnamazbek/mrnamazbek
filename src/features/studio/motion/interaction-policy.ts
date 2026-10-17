export function getInteractionPolicy(input: {
  coarsePointer: boolean;
  reducedMotion: boolean;
  forcedColors: boolean;
}): "static" | "enhanced" {
  return input.coarsePointer || input.reducedMotion || input.forcedColors
    ? "static"
    : "enhanced";
}
export function velocityToSkew(velocity: number): number {
  return Number.isFinite(velocity)
    ? Math.max(-4, Math.min(4, velocity * 0.04))
    : 0;
}
