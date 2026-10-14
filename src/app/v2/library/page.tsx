import type { Metadata } from "next";
import { getBooks } from "@/lib/content";
import { CollectionHeading, GlassLibrary } from "@/components/liquid-glass/collections";
import styles from "@/components/liquid-glass/collections.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Library · Liquid Glass",
  description: "Namazbek’s personal bookshelf of data systems, software craftsmanship, engineering, and ideas worth returning to.",
  alternates: { canonical: "/library" },
};

export default async function GlassLibraryPage() {
  const books = await getBooks();
  return (
    <div className={styles.page}>
      <CollectionHeading
        eyebrow="The engineer’s bookshelf"
        title="Good ideas stay with you."
        count={books.length}
        countLabel="books"
      >
        <p>
          What I’m reading, what I’ve finished, and what’s next. A small collection
          that keeps shaping the way I think about systems and software.
        </p>
      </CollectionHeading>
      <GlassLibrary books={books} />
    </div>
  );
}
