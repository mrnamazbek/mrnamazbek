import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { getCertifications, getEducation, getExperience, getProfile, getSkills } from "@/lib/content";
import { GlassSurface } from "@/components/liquid-glass/surface";
import { TechnologyIcon } from "@/components/ui/technology-icon";
import styles from "../portfolio.module.css";

export const metadata: Metadata = { title: "About · Liquid Glass", alternates: { canonical: "/about" } };
export const revalidate = 300;

export default async function LiquidAboutPage() {
  const [profile, experience, education, skills, certifications] = await Promise.all([
    getProfile(), getExperience(), getEducation(), getSkills(), getCertifications(),
  ]);
  return <div className={styles.portfolio}>
    <header className={styles.pageIntro}><p className={styles.eyebrow}>THE PERSON BEHIND THE PIPELINES</p><h1>Curious by nature.<br />Engineer by practice.</h1><p>{profile.bio}</p></header>
    <div className={styles.aboutGrid}>
      <GlassSurface className={styles.profileCard}><Image src="/assets/gallery/portrait-blue.webp" width={896} height={1200} alt="Namazbek Bekzhanov" sizes="(max-width: 760px) 90vw, 40vw" /><div><h2>{profile.name}</h2><p>{profile.role} · {profile.location}</p><div className={styles.actions}><a href={profile.resumeUrl} className={styles.primary}>Download résumé <ArrowUpRight size={16} /></a><Link href="/v2/gallery" className={styles.secondary}>Personal gallery <ArrowUpRight size={16} /></Link></div></div></GlassSurface>
      <GlassSurface className={styles.bioCard}><p className={styles.eyebrow}>HOW I THINK ABOUT THE WORK</p><h2>Correctness first.<br />Fast second.</h2><p>{profile.philosophy}</p><p>My work connects data engineering, backend development, and the practical needs of financial infrastructure. I also share what I learn through teaching and my Telegram channel.</p><Link href="/v2/contact" className={styles.secondary}>Let’s connect <ArrowUpRight size={16} /></Link></GlassSurface>
    </div>
    <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / THE JOURNEY SO FAR</p><h2>Built through experience.</h2></div></div><div className={styles.journey}>{experience.map(role => <GlassSurface className={styles.journeyCard} key={role.id}><details open={role.current}><summary><span>{role.period}</span><div><h3>{role.role}</h3><p>{role.organization}</p><p>{role.location} · {role.kind}</p></div><Plus size={19} aria-hidden="true" /></summary><ul>{role.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul><div className={styles.tags}>{role.technologies.map(tool => <span key={tool}>{tool}</span>)}</div></details></GlassSurface>)}</div></section>
    <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>02 / ALWAYS A STUDENT</p><h2>Learning, with intention.</h2></div></div><div className={styles.educationGrid}>{education.map(item => <GlassSurface className={styles.educationCard} key={item.id}><p className={styles.eyebrow}>{item.period} · {item.status}</p><h3>{item.degree}</h3><strong>{item.institution}</strong><p>{item.description}</p></GlassSurface>)}</div></section>
    <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / THE TOOLS OF THE TRADE</p><h2>A connected toolkit.</h2></div></div><div className={styles.skillGrid}>{skills.map(group => <GlassSurface className={styles.skillCard} key={group.id}><h3>{group.category}</h3><ul aria-label={`${group.category} technologies`}>{group.technologies.map(tool => <li key={tool}><TechnologyIcon tool={tool} />{tool}</li>)}</ul></GlassSurface>)}</div></section>
    <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>04 / LEARNING ON RECORD</p><h2>Small steps, kept moving.</h2></div></div><div className={styles.certificationGrid}>{certifications.map(item => <GlassSurface className={styles.certificationCard} key={item.id}><h3>{item.title}</h3><p>{item.issuer}{item.issued ? ` · ${item.issued}` : ""}</p></GlassSurface>)}</div></section>
  </div>;
}
