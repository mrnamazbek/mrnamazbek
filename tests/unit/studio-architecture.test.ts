import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advancePacket,
  resetPacket,
} from "../../src/features/studio/modules/architecture/domain";
import {
  stages,
  edges,
  architectureOptions,
  stackEntries,
  serviceIllustrations,
} from "../../src/features/studio/modules/architecture/fixtures";

test("fixed packet transitions complete once and reset without changing input", () => {
  const initial = Object.freeze(resetPacket());
  let packet = initial;
  const seen = [packet.stage];
  for (let index = 0; index < 4; index++) {
    packet = advancePacket(packet);
    seen.push(packet.stage);
  }
  assert.deepEqual(seen, ["source", "validate", "transform", "serve", "serve"]);
  assert.equal(packet.complete, true);
  assert.deepEqual(advancePacket(packet), packet);
  assert.deepEqual(initial, { stage: "source", complete: false });
  assert.deepEqual(resetPacket(), initial);
});

test("authored DAG and hypothetical comparison have complete fixed contracts", () => {
  assert.deepEqual(
    stages.map((stage) => stage.id),
    ["source", "validate", "transform", "serve"],
  );
  assert.deepEqual(edges, [
    ["source", "validate"],
    ["validate", "transform"],
    ["transform", "serve"],
  ]);
  assert.equal(serviceIllustrations.length, 5);
  assert.deepEqual(
    architectureOptions.map((option) => option.id),
    ["batch", "stream", "hybrid"],
  );
  for (const option of architectureOptions) {
    assert.deepEqual(Object.keys(option.scores), [
      "latency",
      "cost",
      "complexity",
      "recovery",
      "auditability",
    ]);
    for (const value of Object.values(option.scores))
      assert.ok(Number.isInteger(value) && value >= 0 && value <= 5);
  }
  assert.ok(Object.isFrozen(stages));
  assert.ok(Object.isFrozen(architectureOptions[0].scores));
});

test("each stack category has unique entries and a real explanation", () => {
  assert.equal(
    new Set(stackEntries.map((entry) => entry.id)).size,
    stackEntries.length,
  );
  for (const category of [
    "project-tooling",
    "platform-systems",
    "development-tools",
  ]) {
    const entries = stackEntries.filter((entry) => entry.category === category);
    assert.ok(entries.length >= 2);
    for (const entry of entries)
      assert.ok(entry.name && entry.explanation.length > 30);
  }
});
