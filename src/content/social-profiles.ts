/** Saved public profile details. Keep these in sync when a profile changes. */
export const socialPlatforms = ["github", "linkedin", "telegram"] as const;
export type SocialPlatform = (typeof socialPlatforms)[number];

export interface SocialProfile {
  platform: string;
  url: string;
  name: string;
  handle: string;
  headline: string;
  description: string;
  avatar: string | null;
  tags: readonly string[];
  location?: string;
}

export const socialProfiles: Record<SocialPlatform, SocialProfile> = {
  github: {
    platform: "GitHub",
    url: "https://github.com/mrnamazbek",
    name: "Namazbek Bekzhanov",
    handle: "@mrnamazbek",
    headline: "Software, data & machine learning.",
    description: "Public repositories, practical tools, and experiments from the things I build.",
    avatar: "/assets/social/github-avatar.jpg",
    tags: ["Open source", "Python", "Data engineering"],
  },
  linkedin: {
    platform: "LinkedIn",
    url: "https://linkedin.com/in/namazbek-bekzhanov",
    name: "Namazbek Bekzhanov",
    handle: "namazbek-bekzhanov",
    headline: "Software Engineer · Data Engineer · Python Developer",
    description: "Digital Development Center · National Bank of Kazakhstan. Kazakhstan-British Technical University.",
    avatar: "/assets/gallery/portrait-formal.webp",
    tags: ["Data engineering", "Python", "SQL"],
    location: "Almaty, Kazakhstan",
  },
  telegram: {
    platform: "Telegram",
    url: "https://t.me/tech_digest_kz",
    name: "Big Data & Software Engineering",
    handle: "@tech_digest_kz",
    headline: "Notes from the field, one post at a time.",
    description: "Shorter engineering notes, useful links, and ideas I share along the way.",
    avatar: "/assets/social/telegram-avatar.jpg",
    tags: ["Big data", "Software engineering"],
  },
};
