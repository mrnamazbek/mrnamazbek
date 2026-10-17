export type SampleGroup = "navigation" | "states" | "motion";
export type CurvePoint = { x: number; y: number };
export type Curve = readonly [CurvePoint, CurvePoint, CurvePoint, CurvePoint];
export type SamplePreferences = {
  theme: "dark" | "light";
  scale: 100 | 125 | 150 | 200;
  spacing: "normal" | "wide";
  palette: "ice" | "mint";
  scheme: "default" | "high-contrast" | "warm";
  grayscale: boolean;
  font: "sans" | "serif";
};

export function moveCurvePoint(
  curve: Curve,
  index: 0 | 1 | 2 | 3,
  point: CurvePoint,
): Curve {
  const next: [CurvePoint, CurvePoint, CurvePoint, CurvePoint] = [...curve];
  const clamp = (value: number, prior: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : prior;
  next[index] = {
    x: clamp(point.x, curve[index].x),
    y: clamp(point.y, curve[index].y),
  };
  return next;
}
export function normalizeSamplePreferences(value: unknown): SamplePreferences {
  const input =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const theme = "theme" in input ? input.theme : null;
  const scale = "scale" in input ? input.scale : null;
  const spacing = "spacing" in input ? input.spacing : null;
  const palette = "palette" in input ? input.palette : null;
  const scheme = "scheme" in input ? input.scheme : null;
  const grayscale = "grayscale" in input ? input.grayscale : null;
  const font = "font" in input ? input.font : null;
  return {
    theme: theme === "light" ? "light" : "dark",
    scale: scale === 125 || scale === 150 || scale === 200 ? scale : 100,
    spacing: spacing === "wide" ? "wide" : "normal",
    palette: palette === "mint" ? "mint" : "ice",
    scheme:
      scheme === "high-contrast" || scheme === "warm" ? scheme : "default",
    grayscale: grayscale === true,
    font: font === "serif" ? "serif" : "sans",
  };
}
