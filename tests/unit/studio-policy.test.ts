import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluatePolicy,
  nextPolicyStep,
  parsePolicyInput,
} from "../../src/features/studio/modules/policy-workflow/domain";
import { policyPresets } from "../../src/features/studio/modules/policy-workflow/fixtures";

test("three policy presets and receipts are deterministic and do not mutate input", () => {
  assert.equal(policyPresets.length, 3);
  for (const preset of policyPresets) {
    const before = structuredClone(preset.input);
    assert.equal(parsePolicyInput(preset.input).ok, true);
    assert.equal(evaluatePolicy(preset.input).allowed, preset.allowed);
    assert.deepEqual(
      evaluatePolicy(preset.input),
      evaluatePolicy(preset.input),
    );
    assert.deepEqual(preset.input, before);
  }
  assert.equal(
    evaluatePolicy({ credits: 100, recipient: "hub-a", category: "tools" })
      .receiptId,
    "LAB-0100-A-TOOLS",
  );
});

test("credit boundaries and denial reasons follow the documented order", () => {
  for (const credits of [1, 1000, 1001]) {
    const input = {
      credits,
      recipient: "hub-a",
      category: "education",
    } as const;
    assert.equal(parsePolicyInput(input).ok, true);
    assert.equal(evaluatePolicy(input).allowed, credits <= 1000);
  }
  assert.deepEqual(
    evaluatePolicy({ credits: 1001, recipient: "hub-b", category: "travel" })
      .reasons,
    ["recipient", "category", "limit"],
  );
});

test("invalid inputs never become evaluable policy requests", () => {
  for (const credits of [0, -1, 1.5, NaN, Infinity, "", "100", null]) {
    assert.equal(
      parsePolicyInput({ credits, recipient: "hub-a", category: "tools" }).ok,
      false,
    );
  }
  for (const value of [
    null,
    [],
    {},
    { credits: 1, recipient: "external", category: "tools" },
    { credits: 1, recipient: "hub-a", category: "other" },
  ]) {
    assert.equal(parsePolicyInput(value).ok, false);
  }
  assert.deepEqual(
    ["input", "validation", "policy", "receipt"].map((step) =>
      nextPolicyStep(step as "input" | "validation" | "policy" | "receipt"),
    ),
    ["validation", "policy", "receipt", "receipt"],
  );
});
