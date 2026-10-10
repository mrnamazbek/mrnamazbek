import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPosts, getTelegram } from "@/lib/content";
import { PageHeading, SectionHeading } from "@/components/ui/page-heading";
import { WritingList } from "@/components/content/filterable-lists";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Practical notes on SQL, Python, data engineering, and building reliable pipelines.",
};
export default async function WritingPage() {
  const [posts, telegram] = await Promise.all([getPosts(), getTelegram()]);
  const summaries = posts.map(
    ({ slug, title, description, date, tags, readingTime }) => ({
      slug,
      title,
      description,
      date,
      tags,
      readingTime,
    }),
  );
  return (
    <>
      <PageHeading
        eyebrow="03 / NOTES FROM THE FIELD"
        title="Learn it. Build it. Write it down."
      >
        <p>
          Practical engineering notes, written as I work through the details.
          Queries, pipelines, Python, and the trade-offs behind them.
        </p>
      </PageHeading>
      <WritingList posts={summaries} />
      {telegram.posts.length > 0 && (
        <section className="content-section">
          <SectionHeading number="02" title="From the channel">
            <span className="mono muted">SAVED TELEGRAM NOTES</span>
          </SectionHeading>
          <div className="experiment-grid">
            {telegram.posts.slice(0, 6).map((post) => {
              const date = post.date ? new Date(post.date) : null;
              const validDate = date && !Number.isNaN(date.getTime());
              return (
                <article className="signal-panel" key={post.url}>
                  {validDate && <time className="eyebrow" dateTime={date.toISOString()}>{date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time>}
                  <p>{post.text.slice(0, 700)}{post.text.length > 700 ? "…" : ""}</p>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-link">Read the full note <ArrowUpRight size={16} /></a>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <section className="telegram-banner">
        <div>
          <p className="eyebrow">THE SHORTER VERSION</p>
          <h2>
            Big Data & Software Engineering,
            <br />
            one post at a time.
          </h2>
          <p>I share shorter notes and useful links on my Telegram channel.</p>
        </div>
        <a
          href={`https://t.me/${encodeURIComponent(telegram.channel)}`}
          className="button button-outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read on Telegram <ArrowUpRight size={18} />
        </a>
      </section>
    </>
  );
}
