import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Braces,
  LibraryBig,
  MapPin,
} from "lucide-react";
import {
  getExperience,
  getPosts,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/content";
import { DataSculpture } from "@/components/home/data-sculpture";
import { HeroArtFrame, HeroTitle, KineticTechnologyRail } from "@/components/home/hero-motion";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/page-heading";
import { ProjectCard } from "@/components/content/project-card";
import { PostCard } from "@/components/content/post-card";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { PhotoGallery } from "@/components/gallery/photo-gallery";
import { galleryPhotos } from "@/content/gallery";
import { AmbientBackdrop } from "@/components/ui/scroll-story";

export const revalidate = 300;

export default async function HomePage() {
  const [profile, projects, posts, experience, skills] = await Promise.all([
    getProfile(),
    getProjects(),
    getPosts(),
    getExperience(),
    getSkills(),
  ]);
  const featured = [
    ...projects.filter((project) => project.featured),
    ...projects.filter((project) => !project.featured),
  ].slice(0, 2);
  const current = experience.find((role) => role.id === "nbk") ?? experience[0];
  return (
    <>
      <section className="home-hero">
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span className="status-dot" />
            {profile.availability} <span className="eyebrow-divider">/</span>{" "}
            DATA ENGINEER & BUILDER
          </p>
          <HeroTitle />
          <p className="hero-description">
            I’m {profile.shortName}. I turn complex data into
            <br className="desktop-break" /> reliable systems — and good ideas
            into things that work.
          </p>
          <div className="hero-actions">
            <Link href="/projects" className="button button-primary">
              Explore my work <ArrowUpRight size={19} />
            </Link>
            <Link href="/about" className="button button-text">
              A little about me <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-location mono">
            <MapPin size={14} />
            {profile.location}
            <span>43.2389° N · 76.8897° E</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-topline mono">
            <span>DATA IN MOTION</span>
            <span>FIG. 001</span>
          </div>
          <HeroArtFrame><DataSculpture /></HeroArtFrame>
          <div className="art-bottomline mono">
            <span>
              <span className="status-dot" /> FROM SIGNAL TO SYSTEM
            </span>
            <span>PYTHON / SQL / DBT</span>
          </div>
        </div>
        <div className="hero-bottom">
          <span className="mono">BUILDING RESILIENT DATA SYSTEMS</span>
          <a
            href="#selected-work"
            className="scroll-cue"
            aria-label="Scroll to selected work"
          >
            <span className="mono">SCROLL TO EXPLORE</span>
            <ArrowDown size={17} />
          </a>
        </div>
      </section>
      <KineticTechnologyRail />
      <section className="content-section" id="selected-work">
        <Reveal>
          <SectionHeading number="01" title="Selected work">
            <Link href="/projects" className="text-link">
              All projects <ArrowUpRight size={17} />
            </Link>
          </SectionHeading>
          <div className="project-grid">
            {featured.map((project, index) => (
              <ProjectCard
                project={project}
                key={project.id}
                index={index}
                visual
              />
            ))}
          </div>
        </Reveal>
      </section>
      <section className="content-section about-preview">
        <Reveal className="about-preview-grid">
          <div>
            <p className="eyebrow">02 / THE PERSON BEHIND THE PIPELINES</p>
            <h2>
              Engineered with care.
              <br />
              <span className="muted-heading">Built for the real world.</span>
            </h2>
            <Link href="/about" className="text-link">
              Meet Namazbek <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="about-preview-copy">
            <p>{profile.philosophy}</p>
            {current && (
              <div className="current-role">
                <span className="status-dot" />
                <div>
                  <strong>{current.role}</strong>
                  <span>{current.organization}</span>
                </div>
              </div>
            )}
            <div className="mini-expertise">
              {skills.slice(0, 3).map((group) => (
                <span key={group.id}>{group.category}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
      <section className="content-section">
        <Reveal>
          <SectionHeading number="03" title="Notes from the field">
            <Link href="/writing" className="text-link">
              All writing <ArrowUpRight size={17} />
            </Link>
          </SectionHeading>
          <div className="post-list">
            {posts.slice(0, 3).map((post, index) => (
              <PostCard post={post} index={index} key={post.slug} />
            ))}
          </div>
        </Reveal>
      </section>
      <section className="discovery-grid content-section">
        <Reveal><InteractiveCard className="discovery-card">
          <p className="eyebrow">04 / PLAY & EXPERIMENT</p>
          <h2>
            A small lab.
            <br />A lot of curiosity.
          </h2>
          <p>
            Useful little tools for the everyday work of building things. Try an
            idea, follow a signal, connect the dots.
          </p>
          <Link href="/lab" className="text-link">
            Enter the lab <ArrowUpRight size={18} />
          </Link>
          <Braces
            className="discovery-art"
            size={125}
            strokeWidth={1}
            aria-hidden="true"
          />
        </InteractiveCard></Reveal>
        <Reveal delay={80}><InteractiveCard className="discovery-card discovery-card-library">
          <p className="eyebrow">05 / THE BOOKSHELF</p>
          <h2>
            Ideas worth
            <br />
            keeping close.
          </h2>
          <p>
            Systems thinking, software craftsmanship, and the books that help me
            see the work a little differently.
          </p>
          <Link href="/library" className="text-link">
            Browse my library <ArrowUpRight size={18} />
          </Link>
          <LibraryBig
            className="discovery-art library-art"
            size={155}
            strokeWidth={1}
            aria-hidden="true"
          />
        </InteractiveCard></Reveal>
      </section>
      <section className="home-gallery content-section">
        <PhotoGallery photos={galleryPhotos} title="More than the work." intro="A few portraits from my personal archive. Another way to get to know the person behind the projects." />
        <Link href="/gallery" className="text-link">Explore the gallery <ArrowUpRight size={17} /></Link>
      </section>
      <section className="contact-banner">
        <AmbientBackdrop><Reveal>
          <p className="eyebrow">
            <span className="status-dot" /> GOOD WORK STARTS WITH A CONVERSATION
          </p>
          <h2>
            Let’s build
            <br />
            something that lasts<span>.</span>
          </h2>
          <Link href="/contact" className="button button-primary">
            Get in touch <ArrowUpRight size={19} />
          </Link>
        </Reveal></AmbientBackdrop>
      </section>
    </>
  );
}
