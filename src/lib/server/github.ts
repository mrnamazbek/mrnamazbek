import "server-only";

import { z } from "zod";
import type { ServerEnvironment } from "../supabase/server";
import { jsonResponse } from "./http";

const categories = {
  python: "language:python topic:python",
  dataeng: "topic:data-engineering",
  devops: "topic:devops",
} as const;

const categorySchema = z.enum(["python", "dataeng", "devops"]);
const githubUrlSchema = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname === "github.com" && !url.username && !url.password;
});

const repositorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(2_000).nullable(),
  html_url: githubUrlSchema,
  language: z.string().max(100).nullable(),
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  updated_at: z.string().datetime(),
  fork: z.boolean(),
  private: z.boolean(),
});

const repositoriesSchema = z.array(repositorySchema).max(100);

interface GitHubHandlerDependencies {
  fetcher?: typeof fetch;
  environment?: ServerEnvironment;
  logger?: Pick<Console, "error">;
}

/** Fixed upstreams and category allowlist keep this endpoint from becoming a proxy. */
export function createGitHubHandler(dependencies: GitHubHandlerDependencies = {}) {
  return async function handleGitHub(request: Request): Promise<Response> {
    const requestedCategory = new URL(request.url).searchParams.get("category");
    const category = requestedCategory === null ? null : categorySchema.safeParse(requestedCategory);
    if (category && !category.success) {
      return jsonResponse({ ok: false, error: "Unknown repository category." }, 400);
    }

    const environment = dependencies.environment ?? process.env;
    const fetcher = dependencies.fetcher ?? fetch;
    const url = category?.success
      ? `https://api.github.com/search/repositories?${new URLSearchParams({
          q: categories[category.data],
          sort: "stars",
          order: "desc",
          per_page: "10",
        })}`
      : "https://api.github.com/users/mrnamazbek/repos?sort=updated&per_page=100";
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "namazbek-portfolio",
    };
    if (environment.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${environment.GITHUB_TOKEN}`;
    }

    try {
      const options: RequestInit & { next: { revalidate: number } } = {
        headers,
        cache: "force-cache",
        signal: AbortSignal.timeout(8_000),
        next: { revalidate: 3_600 },
      };
      const upstream = await fetcher(url, options);
      if (!upstream.ok) throw new Error("GitHub upstream unavailable");

      const payload: unknown = await upstream.json();
      const parsed = category?.success
        ? z.object({ items: repositoriesSchema }).safeParse(payload)
        : repositoriesSchema.safeParse(payload);
      if (!parsed.success) throw new Error("GitHub returned invalid repositories");

      const records = Array.isArray(parsed.data) ? parsed.data : parsed.data.items;
      const repositories = records
        .filter((repo) => !repo.private && (category?.success || !repo.fork))
        .slice(0, category?.success ? 10 : 24)
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at,
        }));

      return Response.json(
        { repositories, source: "github" },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    } catch {
      (dependencies.logger ?? console).error("GitHub feed unavailable.");
      return jsonResponse(
        { ok: false, error: "GitHub is temporarily unavailable." },
        503,
        { "Retry-After": "300" },
      );
    }
  };
}
