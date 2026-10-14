import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getPostBySlug, getPosts, getProfile } from "@/lib/content";
import { GlassSurface } from "@/components/liquid-glass/surface";
import styles from "@/components/liquid-glass/collections.module.css";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;
export async function generateStaticParams() { return (await getPosts()).map((post) => ({ slug: post.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Note not found" };
  return { title: post.title, description: post.description, alternates: { canonical: `/writing/${post.slug}` }, openGraph: { title: post.title, description: post.description, type: "article", publishedTime: post.date }, twitter: { card: "summary" } };
}

export default async function GlassPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, profile] = await Promise.all([getPostBySlug(slug), getProfile()]);
  if (!post) notFound();
  return (
    <article className={styles.article}>
      <Link href="/v2/writing" className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> All writing</Link>
      <header className={styles.articleHeading}>
        <div className={styles.postMeta}><time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time><span>{post.readingTime}</span></div>
        <h1>{post.title}</h1><p>{post.description}</p><ul className={styles.tags} aria-label="Topics">{post.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      </header>
      <GlassSurface className={styles.articlePanel}><div className={styles.articleBody} data-testid="v2-article-body"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: ({ href, children }) => <a href={href?.startsWith("/writing") ? `/v2${href}` : href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a> }}>{post.body}</Markdown></div></GlassSurface>
      <footer className={styles.articleFooter}><p>Thanks for reading. I share more notes on data and software engineering on Telegram.</p><a href={profile.links.telegram} target="_blank" rel="noopener noreferrer" className={styles.smallLink}>Keep the conversation going <ArrowUpRight size={16} aria-hidden="true" /></a></footer>
    </article>
  );
}
