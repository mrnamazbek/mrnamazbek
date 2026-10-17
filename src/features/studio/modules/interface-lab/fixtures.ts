import { normalizeSamplePreferences, type Curve } from "./domain";
export const initialPreferences = Object.freeze(
  normalizeSamplePreferences(undefined),
);
export const initialCurve: Curve = Object.freeze([
  Object.freeze({ x: 5, y: 90 }),
  Object.freeze({ x: 25, y: 10 }),
  Object.freeze({ x: 75, y: 90 }),
  Object.freeze({ x: 95, y: 10 }),
]);
export const galleryStudies = Object.freeze([
  Object.freeze({
    id: "layers",
    title: "Layer study",
    description:
      "Owned abstract study of stacked surfaces and visible boundaries.",
  }),
  Object.freeze({
    id: "grid",
    title: "Grid study",
    description:
      "Owned abstract study of rhythm, spacing and one deliberate exception.",
  }),
  Object.freeze({
    id: "orbit",
    title: "Orbit study",
    description: "Owned abstract study of a shared center and separate paths.",
  }),
]);
export const milestones = Object.freeze([
  Object.freeze({
    title: "Question",
    description: "A fictional question names one uncertain assumption.",
  }),
  Object.freeze({
    title: "Prototype",
    description: "A fictional prototype tests one boundary.",
  }),
  Object.freeze({
    title: "Observe",
    description: "A fictional observation informs the next question.",
  }),
]);
export const regions = Object.freeze([
  Object.freeze({
    title: "West",
    x: 25,
    y: 55,
    description: "West · illustrative source boundary.",
  }),
  Object.freeze({
    title: "Central",
    x: 50,
    y: 40,
    description: "Central · illustrative validation boundary.",
  }),
  Object.freeze({
    title: "East",
    x: 76,
    y: 58,
    description: "East · illustrative handoff boundary.",
  }),
]);
