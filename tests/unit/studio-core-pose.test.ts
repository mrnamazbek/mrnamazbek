import { test } from "node:test";
import assert from "node:assert/strict";
import {
  poseChannelAt,
  type PoseChannel,
} from "../../src/features/studio/scene/core-pose";
const rows = [
  [0, 0, 0, 1, 0, 0, 6, 0, 0.02, 1],
  [0.15, 0.35, 0, 0.95, 0.15, 0.1, 6.2, 0.8, 0.04, 1.1],
  [0, 0.65, 0, 0.85, 0.3, 0.05, 6.6, 1, 0.02, 1],
  [0, 1.05, 0.1, 0.8, 0.2, 0.15, 7, 1.4, 0.01, 0.9],
  [0, 1.3, 0, 0.9, 0, 0.1, 6.5, 0.55, 0.02, 1],
];
const channels: PoseChannel[] = [
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
test("all exact poses, neutral values and bounded continuous interpolation", () => {
  channels.forEach((c, i) => {
    rows.forEach((r, j) =>
      assert.equal(poseChannelAt(j / 4, c, "story"), r[i]),
    );
    assert.equal(
      poseChannelAt(0.9, c, "ambient"),
      [0, 0, 0, 0.8, 0, 0, 6, 0.1, 0, 0.8][i],
    );
    for (const p of [-1, NaN, Infinity])
      assert.equal(poseChannelAt(p, c, "story"), rows[0][i]);
    assert.equal(poseChannelAt(2, c, "story"), rows[4][i]);
    for (let j = 1; j < 4; j++) {
      assert.ok(
        Math.abs(
          poseChannelAt(j / 4 - 1e-6, c, "story") -
            poseChannelAt(j / 4 + 1e-6, c, "story"),
        ) < 1e-4,
      );
    }
    for (let j = 0; j < 4; j++) {
      const v = poseChannelAt((j + 0.4) / 4, c, "story");
      assert.ok(
        v >= Math.min(rows[j][i], rows[j + 1][i]) &&
          v <= Math.max(rows[j][i], rows[j + 1][i]),
      );
      assert.equal(v, poseChannelAt((j + 0.4) / 4, c, "story"));
    }
  });
});
