import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isStudioPath,
  getSceneRouteMode,
} from "../../src/features/studio/runtime/route-mode";
import { connectScrollBridge } from "../../src/features/studio/runtime/scroll-bridge";
test("namespace is exact and deep links are neutral", () => {
  for (const s of [
    "/studio",
    "/studio/modules/architecture",
    "/studio/connect",
  ])
    assert.equal(isStudioPath(s), true);
  for (const s of ["/", "/v2", "/studio-other"])
    assert.equal(isStudioPath(s), false);
  assert.equal(getSceneRouteMode("/studio"), "story");
  assert.equal(getSceneRouteMode("/studio/connect"), "ambient");
});
test("bridge synchronizes milliseconds and detaches exactly its owned resources", () => {
  let tick: (s: number) => void = () => {};
  let scroll = () => {};
  let raf = 0,
    updates = 0,
    removed = 0,
    off = 0;
  const cleanup = connectScrollBridge({
    lenis: {
      raf: (t) => {
        raf = t;
      },
      on: (_event, fn) => {
        scroll = fn;
        return () => {};
      },
      off: () => {
        off++;
      },
    },
    update: () => {
      updates++;
    },
    ticker: {
      add: (fn) => {
        tick = fn;
      },
      remove: (fn) => {
        assert.equal(fn, tick);
        removed++;
      },
    },
  });
  tick(2);
  scroll();
  assert.equal(raf, 2000);
  assert.equal(updates, 1);
  cleanup();
  cleanup();
  assert.equal(removed, 1);
  assert.equal(off, 1);
});
