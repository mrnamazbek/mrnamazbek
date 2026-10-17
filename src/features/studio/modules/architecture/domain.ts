export type StageId = "source" | "validate" | "transform" | "serve";
export type PacketState = { stage: StageId; complete: boolean };
export type ServiceIllustration =
  | "support"
  | "approval"
  | "data"
  | "cloud"
  | "controls";
export type ArchitectureOption = {
  id: "batch" | "stream" | "hybrid";
  label: string;
  scores: Readonly<
    Record<
      "latency" | "cost" | "complexity" | "recovery" | "auditability",
      number
    >
  >;
};
export type StackCategory =
  | "project-tooling"
  | "platform-systems"
  | "development-tools";
export type StackEntry = {
  id: string;
  category: StackCategory;
  name: string;
  explanation: string;
};
const order: readonly StageId[] = ["source", "validate", "transform", "serve"];
export function resetPacket(): PacketState {
  return { stage: "source", complete: false };
}
export function advancePacket(state: PacketState): PacketState {
  if (state.complete) return state;
  const index = order.indexOf(state.stage);
  return index === order.length - 1
    ? { stage: "serve", complete: true }
    : { stage: order[index + 1], complete: false };
}
