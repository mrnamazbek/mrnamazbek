import type {
  ArchitectureOption,
  ServiceIllustration,
  StackEntry,
  StageId,
} from "./domain";

export const stages: readonly {
  id: StageId;
  label: string;
  title: string;
  description: string;
  contract: string;
}[] = Object.freeze(
  [
    {
      id: "source",
      label: "Source",
      title: "Start with an owned input",
      description:
        "A fictional record enters with a stable key, an event type and a declared schema version. Ownership is established before movement.",
      contract: "packet-001 · schema v1 · local fixture",
    },
    {
      id: "validate",
      label: "Validate",
      title: "Validate the contract",
      description:
        "Check required fields and accepted values. Invalid inputs would stop at this boundary, with a reason the caller can understand.",
      contract: "Required key · known event type · finite amount",
    },
    {
      id: "transform",
      label: "Transform",
      title: "Make the change explicit",
      description:
        "Normalize one known shape into another. Preserve the original key so the decision can be reproduced.",
      contract: "Canonical fields · stable key · deterministic mapping",
    },
    {
      id: "serve",
      label: "Serve",
      title: "Expose a bounded result",
      description:
        "Present the transformed record through a read contract. State freshness and ownership rather than inventing throughput numbers.",
      contract: "One illustrative read model · no deployed endpoint",
    },
  ].map((stage) => Object.freeze(stage as (typeof stages)[number])),
);
export const edges: readonly (readonly [StageId, StageId])[] = Object.freeze([
  Object.freeze(["source", "validate"] as const),
  Object.freeze(["validate", "transform"] as const),
  Object.freeze(["transform", "serve"] as const),
]);
export const architectureOptions: readonly ArchitectureOption[] = Object.freeze(
  [
    {
      id: "batch",
      label: "Batch",
      scores: Object.freeze({
        latency: 1,
        cost: 5,
        complexity: 5,
        recovery: 4,
        auditability: 5,
      }),
    },
    {
      id: "stream",
      label: "Stream",
      scores: Object.freeze({
        latency: 5,
        cost: 2,
        complexity: 2,
        recovery: 3,
        auditability: 3,
      }),
    },
    {
      id: "hybrid",
      label: "Hybrid",
      scores: Object.freeze({
        latency: 4,
        cost: 3,
        complexity: 2,
        recovery: 4,
        auditability: 4,
      }),
    },
  ].map((option) => Object.freeze(option as ArchitectureOption)),
);
export const serviceIllustrations: readonly {
  id: ServiceIllustration;
  label: string;
  title: string;
  description: string;
  boundary: string;
}[] = Object.freeze(
  [
    {
      id: "support",
      label: "Support",
      title: "Route a question to an owner",
      description:
        "A request, a decision point and a response. Each handoff has a named responsibility.",
      boundary:
        "Illustrative support flow. No case queue, call or chat is connected.",
    },
    {
      id: "approval",
      label: "Approval",
      title: "Make a decision reviewable",
      description:
        "An input moves through a check before a reviewer records a reason. Cancellation returns to the start.",
      boundary: "Illustrative approval flow. No order or purchase is created.",
    },
    {
      id: "data",
      label: "Data",
      title: "Preserve a record through change",
      description:
        "A stable identifier crosses validation and transformation boundaries so a result remains traceable.",
      boundary: "Illustrative data flow. No query or job is executed.",
    },
    {
      id: "cloud",
      label: "Cloud",
      title: "Describe responsibility, then placement",
      description:
        "A compute boundary, a queue and a durable store have different failure and recovery responsibilities.",
      boundary:
        "Illustrative infrastructure. No host, environment or deployment is controlled.",
    },
    {
      id: "controls",
      label: "Controls",
      title: "Explain what each check protects",
      description:
        "Input limits, ownership checks and recovery procedures form a small, inspectable control surface.",
      boundary:
        "Illustrative engineering controls. No monitoring or certification is claimed.",
    },
  ].map((item) => Object.freeze(item as (typeof serviceIllustrations)[number])),
);
export const stackEntries: readonly StackEntry[] = Object.freeze(
  [
    {
      id: "project-types",
      category: "project-tooling",
      name: "TypeScript",
      explanation:
        "Express the shapes exchanged between modules. Types clarify intent; runtime validation still owns unknown input.",
    },
    {
      id: "project-checks",
      category: "project-tooling",
      name: "Playwright",
      explanation:
        "Inspect a real browser interaction. A test is most useful when it checks a person's outcome rather than a styling detail.",
    },
    {
      id: "platform-store",
      category: "platform-systems",
      name: "PostgreSQL",
      explanation:
        "An illustrative durable record boundary. Transactions and constraints can protect consistency; they do not choose the product contract.",
    },
    {
      id: "platform-queue",
      category: "platform-systems",
      name: "Message queue",
      explanation:
        "An illustrative handoff boundary. Retrying and duplicate delivery require explicit idempotency and ownership decisions.",
    },
    {
      id: "development-history",
      category: "development-tools",
      name: "Git",
      explanation:
        "Keep a reviewable history of a change. Small commits make intent and recovery easier to inspect.",
    },
    {
      id: "development-validation",
      category: "development-tools",
      name: "Schema validation",
      explanation:
        "Check an unknown input at the boundary. Validation complements static types and returns actionable failure reasons.",
    },
  ].map((entry) => Object.freeze(entry as StackEntry)),
);
