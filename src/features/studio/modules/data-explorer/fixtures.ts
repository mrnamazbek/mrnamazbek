import type { Note, SampleRole } from "./domain";

const noteSeeds: readonly Omit<Note, "id" | "date">[] = [
  {
    title: "Contracts before pipelines",
    category: "systems",
    summary:
      "Make the shape of an input explicit before deciding how to move it. A small contract catches a large class of downstream ambiguity.",
    terms: ["schema", "boundaries"],
  },
  {
    title: "Unicode at the boundary",
    category: "interfaces",
    summary:
      "A café label and a Қазақша heading exercise normalization without changing what the reader meant.",
    terms: ["café", "Қазақша", "unicode"],
  },
  {
    title: "Replay is a design tool",
    category: "systems",
    summary:
      "Replay the same fictional packet to examine which assumptions remain stable and which depend on arrival order.",
    terms: ["event streams", "idempotency"],
  },
  {
    title: "The empty state is a state",
    category: "interfaces",
    summary:
      "An empty result needs a clear explanation, a preserved query and a useful next action.",
    terms: ["search", "resilience"],
  },
  {
    title: "One owner for time",
    category: "workflows",
    summary:
      "A single lifecycle owner makes animation clocks and cleanup easier to inspect.",
    terms: ["motion", "ownership"],
  },
  {
    title: "Questions before metrics",
    category: "research",
    summary:
      "Choose a decision first. Then identify the observation that could change it.",
    terms: ["hypothesis", "validation"],
  },
  {
    title: "A limit worth explaining",
    category: "workflows",
    summary:
      "A denial is more useful when the interface can point to the exact rule that produced it.",
    terms: ["policy", "reason codes"],
  },
  {
    title: "A diagram needs an exit",
    category: "interfaces",
    summary:
      "A visual system map should also offer an ordered reading path and keyboard controls.",
    terms: ["accessibility", "diagrams"],
  },
  {
    title: "Recovery is part of the contract",
    category: "systems",
    summary:
      "Define what survives a failed operation before choosing a retry strategy.",
    terms: ["recovery", "retries"],
  },
  {
    title: "Small fixtures reveal boundaries",
    category: "research",
    summary:
      "A deliberately limited dataset can make edge cases visible without pretending to represent production.",
    terms: ["fixtures", "provenance"],
  },
  {
    title: "Cancellation has a destination",
    category: "workflows",
    summary:
      "Every staged workflow needs a clear point to return to when a person cancels.",
    terms: ["state machines", "cancel"],
  },
  {
    title: "Prefer a boring reset",
    category: "interfaces",
    summary:
      "A reset should restore a known example, clear transient output and leave no delayed work behind.",
    terms: ["reset", "predictability"],
  },
  {
    title: "Batching changes the question",
    category: "systems",
    summary:
      "Batch and continuous processing trade freshness against coordination and operational cost.",
    terms: ["batch", "latency"],
  },
  {
    title: "A useful interview prompt",
    category: "research",
    summary:
      "Ask for the last concrete failure rather than a prediction about whether someone might use a tool.",
    terms: ["interviews", "evidence"],
  },
  {
    title: "Focus is visible state",
    category: "interfaces",
    summary:
      "Keyboard focus needs a stable position and a clear return path after a dialog closes.",
    terms: ["keyboard", "dialogs"],
  },
  {
    title: "Keep the original intent",
    category: "workflows",
    summary:
      "A failed local operation should preserve the fields that explain what the person was trying to do.",
    terms: ["forms", "drafts"],
  },
  {
    title: "A cache has an owner",
    category: "systems",
    summary:
      "State what a cache contains, when it expires and which action is responsible for invalidating it.",
    terms: ["cache", "lifecycle"],
  },
  {
    title: "Separate signal from scenery",
    category: "interfaces",
    summary:
      "Decorative motion should yield to content, native input and static reading preferences.",
    terms: ["progressive enhancement", "reduced motion"],
  },
  {
    title: "Write down the next test",
    category: "research",
    summary:
      "A hypothesis becomes more useful when its next observation and disconfirming result are explicit.",
    terms: ["experiments", "uncertainty"],
  },
];
export const notes: readonly Note[] = Object.freeze(
  noteSeeds.map((note, index) =>
    Object.freeze({
      ...note,
      terms: Object.freeze([...note.terms]),
      id: `note-${String(index + 1).padStart(2, "0")}`,
      date: `2026-09-${String(19 - index).padStart(2, "0")}`,
    }),
  ),
);

export const sampleRoles: readonly SampleRole[] = Object.freeze(
  [
    {
      id: "role-01",
      title: "Reliability engineer",
      department: "Platform",
      location: "Remote sample",
      kind: "full-time",
      description:
        "An invented role examining service recovery, repeatable checks and operational boundaries.",
    },
    {
      id: "role-02",
      title: "Data contract designer",
      department: "Platform",
      location: "Studio North",
      kind: "contract",
      description:
        "An invented role documenting input schemas and the consequences of change.",
    },
    {
      id: "role-03",
      title: "Workflow analyst",
      department: "Operations",
      location: "Remote sample",
      kind: "full-time",
      description:
        "An invented role turning a manual process into inspectable decision steps.",
    },
    {
      id: "role-04",
      title: "Interaction designer",
      department: "Design",
      location: "Studio East",
      kind: "full-time",
      description:
        "An invented role exploring focus, feedback and clear state transitions.",
    },
    {
      id: "role-05",
      title: "Research facilitator",
      department: "Product",
      location: "Remote sample",
      kind: "contract",
      description:
        "An invented role designing small problem interviews and recording evidence boundaries.",
    },
    {
      id: "role-06",
      title: "Interface engineer",
      department: "Design",
      location: "Studio North",
      kind: "full-time",
      description:
        "An invented role making keyboard, touch and static alternatives equally usable.",
    },
    {
      id: "role-07",
      title: "Prototype builder",
      department: "Product",
      location: "Studio East",
      kind: "contract",
      description:
        "An invented role creating bounded local experiments before a service is connected.",
    },
    {
      id: "role-08",
      title: "Systems documentarian",
      department: "Operations",
      location: "Remote sample",
      kind: "contract",
      description:
        "An invented role explaining system ownership and failure recovery in plain language.",
    },
    {
      id: "role-09",
      title: "Quality engineer",
      department: "Platform",
      location: "Studio North",
      kind: "full-time",
      description:
        "An invented role checking cancellation, reset and malformed input behavior.",
    },
  ].map((role) => Object.freeze(role as SampleRole)),
);
