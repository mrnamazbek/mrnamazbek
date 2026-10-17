import type { PolicyInput } from "./domain";

export const policyPresets: readonly {
  label: string;
  input: PolicyInput;
  allowed: boolean;
}[] = Object.freeze([
  {
    label: "Learning allocation",
    input: Object.freeze({
      credits: 240,
      recipient: "hub-a",
      category: "education",
    }),
    allowed: true,
  },
  {
    label: "Tooling allowance",
    input: Object.freeze({
      credits: 100,
      recipient: "hub-a",
      category: "tools",
    }),
    allowed: true,
  },
  {
    label: "Boundary check",
    input: Object.freeze({
      credits: 1200,
      recipient: "hub-b",
      category: "travel",
    }),
    allowed: false,
  },
]);
