import {
  audienceSchema, keywordSchema, monthlyFeatureSchema, rankingSchema, telegramSchema,
} from "./schemas";

// This allowlist is shared by server reads and the scheduled-feed importer.
export const snapshotCatalog = {
  telegram: { filename: "telegram_posts.json", schema: telegramSchema, asOfField: "updated", arrayItem: null },
  rankings: { filename: "db_ranking.json", schema: rankingSchema.array(), asOfField: "as_of", arrayItem: "first" },
  monthlyFeature: { filename: "ai_monthly_feature.json", schema: monthlyFeatureSchema, asOfField: "month", arrayItem: null },
  featureHistory: { filename: "ai_feature_history.json", schema: monthlyFeatureSchema.array(), asOfField: "month", arrayItem: "last" },
  audience: { filename: "ai_audience_weekly.json", schema: audienceSchema, asOfField: "as_of", arrayItem: null },
  keywords: { filename: "keywords.json", schema: keywordSchema.array(), asOfField: null, arrayItem: null },
} as const;

export type SnapshotKey = keyof typeof snapshotCatalog;
export const snapshotKeys = Object.keys(snapshotCatalog) as SnapshotKey[];

export function snapshotAsOf(key: SnapshotKey, payload: unknown): string | null {
  const definition = snapshotCatalog[key];
  if (!definition.asOfField) return null;
  const record = Array.isArray(payload)
    ? payload[definition.arrayItem === "last" ? payload.length - 1 : 0]
    : payload;
  if (typeof record !== "object" || record === null) return null;
  const value = (record as Record<string, unknown>)[definition.asOfField];
  return typeof value === "string" ? value : null;
}
