import { notFound } from "next/navigation";

/** Unknown edition URLs retain the Liquid Glass navigation and recovery page. */
export default function MissingLiquidPage() {
  notFound();
}
