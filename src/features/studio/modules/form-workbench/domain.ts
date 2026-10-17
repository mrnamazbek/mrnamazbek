import { z } from "zod";
export type DemoForm = {
  name: string;
  email: string;
  message: string;
  website: string;
};
export type AdapterMode = "success" | "unavailable" | "failure";
export type BoundaryExample = {
  status: 400 | 403 | 413 | 415 | 422 | 502 | 503 | 200;
  label: string;
  explanation: string;
};
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use 2–100 characters for the demo name.")
    .max(100, "Use 2–100 characters for the demo name."),
  email: z
    .string()
    .trim()
    .email("Use a valid sample email address.")
    .max(254, "Keep the email at 254 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(10, "Use 10–5,000 characters for the demo message.")
    .max(5000, "Use 10–5,000 characters for the demo message."),
  website: z.string().max(0, "Leave the website field empty."),
});
export function validateDemoForm(
  form: DemoForm,
): Partial<Record<keyof DemoForm, string>> {
  const result = formSchema.safeParse(form);
  if (result.success) return {};
  const fields = result.error.flatten().fieldErrors;
  const errors: Partial<Record<keyof DemoForm, string>> = {};
  for (const key of ["name", "email", "message", "website"] as const) {
    const message = fields[key]?.[0];
    if (message) errors[key] = message;
  }
  return errors;
}
const responses = {
  success: Object.freeze({
    status: 200 as const,
    message: "Simulated success. Your sample stays here until Reset demo.",
  }),
  unavailable: Object.freeze({
    status: 503 as const,
    message: "Local adapter unavailable. Your edits are preserved.",
  }),
  failure: Object.freeze({
    status: 502 as const,
    message: "Simulated adapter failure. Your edits are preserved.",
  }),
};
export function simulateResponse(mode: AdapterMode): {
  status: 200 | 503 | 502;
  message: string;
} {
  return { ...(responses[mode] ?? responses.failure) };
}
