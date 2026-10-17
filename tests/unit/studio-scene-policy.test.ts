import { test } from "node:test";
import assert from "node:assert/strict";
import { getScenePolicy } from "../../src/features/studio/scene/scene-policy";
test("poster policy takes precedence, then hidden pause, then interactive", () => {
  for (let bits = 0; bits < 32; bits++) {
    const reducedMotion = !!(bits & 1),
      coarsePointer = !!(bits & 2),
      forcedColors = !!(bits & 4),
      webglAvailable = !(bits & 8),
      hidden = !!(bits & 16);
    assert.equal(
      getScenePolicy({
        reducedMotion,
        coarsePointer,
        forcedColors,
        webglAvailable,
        hidden,
      }),
      reducedMotion || coarsePointer || forcedColors || !webglAvailable
        ? "poster"
        : hidden
          ? "paused"
          : "interactive",
    );
  }
});
