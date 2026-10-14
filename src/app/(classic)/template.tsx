import type { ReactNode } from "react";
import { RouteTransition } from "@/components/layout/route-transition";

export default function Template({ children }: { children: ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
