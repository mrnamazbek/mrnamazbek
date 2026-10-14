import type { Metadata } from "next";
import { LabContent } from "@/components/lab/lab-content";

export const metadata: Metadata = {
  title: "Lab",
  description: "Interactive tools and experiments: regex, Docker Compose, capacity planning, world clocks, and a data pipeline builder.",
};
export const revalidate = 300;

export default function LabPage() {
  return <LabContent />;
}
