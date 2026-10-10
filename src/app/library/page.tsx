import type { Metadata } from "next";
import { getBooks } from "@/lib/content";
import { PageHeading } from "@/components/ui/page-heading";
import { BookList } from "@/components/content/filterable-lists";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Library",
  description:
    "A personal bookshelf of data systems, software craftsmanship, engineering, and ideas worth returning to.",
};
export default async function LibraryPage() {
  const books = await getBooks();
  return (
    <>
      <PageHeading
        eyebrow="05 / THE ENGINEER’S BOOKSHELF"
        title="Good ideas have a long shelf life."
      >
        <p>
          What I’m reading, what I’ve finished, and what’s next. A small
          collection that keeps shaping the way I think about systems and
          software.
        </p>
      </PageHeading>
      <BookList books={books} />
    </>
  );
}
