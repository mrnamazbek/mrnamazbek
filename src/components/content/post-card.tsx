import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/types/content";

export type PostSummary = Pick<
  Post,
  "slug" | "title" | "description" | "date" | "tags" | "readingTime"
>;
export function PostCard({
  post,
  index = 0,
}: {
  post: PostSummary;
  index?: number;
}) {
  return (
    <article className="post-card">
      <span className="post-number mono">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <div className="post-meta mono">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
          <span>{post.readingTime}</span>
        </div>
        <h3>
          <Link href={`/writing/${post.slug}`} className="stretched-link">
            {post.title}
          </Link>
        </h3>
        <p>{post.description}</p>
        <div className="tag-list">
          {post.tags.slice(0, 3).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ArrowUpRight className="card-arrow" size={23} />
    </article>
  );
}
