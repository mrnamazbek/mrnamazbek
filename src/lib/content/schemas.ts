import { z } from "zod";

const text = z.string().min(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const url = z.string().url().refine((value) => /^https?:\/\//.test(value), "Only HTTP(S) URLs are allowed");
const asset = z.string().refine((value) => value.startsWith("/") && !value.startsWith("//"), "Expected a local asset path");

export const profileSchema = z.object({
  name: text, shortName: text, role: text, location: text, bio: text,
  headline: text, availability: text, careerStartedAt: date, resumeUrl: asset,
  email: z.string().email(), secondaryEmail: z.string().email(), workEmail: z.string().email(),
  links: z.object({ github: url, linkedin: url, telegram: url }),
  philosophy: text, signatureUrl: asset, avatarUrl: asset,
});

export const experienceSchema = z.object({
  id: text, role: text, organization: text, period: text, location: text,
  kind: text, highlights: z.array(text), technologies: z.array(text), current: z.boolean(),
});
export const educationSchema = z.object({
  id: text, degree: text, institution: text, period: text, description: text,
  note: z.string().nullable(), status: z.enum(["current", "completed", "planned"]),
});
export const certificationSchema = z.object({
  id: text, title: text, issuer: text, issued: z.string().nullable(),
  credentialId: z.string().nullable(), skills: z.array(text),
});
export const skillGroupSchema = z.object({ id: text, category: text, technologies: z.array(text) });
export const projectSchema = z.object({
  id: text, slug: text, name: text, description: text, url,
  homepage: url.nullable(), language: z.string().nullable(), tags: z.array(text),
  stars: z.number().int().nonnegative(), forks: z.number().int().nonnegative(),
  featured: z.boolean(), updatedAt: z.string().datetime({ offset: true }),
  source: z.enum(["github", "manual"]), capturedAt: date,
});
export const bookSchema = z.object({
  id: text, title: text, author: text, coverUrl: url, isbn: text,
  summary: text, description: text, tags: z.array(text),
  status: z.enum(["reading", "to-read", "completed"]), alt: text,
});
export const postSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), title: text,
  description: text, date, tags: z.array(text), canonicalUrl: url,
  image: asset.nullable(), readingTime: text, body: text,
});

export const rankingSchema = z.object({
  rank: z.number().int().positive(), name: text, model: text,
  score_current: z.number(), score_prev_month: z.number(), score_prev_year: z.number(),
  delta_mom: z.number(), delta_yoy: z.number(), as_of: text, source: url, icon: z.string(),
});
export const monthlyFeatureSchema = z.object({
  id: text, month: z.string().regex(/^\d{4}-\d{2}$/), title: text,
  trend_keyword: text, description: text, why_now: text, mobile_review_notes: text,
  source: z.object({ type: text, geo: text, captured_at: z.string().datetime({ offset: true }) }),
  widget: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("impact_estimator"), heading: text, description: z.string(),
      config: z.object({
        input_label: text, min: z.number(), max: z.number(), step: z.number().positive(),
        default: z.number(), baseline_hours: z.number().nonnegative(), efficiency_factor: z.number().min(0).max(1),
      }).refine((config) => config.max > config.min && config.default >= config.min && config.default <= config.max),
    }),
    z.object({
      type: z.literal("roadmap_planner"), heading: text, description: z.string(),
      config: z.object({ steps: z.array(z.object({ name: text, detail: z.string(), weeks: z.number().positive() })) }),
    }),
    z.object({
      type: z.literal("tradeoff_matrix"), heading: text, description: z.string(),
      config: z.object({
        question: text,
        options: z.array(z.object({ label: text, hint: z.string(), scores: z.record(z.number().min(0).max(10)) })).min(2).max(4),
        outcomes: z.array(z.object({ id: text, title: text, description: text })).min(2).max(4),
      }),
    }),
  ]),
});
export const audienceSchema = z.object({
  as_of: date, window_weeks: z.number().int().positive(), generated_at: z.string().datetime({ offset: true }),
  status: text, methodology: text, source: z.object({ name: text, docs: z.array(url) }),
  series: z.array(z.object({
    id: text, label: text, article: text, color: z.string().regex(/^#[0-9a-f]{6}$/i),
    points: z.array(z.object({ week: date, views: z.number().int().nonnegative() })),
  })),
  latest_rank: z.array(z.object({ id: text, label: text, views: z.number().int().nonnegative() })),
  errors: z.array(z.unknown()),
});
export const telegramSchema = z.object({
  channel: text, updated: z.string().nullable(),
  posts: z.array(z.object({
    id: z.union([z.string(), z.number()]).optional(), url, date: text.nullable(), text,
    views: z.union([z.number(), z.string()]).nullable().optional(),
  })),
});
export const keywordSchema = z.object({
  keyword: text, category: text, weight: z.number().min(0).max(1), aliases: z.array(text), link: text,
});
