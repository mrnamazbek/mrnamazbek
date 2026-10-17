import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateDemoForm,
  simulateResponse,
} from "../../src/features/studio/modules/form-workbench/domain";
import {
  initialForm,
  boundaryExamples,
} from "../../src/features/studio/modules/form-workbench/fixtures";

test("local fields enforce exact lengths, email and an empty website without mutation", () => {
  assert.equal(initialForm.email, "demo@example.invalid");
  const before = structuredClone(initialForm);
  assert.deepEqual(validateDemoForm(initialForm), {});
  for (const name of ["ab", "a".repeat(100)])
    assert.equal(validateDemoForm({ ...initialForm, name }).name, undefined);
  for (const name of ["", "a", "a".repeat(101)])
    assert.ok(validateDemoForm({ ...initialForm, name }).name);
  for (const message of ["a".repeat(10), "a".repeat(5000)])
    assert.equal(
      validateDemoForm({ ...initialForm, message }).message,
      undefined,
    );
  for (const message of ["", "a".repeat(9), "a".repeat(5001)])
    assert.ok(validateDemoForm({ ...initialForm, message }).message);
  const exactEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
  assert.equal(exactEmail.length, 254);
  assert.equal(
    validateDemoForm({ ...initialForm, email: exactEmail }).email,
    undefined,
  );
  assert.ok(
    validateDemoForm({ ...initialForm, email: exactEmail + "a" }).email,
  );
  for (const email of ["", "missing-at", "person@", "a b@example.invalid"])
    assert.ok(validateDemoForm({ ...initialForm, email }).email);
  for (const website of ["filled", " "])
    assert.ok(validateDemoForm({ ...initialForm, website }).website);
  assert.deepEqual(initialForm, before);
});

test("responses and eight boundary examples are fixed local fixtures", () => {
  assert.equal(simulateResponse("success").status, 200);
  assert.equal(simulateResponse("unavailable").status, 503);
  assert.equal(simulateResponse("failure").status, 502);
  for (const mode of ["success", "unavailable", "failure"] as const)
    assert.deepEqual(simulateResponse(mode), simulateResponse(mode));
  assert.deepEqual(
    boundaryExamples.map((example) => example.status),
    [400, 403, 413, 415, 422, 502, 503, 200],
  );
  for (const example of boundaryExamples)
    assert.ok(example.label && example.explanation.length > 25);
});
