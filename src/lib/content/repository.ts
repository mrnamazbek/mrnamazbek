import "server-only";

import { cache } from "react";
// Same server helper re-exported by next/navigation, without its client contexts.
import { unstable_rethrow } from "next/dist/client/components/unstable-rethrow";
import { z } from "zod";
import { createSupabaseContentClient } from "@/lib/supabase/server";
import type { ContentSource, SiteContent } from "@/types/content";
import { localContent } from "./local";
import {
  profileSchema, experienceSchema, educationSchema, certificationSchema,
  skillGroupSchema, projectSchema, bookSchema, postSchema,
} from "./schemas";
import { snapshotCatalog, snapshotKeys, type SnapshotKey } from "./snapshot-catalog";

interface ContentResult<T> { data: T; source: ContentSource }

function camelCaseRow(row: unknown): unknown {
  if (typeof row !== "object" || row === null || Array.isArray(row)) return row;
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key.replace(/_([a-z])/g, (_, character: string) => character.toUpperCase()), value,
  ]));
}

function fallback<T>(table: string, data: T): ContentResult<T> {
  // Do not log query payloads or credentials. The returned source remains explicit.
  console.warn(`[content] ${table} unavailable or invalid; using checked-in content.`);
  return { data, source: "local" };
}

async function readCollection<T>(
  table: string, columns: string, schema: z.ZodType<T>, local: T[],
): Promise<ContentResult<T[]>> {
  const client = createSupabaseContentClient();
  if (!client) return { data: local, source: "local" };
  try {
    const { data, error } = await client.from(table).select(columns)
      .eq("published", true).order("position", { ascending: true }).retry(false).throwOnError();
    if (error || !data) return fallback(table, local);
    const parsed = schema.array().safeParse(data.map(camelCaseRow));
    return parsed.success ? { data: parsed.data, source: "supabase" } : fallback(table, local);
  } catch (error) {
    unstable_rethrow(error);
    return fallback(table, local);
  }
}

const readProfile = cache(async (): Promise<ContentResult<SiteContent["profile"]>> => {
  const client = createSupabaseContentClient();
  if (!client) return { data: localContent.profile, source: "local" };
  try {
    const { data, error } = await client.from("site_profiles").select(
      "name,short_name,role,location,bio,headline,availability,career_started_at,resume_url,email,secondary_email,work_email,links,philosophy,signature_url,avatar_url",
    ).eq("id", "main").eq("published", true).maybeSingle().retry(false).throwOnError();
    const parsed = profileSchema.safeParse(camelCaseRow(data));
    return !error && parsed.success
      ? { data: parsed.data, source: "supabase" }
      : fallback("site_profiles", localContent.profile);
  } catch (error) {
    unstable_rethrow(error);
    return fallback("site_profiles", localContent.profile);
  }
});

const readExperience = cache(() => readCollection("experiences",
  "id,role,organization,period,location,kind,highlights,technologies,current", experienceSchema, localContent.experience));
const readEducation = cache(() => readCollection("education",
  "id,degree,institution,period,description,note,status", educationSchema, localContent.education));
const readCertifications = cache(() => readCollection("certifications",
  "id,title,issuer,issued,credential_id,skills", certificationSchema, localContent.certifications));
const readSkills = cache(() => readCollection("skill_groups",
  "id,category,technologies", skillGroupSchema, localContent.skills));
const readProjects = cache(() => readCollection("projects",
  "id,slug,name,description,url,homepage,language,tags,stars,forks,featured,updated_at,source,captured_at", projectSchema, localContent.projects));
const readBooks = cache(() => readCollection("books",
  "id,title,author,cover_url,isbn,summary,description,tags,status,alt", bookSchema, localContent.books));
const readPosts = cache(async () => {
  const result = await readCollection("posts", "slug,title,description,date,tags,canonical_url,image,reading_time,body", postSchema, localContent.posts);
  return { ...result, data: result.data.sort((a, b) => b.date.localeCompare(a.date)) };
});

type Snapshots = { [K in SnapshotKey]: ContentResult<SiteContent[K]> };

const readSnapshots = cache(async (): Promise<Snapshots> => {
  const keys = snapshotKeys;
  const local = Object.fromEntries(keys.map((key) => [key, { data: localContent[key], source: "local" }])) as Snapshots;
  const client = createSupabaseContentClient();
  if (!client) return local;
  try {
    const { data, error } = await client.from("content_snapshots").select("key,payload")
      .in("key", keys).eq("published", true).retry(false).throwOnError();
    if (error || !data) return fallback("content_snapshots", local).data;
    for (const key of keys) {
      const row = data.find((entry) => entry.key === key);
      const parsed = snapshotCatalog[key].schema.safeParse(row?.payload);
      if (parsed.success) {
        // Each schema is selected by the same typed key as its destination.
        Object.assign(local, { [key]: { data: parsed.data, source: "supabase" } });
      } else { fallback(`content_snapshots:${key}`, localContent[key]); }
    }
    return local;
  } catch (error) {
    unstable_rethrow(error);
    return fallback("content_snapshots", local).data;
  }
});

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const [profile, experience, education, certifications, skills, projects, books, posts, snapshots] = await Promise.all([
    readProfile(), readExperience(), readEducation(), readCertifications(), readSkills(), readProjects(), readBooks(), readPosts(), readSnapshots(),
  ]);
  const results = { profile, experience, education, certifications, skills, projects, books, posts, ...snapshots };
  const sources = Object.fromEntries(Object.entries(results).map(([key, value]) => [key, value.source])) as SiteContent["sources"];
  const uniqueSources = new Set(Object.values(sources));
  return {
    profile: profile.data, experience: experience.data, education: education.data,
    certifications: certifications.data, skills: skills.data, projects: projects.data,
    books: books.data, posts: posts.data,
    telegram: snapshots.telegram.data, rankings: snapshots.rankings.data,
    monthlyFeature: snapshots.monthlyFeature.data, featureHistory: snapshots.featureHistory.data,
    audience: snapshots.audience.data, keywords: snapshots.keywords.data,
    sources, source: uniqueSources.size > 1 ? "mixed" : profile.source,
  };
});

export const getProfile = cache(async () => (await readProfile()).data);
export const getExperience = cache(async () => (await readExperience()).data);
export const getEducation = cache(async () => (await readEducation()).data);
export const getCertifications = cache(async () => (await readCertifications()).data);
export const getSkills = cache(async () => (await readSkills()).data);
export const getProjects = cache(async () => (await readProjects()).data);
export const getBooks = cache(async () => (await readBooks()).data);
export const getPosts = cache(async () => (await readPosts()).data);
export const getPostBySlug = cache(async (slug: string) => (await getPosts()).find((post) => post.slug === slug) ?? null);
export const getMonthlyFeature = cache(async () => (await readSnapshots()).monthlyFeature.data);
export const getFeatureHistory = cache(async () => (await readSnapshots()).featureHistory.data);
export const getAudience = cache(async () => (await readSnapshots()).audience.data);
export const getRankings = cache(async () => (await readSnapshots()).rankings.data);
export const getTelegram = cache(async () => (await readSnapshots()).telegram.data);
export const getKeywords = cache(async () => (await readSnapshots()).keywords.data);
