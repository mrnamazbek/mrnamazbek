import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getInteractionPolicy,
  velocityToSkew,
} from "../../src/features/studio/motion/interaction-policy";
test("continuous interaction stays static for every constrained policy", () => {
  for (let n = 0; n < 8; n++)
    assert.equal(
      getInteractionPolicy({
        coarsePointer: !!(n & 1),
        reducedMotion: !!(n & 2),
        forcedColors: !!(n & 4),
      }),
      n ? "static" : "enhanced",
    );
});
test("velocity maps to a finite bounded skew and rests at zero", () => {
  for (const [v, want] of [
    [0, 0],
    [25, 1],
    [-25, -1],
    [200, 4],
    [-200, -4],
    [NaN, 0],
    [Infinity, 0],
  ])
    assert.equal(velocityToSkew(v), want);
});
