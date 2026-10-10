export type ContentSource = "local" | "supabase";

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  location: string;
  bio: string;
  headline: string;
  availability: string;
  careerStartedAt: string;
  resumeUrl: string;
  email: string;
  secondaryEmail: string;
  workEmail: string;
  links: { github: string; linkedin: string; telegram: string };
  philosophy: string;
  signatureUrl: string;
  avatarUrl: string;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  kind: string;
  highlights: string[];
  technologies: string[];
  current: boolean;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  note: string | null;
  status: "current" | "completed" | "planned";
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issued: string | null;
  credentialId: string | null;
  skills: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  technologies: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  homepage: string | null;
  language: string | null;
  tags: string[];
  stars: number;
  forks: number;
  featured: boolean;
  updatedAt: string;
  source: "github" | "manual";
  capturedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  isbn: string;
  summary: string;
  description: string;
  tags: string[];
  status: "reading" | "to-read" | "completed";
  alt: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  canonicalUrl: string;
  image: string | null;
  readingTime: string;
  body: string;
}

// External snapshots retain the pipeline's original keys to preserve provenance.
export interface DatabaseRanking {
  rank: number;
  name: string;
  model: string;
  score_current: number;
  score_prev_month: number;
  score_prev_year: number;
  delta_mom: number;
  delta_yoy: number;
  as_of: string;
  source: string;
  icon: string;
}

export interface ImpactEstimator {
  type: "impact_estimator";
  heading: string;
  description: string;
  config: {
    input_label: string;
    min: number;
    max: number;
    step: number;
    default: number;
    baseline_hours: number;
    efficiency_factor: number;
  };
}

export interface RoadmapPlanner {
  type: "roadmap_planner";
  heading: string;
  description: string;
  config: { steps: { name: string; detail: string; weeks: number }[] };
}

export interface TradeoffMatrix {
  type: "tradeoff_matrix";
  heading: string;
  description: string;
  config: {
    question: string;
    options: { label: string; hint: string; scores: Record<string, number> }[];
    outcomes: { id: string; title: string; description: string }[];
  };
}

export interface MonthlyFeature {
  id: string;
  month: string;
  title: string;
  trend_keyword: string;
  description: string;
  why_now: string;
  mobile_review_notes: string;
  source: { type: string; geo: string; captured_at: string };
  widget: ImpactEstimator | RoadmapPlanner | TradeoffMatrix;
}

export interface AudienceSnapshot {
  as_of: string;
  window_weeks: number;
  generated_at: string;
  status: string;
  methodology: string;
  source: { name: string; docs: string[] };
  series: {
    id: string;
    label: string;
    article: string;
    color: string;
    points: { week: string; views: number }[];
  }[];
  latest_rank: { id: string; label: string; views: number }[];
  errors: unknown[];
}

export interface TelegramSnapshot {
  channel: string;
  updated: string | null;
  posts: { id?: string | number; url: string; date: string | null; text: string; views?: number | string | null }[];
}

export interface Keyword {
  keyword: string;
  category: string;
  weight: number;
  aliases: string[];
  link: string;
}

export interface SiteContent {
  profile: Profile;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: SkillGroup[];
  projects: Project[];
  books: Book[];
  posts: Post[];
  telegram: TelegramSnapshot;
  rankings: DatabaseRanking[];
  monthlyFeature: MonthlyFeature;
  featureHistory: MonthlyFeature[];
  audience: AudienceSnapshot;
  keywords: Keyword[];
  source: ContentSource | "mixed";
  sources: Record<Exclude<keyof SiteContent, "source" | "sources">, ContentSource>;
}
