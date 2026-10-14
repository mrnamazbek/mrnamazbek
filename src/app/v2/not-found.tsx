import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./portfolio.module.css";

export default function LiquidNotFound() {
  return <section className={styles.pageIntro}><p className={styles.eyebrow}>A WRONG TURN</p><h1>This path is<br />still uncharted.</h1><p>Let’s get you back to something worth exploring.</p><Link href="/v2" className={styles.primary}>Back home <ArrowUpRight size={17} /></Link></section>;
}
