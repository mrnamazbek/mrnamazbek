import { test } from "node:test";
import assert from "node:assert/strict";
import {
  connectHref,
  parseConnectIntent,
  parseTerminalCommand,
} from "../../src/features/studio/contact/intent";
import type { ConnectIntent } from "../../src/features/studio/modules/types";

test("terminal accepts exactly five trimmed case-insensitive commands", () => {
  assert.deepEqual(parseTerminalCommand(" HELP "), { kind: "help" });
  assert.deepEqual(parseTerminalCommand("\tClear\n"), { kind: "clear" });
  for (const intent of ["cofound", "invest", "partner"] as const)
    assert.deepEqual(parseTerminalCommand(` ${intent.toUpperCase()} `), {
      kind: "navigate",
      intent,
    });
  for (const command of [
    "",
    "hello",
    "help;clear",
    "$(anything)",
    "https://example.invalid",
    "person@example.invalid",
    "<script>",
    "cofound now",
  ])
    assert.deepEqual(parseTerminalCommand(command), { kind: "unknown" });
});
test("contact intents and navigation are exact safe enums without reflection", () => {
  for (const intent of ["cofound", "invest", "partner"] as const) {
    assert.equal(parseConnectIntent(intent), intent);
    assert.equal(connectHref(intent), `/studio/connect?intent=${intent}`);
  }
  for (const input of [
    undefined,
    "",
    "INVEST",
    " invest ",
    ["cofound"],
    ["invest", "partner"],
    "https://example.invalid",
    "<script>",
    "person@example.invalid",
  ])
    assert.equal(parseConnectIntent(input), undefined);
  assert.equal(
    connectHref("https://example.invalid" as ConnectIntent),
    "/studio/connect",
  );
});
