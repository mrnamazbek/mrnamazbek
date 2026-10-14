import type { ReactNode } from "react";
import { ClassicFrame } from "@/components/layout/classic-frame";

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return <ClassicFrame>{children}</ClassicFrame>;
}
