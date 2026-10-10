import profile from "@/content/profile.json";
import experience from "@/content/experience.json";
import education from "@/content/education.json";
import certifications from "@/content/certifications.json";
import skills from "@/content/skills.json";
import projects from "@/content/projects.json";
import books from "@/content/books.json";
import posts from "@/content/posts.json";
import telegram from "@/content/snapshots/telegram_posts.json";
import rankings from "@/content/snapshots/db_ranking.json";
import monthlyFeature from "@/content/snapshots/ai_monthly_feature.json";
import featureHistory from "@/content/snapshots/ai_feature_history.json";
import audience from "@/content/snapshots/ai_audience_weekly.json";
import keywords from "@/content/snapshots/keywords.json";
import {
  profileSchema, experienceSchema, educationSchema, certificationSchema,
  skillGroupSchema, projectSchema, bookSchema, postSchema, telegramSchema,
  rankingSchema, monthlyFeatureSchema, audienceSchema, keywordSchema,
} from "./schemas";

// Checked-in content is validated too, so a broken fallback fails during the build.
export const localContent = {
  profile: profileSchema.parse(profile),
  experience: experienceSchema.array().parse(experience),
  education: educationSchema.array().parse(education),
  certifications: certificationSchema.array().parse(certifications),
  skills: skillGroupSchema.array().parse(skills),
  projects: projectSchema.array().parse(projects),
  books: bookSchema.array().parse(books),
  posts: postSchema.array().parse(posts).sort((a, b) => b.date.localeCompare(a.date)),
  telegram: telegramSchema.parse(telegram),
  rankings: rankingSchema.array().parse(rankings),
  monthlyFeature: monthlyFeatureSchema.parse(monthlyFeature),
  featureHistory: monthlyFeatureSchema.array().parse(featureHistory),
  audience: audienceSchema.parse(audience),
  keywords: keywordSchema.array().parse(keywords),
};
