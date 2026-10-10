import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || "https://namazbek-portfolio.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
