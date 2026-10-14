import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Braces, BookOpen, MapPin, Sparkles } from "lucide-react";
import { getExperience, getPosts, getProfile, getProjects, getSkills } from "@/lib/content";
import { GlassSurface } from "@/components/liquid-glass/surface";
import { GlassSculpture } from "@/components/liquid-glass/glass-sculpture";
import { TechnologyIcon } from "@/components/ui/technology-icon";
import { Reveal } from "@/components/ui/reveal";
import styles from "./portfolio.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: { absolute: "Namazbek Bekzhanov — Liquid Glass Portfolio" },
  alternates: { canonical: "/" },
};

export default async function LiquidHomePage() {
  const [profile, projects, posts, experience, skills] = await Promise.all([
    getProfile(), getProjects(), getPosts(), getExperience(), getSkills(),
  ]);
  const selected = [...projects.filter(item => item.featured), ...projects.filter(item => !item.featured)].slice(0, 2);
  const current = experience.find(item => item.id === "nbk" && item.current) ?? experience.find(item => item.current);
  const tools = skills.flatMap(group => group.technologies);

  return <div className={styles.portfolio}>
    <section className={styles.hero} aria-labelledby="glass-introduction">
      <div className={styles.heroCopy}>
        <span className={styles.status}><i aria-hidden="true" />{profile.availability}</span>
        <p className={styles.eyebrow}>DATA ENGINEER · BACKEND DEVELOPER</p>
        <h1 id="glass-introduction">Hi, I’m<br /><span>Namazbek.</span></h1>
        <p className={styles.lead}>I make complex data feel simple.<br />And build systems you can trust.</p>
        <div className={styles.actions}>
          <Link href="/v2/projects" className={styles.primary}>Explore my work <ArrowUpRight size={18} /></Link>
          <Link href="/v2/about" className={styles.secondary}>A little about me <ArrowUpRight size={17} /></Link>
        </div>
        <p className={styles.location}><MapPin size={14} />{profile.location}<span>Available for good problems.</span></p>
      </div>
      <div className={styles.artComposition}>
        <GlassSurface className={styles.artPanel}>
          <div className={styles.artHeading}><span>A DIFFERENT PERSPECTIVE</span><Sparkles size={15} /></div>
          <GlassSculpture />
          <div className={styles.artCaption}><span>Clarity, through complexity.</span><span>01 / A SMALL EXPLORATION</span></div>
        </GlassSurface>
        <GlassSurface className={styles.identity}>
          <Image src="/assets/gallery/portrait-blue.webp" width={48} height={48} alt="Namazbek Bekzhanov" />
          <div><strong>{profile.name}</strong><span>Engineer. Builder. Always curious.</span></div>
        </GlassSurface>
        {current && <GlassSurface className={styles.currentRole}><span>CURRENTLY</span><strong>{current.role}</strong><small>{current.organization}</small></GlassSurface>}
      </div>
    </section>

    <div className={styles.toolStrip} aria-label="Core technologies">
      {["Python", "Airflow", "Iceberg", "Trino", "Docker", "Postgres"].filter(tool => tools.includes(tool)).map(tool =>
        <span key={tool}><TechnologyIcon tool={tool} />{tool}</span>
      )}
      <a href="#selected-work" className={styles.scrollCue}>Scroll to explore <ArrowDownRight size={18} /></a>
    </div>

    <section className={styles.section} id="selected-work">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / MADE TO WORK</p><h2>Ideas, made real.</h2></div><Link href="/v2/projects">All projects <ArrowUpRight size={16} /></Link></div>
      <div className={styles.projectGrid}>
        {selected.map((project, index) => <Reveal key={project.id}>
          <GlassSurface className={styles.projectCard}>
            <div className={styles.projectArt} data-art={index} aria-hidden="true"><span /><span /><span /><i /><b>{index === 0 ? "{ }" : "↗"}</b></div>
            <div className={styles.projectContent}><p className={styles.eyebrow}>{project.language ?? "OPEN SOURCE"}</p><h3><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}<ArrowUpRight size={21} /></a></h3><p>{project.description}</p><div className={styles.tags}>{project.tags.slice(0, 4).map(tag => <span key={tag}>{tag}</span>)}</div></div>
          </GlassSurface>
        </Reveal>)}
      </div>
    </section>

    <section className={styles.section} aria-labelledby="glass-person">
      <GlassSurface className={styles.personCard}>
        <div className={styles.portrait}><Image src="/assets/gallery/portrait-formal.webp" width={1400} height={781} alt="A portrait of Namazbek Bekzhanov" sizes="(max-width: 760px) 90vw, 40vw" /></div>
        <div><p className={styles.eyebrow}>02 / THE PERSON BEHIND THE PIPELINES</p><h2 id="glass-person">Care in the details.<br />Clarity in the result.</h2><p>{profile.philosophy}</p><Link href="/v2/about" className={styles.secondary}>Meet Namazbek <ArrowUpRight size={17} /></Link></div>
      </GlassSurface>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / NOTES FROM THE FIELD</p><h2>Thinking out loud.</h2></div><Link href="/v2/writing">All writing <ArrowUpRight size={16} /></Link></div>
      <div className={styles.writingGrid}>{posts.slice(0, 3).map(post => <GlassSurface key={post.slug} className={styles.noteCard}>
        <p className={styles.eyebrow}>{post.readingTime} READ</p><h3><Link href={`/v2/writing/${post.slug}`}>{post.title}<ArrowUpRight size={18} /></Link></h3><p>{post.description}</p>
      </GlassSurface>)}</div>
    </section>

    <section className={styles.discovery} aria-label="Keep exploring">
      <GlassSurface className={styles.discoveryCard}><Braces size={28} /><h2>A little room to play.</h2><p>Useful tools, small experiments, and ideas worth testing.</p><Link href="/v2/lab">Enter the lab <ArrowUpRight size={17} /></Link></GlassSurface>
      <GlassSurface className={styles.discoveryCard}><BookOpen size={28} /><h2>Ideas I keep close.</h2><p>Books about systems, software, and seeing things differently.</p><Link href="/v2/library">Browse the library <ArrowUpRight size={17} /></Link></GlassSurface>
    </section>

    <section className={styles.closing}><p className={styles.eyebrow}>GOOD WORK STARTS WITH A CONVERSATION</p><h2>Let’s make<br /><span>something matter.</span></h2><Link href="/v2/contact" className={styles.primary}>Say hello <ArrowUpRight size={18} /></Link></section>
  </div>;
}
