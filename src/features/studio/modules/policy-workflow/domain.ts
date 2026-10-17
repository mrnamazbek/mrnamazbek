export type PolicyInput = {
  credits: number;
  recipient: "hub-a" | "hub-b";
  category: "education" | "tools" | "travel";
};
export type PolicyResult = {
  allowed: boolean;
  reasons: readonly ("recipient" | "category" | "limit")[];
  receiptId: string;
};
export type PolicyStep = "input" | "validation" | "policy" | "receipt";

export function parsePolicyInput(
  value: unknown,
): { ok: true; value: PolicyInput } | { ok: false; errors: readonly string[] } {
  const input = value && typeof value === "object" ? value : {};
  const credits = "credits" in input ? input.credits : undefined;
  const recipient = "recipient" in input ? input.recipient : undefined;
  const category = "category" in input ? input.category : undefined;
  const errors: string[] = [];
  if (
    typeof credits !== "number" ||
    !Number.isFinite(credits) ||
    !Number.isInteger(credits) ||
    credits <= 0
  ) {
    errors.push("LAB credits must be a positive whole number.");
  }
  if (recipient !== "hub-a" && recipient !== "hub-b")
    errors.push("Choose a known recipient.");
  if (category !== "education" && category !== "tools" && category !== "travel")
    errors.push("Choose a known category.");
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { credits, recipient, category } as PolicyInput };
}

export function evaluatePolicy(input: PolicyInput): PolicyResult {
  const reasons: ("recipient" | "category" | "limit")[] = [];
  if (input.recipient !== "hub-a") reasons.push("recipient");
  if (input.category === "travel") reasons.push("category");
  if (input.credits > 1000) reasons.push("limit");
  return {
    allowed: reasons.length === 0,
    reasons,
    receiptId: `LAB-${String(input.credits).padStart(4, "0")}-${input.recipient === "hub-a" ? "A" : "B"}-${input.category.toUpperCase()}`,
  };
}

export function nextPolicyStep(step: PolicyStep): PolicyStep {
  const steps: readonly PolicyStep[] = [
    "input",
    "validation",
    "policy",
    "receipt",
  ];
  return steps[Math.min(steps.indexOf(step) + 1, steps.length - 1)];
}
