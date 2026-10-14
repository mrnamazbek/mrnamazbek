import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClassicFrame } from "@/components/layout/classic-frame";

export default function NotFound() {
  return (
    <ClassicFrame><section className="page-heading empty-state">
      <p className="eyebrow">404 / WRONG TURN</p>
      <h1>
        This path is still
        <br />
        uncharted<span className="accent">.</span>
      </h1>
      <p>Let’s get you back to something worth exploring.</p>
      <Link href="/" className="button button-primary">
        Back home <ArrowUpRight size={18} />
      </Link>
    </section></ClassicFrame>
  );
}
