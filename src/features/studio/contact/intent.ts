import type { ConnectIntent } from "../modules/types";
export type TerminalCommand =
  | { kind: "help" | "clear" }
  | { kind: "navigate"; intent: ConnectIntent }
  | { kind: "unknown" };
const destinations: Record<ConnectIntent, string> = {
  cofound: "/studio/connect?intent=cofound",
  invest: "/studio/connect?intent=invest",
  partner: "/studio/connect?intent=partner",
};
export function parseConnectIntent(
  value: string | string[] | undefined,
): ConnectIntent | undefined {
  return value === "cofound" || value === "invest" || value === "partner"
    ? value
    : undefined;
}
export function parseTerminalCommand(input: string): TerminalCommand {
  const command = input.trim().toLowerCase();
  if (command === "help" || command === "clear") return { kind: command };
  const intent = parseConnectIntent(command);
  return intent ? { kind: "navigate", intent } : { kind: "unknown" };
}
export function connectHref(intent: ConnectIntent): string {
  return Object.hasOwn(destinations, intent)
    ? destinations[intent]
    : "/studio/connect";
}
