import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPosts, getTelegram } from "@/lib/content";
import { CollectionHeading, GlassWriting } from "@/components/liquid-glass/collections";
import styles from "@/components/liquid-glass/collections.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Writing · Liquid Glass",
  description: "Practical notes on SQL, Python, data engineering, and building reliable pipelines by Namazbek Bekzhanov.",
  alternates: { canonical: "/writing" },
};

export default async function GlassWritingPage() {
  const [posts, telegram] = await Promise.all([getPosts(), getTelegram()]);
  const summaries = posts.map(({ slug, title, description, date, tags, readingTime }) => ({ slug, title, description, date, tags, readingTime }));
  return (
    <div className={styles.page}>
      <CollectionHeading
        eyebrow="Notes from the field"
        title="Learn it. Build it. Share it."
        count={posts.length}
        countLabel="notes"
      >
        <p>
          Queries, pipelines, Python, and the decisions behind them. Practical
          engineering notes, written while working through the details.
        </p>
      </CollectionHeading>
      <GlassWriting posts={summaries} />
      <section className={styles.channel}>
        <div>
          <h2>The shorter version.</h2>
          <p>I share shorter notes and useful links on my Telegram channel.</p>
        </div>
        <a href={`https://t.me/${encodeURIComponent(telegram.channel)}`} target="_blank" rel="noopener noreferrer">
          Read on Telegram <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
