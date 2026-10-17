import type { BoundaryExample, DemoForm } from "./domain";
export const initialForm: Readonly<DemoForm> = Object.freeze({
  name: "Demo Builder",
  email: "demo@example.invalid",
  message: "A fictional message to inspect this local boundary.",
  website: "",
});
export const invalidForm: Readonly<DemoForm> = Object.freeze({
  name: "A",
  email: "not-an-email",
  message: "Short",
  website: "filled",
});
export const boundaryExamples: readonly BoundaryExample[] = Object.freeze(
  [
    {
      status: 400,
      label: "Malformed payload",
      explanation:
        "A request body cannot be interpreted as the expected input. This fixture describes the boundary before field validation.",
    },
    {
      status: 403,
      label: "Request not accepted",
      explanation:
        "A boundary check rejects a request before processing it. The reason should be safe to explain without exposing internals.",
    },
    {
      status: 413,
      label: "Payload too large",
      explanation:
        "An explicit size limit bounds work at the input boundary. The visitor can shorten the input and try again.",
    },
    {
      status: 415,
      label: "Unsupported content type",
      explanation:
        "The input format does not match the declared contract. A clear expectation is more useful than a silent failure.",
    },
    {
      status: 422,
      label: "Field validation failed",
      explanation:
        "The input is readable but one or more fields violate the contract. Associate each reason with its field and preserve the draft.",
    },
    {
      status: 502,
      label: "Adapter failure",
      explanation:
        "A downstream boundary did not produce the expected result. Preserve edits and make the next action explicit.",
    },
    {
      status: 503,
      label: "Adapter unavailable",
      explanation:
        "The selected local adapter is unavailable. A retry can be offered without pretending that work succeeded.",
    },
    {
      status: 200,
      label: "Simulated success",
      explanation:
        "The local fixture represents success. No request was sent, and sample fields remain until an explicit reset.",
    },
  ].map((example) => Object.freeze(example as BoundaryExample)),
);
