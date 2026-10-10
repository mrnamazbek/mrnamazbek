import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPostBySlug, getPosts } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Note not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
    twitter: { card: "summary" },
  };
}
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return (
    <article className="article-shell">
      <Link href="/writing" className="text-link article-back">
        <ArrowLeft size={16} />
        All writing
      </Link>
      <header className="article-heading">
        <div className="post-meta mono">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
          <span>{post.readingTime}</span>
        </div>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="tag-list">
          {post.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="article-body">
        <Markdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                {...(href?.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            ),
          }}
        >
          {post.body}
        </Markdown>
      </div>
      <footer className="article-footer">
        <p>
          Thanks for reading. I share more notes on data and software
          engineering on Telegram.
        </p>
        <a
          href="https://t.me/tech_digest_kz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Keep the conversation going <ArrowUpRight size={17} />
        </a>
      </footer>
    </article>
  );
}
