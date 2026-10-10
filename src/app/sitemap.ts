import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/content/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "https://namazbek-portfolio.vercel.app";
  const routes = ["", "/about", "/projects", "/writing", "/library", "/lab", "/contact"];
  const posts = await getPosts();
  return [
    ...routes.map((route) => ({ url: `${base}${route}`, priority: route ? 0.7 : 1 })),
    ...posts.map((post) => ({
      url: `${base}/writing/${post.slug}`,
      lastModified: new Date(post.date),
      priority: 0.6,
    })),
  ];
}
