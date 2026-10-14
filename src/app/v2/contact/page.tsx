import type { Metadata } from "next";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getProfile } from "@/lib/content";
import { ContactForm } from "@/components/contact-form";
import { SocialProfileLink } from "@/components/ui/social-profile-link";
import { socialPlatforms } from "@/content/social-profiles";
import { GlassSurface } from "@/components/liquid-glass/surface";
import styles from "../portfolio.module.css";

export const metadata: Metadata = { title: "Contact · Liquid Glass", alternates: { canonical: "/contact" } };
export const revalidate = 300;

export default async function LiquidContactPage() {
  const profile = await getProfile();
  return <div className={styles.portfolio}>
    <header className={styles.pageIntro}><p className={styles.eyebrow}>A DIRECT LINE</p><h1>Good work starts<br />with a conversation.</h1><p>A data challenge, an interesting project, or an idea worth exploring. Tell me what you have in mind.</p></header>
    <div className={styles.contactGrid}>
      <GlassSurface className={styles.contactCard}><p className={styles.eyebrow}>SAY HELLO</p><h2>Let’s make it happen.</h2><a className={styles.email} href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={21} /></a><p><MapPin size={15} style={{display:"inline",marginRight:6}} />{profile.location}<br />UTC +05:00</p><div className={styles.socials}>{socialPlatforms.map(platform => <SocialProfileLink key={platform} platform={platform} href={profile.links[platform]}>{platform === "linkedin" ? "LinkedIn" : platform === "github" ? "GitHub" : "Telegram"}</SocialProfileLink>)}</div><span className={styles.status}><i aria-hidden="true" />{profile.availability}</span></GlassSurface>
      <GlassSurface className={styles.formCard}><ContactForm email={profile.email} /></GlassSurface>
    </div>
  </div>;
}
