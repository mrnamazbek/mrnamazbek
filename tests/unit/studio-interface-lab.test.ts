import { test } from "node:test";
import assert from "node:assert/strict";
import {
  moveCurvePoint,
  normalizeSamplePreferences,
} from "../../src/features/studio/modules/interface-lab/domain";
import {
  initialCurve,
  initialPreferences,
} from "../../src/features/studio/modules/interface-lab/fixtures";

test("all curve points clamp finite edits without mutation and preserve nonfinite coordinates", () => {
  const before = structuredClone(initialCurve);
  for (const index of [0, 1, 2, 3] as const) {
    const moved = moveCurvePoint(initialCurve, index, { x: -40, y: 300 });
    assert.deepEqual(moved[index], { x: 0, y: 100 });
    assert.deepEqual(
      moveCurvePoint(initialCurve, index, { x: NaN, y: Infinity })[index],
      initialCurve[index],
    );
    assert.deepEqual(
      moveCurvePoint(initialCurve, index, { x: 44, y: NaN })[index],
      { x: 44, y: initialCurve[index].y },
    );
    assert.deepEqual(initialCurve, before);
  }
});

test("sample preferences accept only known values and reset exactly", () => {
  for (const invalid of [
    null,
    [],
    "light",
    42,
    {},
    {
      theme: "other",
      scale: 120,
      spacing: "huge",
      palette: "red",
      scheme: "other",
      grayscale: "yes",
      font: "comic",
    },
  ]) {
    assert.deepEqual(normalizeSamplePreferences(invalid), initialPreferences);
  }
  for (const scale of [100, 125, 150, 200])
    assert.equal(normalizeSamplePreferences({ scale }).scale, scale);
  assert.deepEqual(
    normalizeSamplePreferences({
      theme: "light",
      scale: 200,
      spacing: "wide",
      palette: "mint",
      scheme: "warm",
      grayscale: true,
      font: "serif",
    }),
    {
      theme: "light",
      scale: 200,
      spacing: "wide",
      palette: "mint",
      scheme: "warm",
      grayscale: true,
      font: "serif",
    },
  );
  assert.equal(
    normalizeSamplePreferences({ scheme: "high-contrast" }).scheme,
    "high-contrast",
  );
  assert.ok(Object.isFrozen(initialCurve));
  assert.ok(Object.isFrozen(initialCurve[0]));
  assert.ok(Object.isFrozen(initialPreferences));
});
