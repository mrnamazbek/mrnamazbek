import type { Metadata } from "next";
import { LabContent } from "@/components/lab/lab-content";
import styles from "../portfolio.module.css";

export const metadata: Metadata = { title: "Lab · Liquid Glass", alternates: { canonical: "/lab" } };
export const revalidate = 300;

export default function LiquidLabPage() {
  return <div className={`${styles.portfolio} ${styles.lab}`}><LabContent /></div>;
}
