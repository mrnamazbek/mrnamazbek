import { test } from "node:test";
import assert from "node:assert/strict";
import { createChapterNavigation } from "../../src/features/studio/runtime/chapter-navigation";

test("chapter intent is allowlisted, consumed once and cancellable", () => {
  const navigation = createChapterNavigation();
  navigation.request("studio-capabilities");
  assert.equal(navigation.take(), "studio-capabilities");
  assert.equal(navigation.take(), null);
  navigation.request("studio-ventures");
  navigation.cancel();
  assert.equal(navigation.take(), null);
  navigation.request("studio-architecture");
  navigation.request("not-a-chapter");
  assert.equal(navigation.take(), null);
});
