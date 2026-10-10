import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Download, MapPin } from "lucide-react";
import {
  getProfile,
  getExperience,
  getEducation,
  getSkills,
  getCertifications,
  getKeywords,
} from "@/lib/content";
import { PageHeading, SectionHeading } from "@/components/ui/page-heading";
import { Reveal } from "@/components/ui/reveal";
import { CareerFocus } from "@/components/content/career-focus";
import { SocialProfileLink } from "@/components/ui/social-profile-link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description:
    "My journey through data engineering, banking infrastructure, teaching, and learning.",
};

export default async function AboutPage() {
  const [profile, experience, education, skills, certifications, keywords] =
    await Promise.all([
      getProfile(),
      getExperience(),
      getEducation(),
      getSkills(),
      getCertifications(),
      getKeywords(),
    ]);
  return (
    <>
      <PageHeading
        eyebrow="01 / ABOUT ME"
        title="Curious by nature. Engineer by practice."
      >
        <p>
          I’m {profile.name}, a {profile.role.toLowerCase()} based in{" "}
          {profile.location}. {profile.bio}
        </p>
      </PageHeading>
      <section className="about-introduction">
        <div className="about-identity">
          <div className="identity-monogram" aria-hidden="true">
            nb<span>.</span>
          </div>
          <p className="eyebrow">
            <MapPin size={14} />
            {profile.location}
          </p>
          <div className="button-row">
            <a
              href={profile.resumeUrl}
              className="button button-primary"
              download
            >
              Download résumé <Download size={17} />
            </a>
            <SocialProfileLink
              platform="linkedin"
              href={profile.links.linkedin}
              className="button button-outline"
            >
              LinkedIn <ArrowUpRight size={17} />
            </SocialProfileLink>
          </div>
        </div>
        <div className="about-statement">
          <h2>
            Correctness first.
            <br />
            <span className="muted-heading">Fast second.</span>
          </h2>
          <p>{profile.philosophy}</p>
          <p>
            My work connects data engineering, backend development, and the
            practical needs of financial infrastructure. Beyond production
            systems, I share what I learn through teaching and my Telegram
            channel.
          </p>
          <Image
            src={profile.signatureUrl}
            alt="Namazbek Bekzhanov’s signature"
            width={180}
            height={60}
            className="signature"
          />
        </div>
      </section>
      <section className="content-section">
        <Reveal>
          <SectionHeading number="02" title="The journey so far" />
          <div className="timeline">
            {experience.map((role) => (
              <article className="timeline-item" key={role.id}>
                <div className="timeline-date mono">
                  {role.period}
                  {role.current && (
                    <span className="tag current-tag">Current</span>
                  )}
                </div>
                <div className="timeline-content">
                  <h3>{role.role}</h3>
                  <p className="timeline-organization">{role.organization}</p>
                  <p className="mono timeline-location">
                    {role.location} · {role.kind}
                  </p>
                  <ul>
                    {role.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <div className="tag-list">
                    {role.technologies.map((tool) => (
                      <span className="tag" key={tool}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="content-section">
        <Reveal>
          <SectionHeading number="03" title="Always a student" />
          <div className="education-grid">
            {education.map((item) => (
              <article className="education-card" key={item.id}>
                <div className="card-topline">
                  <span className="mono">{item.period}</span>
                  <span className="tag">{item.status}</span>
                </div>
                <h3>{item.degree}</h3>
                <strong>{item.institution}</strong>
                <p>{item.description}</p>
                {item.note && <p className="education-note">{item.note}</p>}
              </article>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="content-section">
        <Reveal>
          <SectionHeading number="04" title="Tools of the trade" />
          <div className="skills-grid">
            {skills.map((group) => (
              <article className="skill-group" key={group.id}>
                <p className="eyebrow">{group.category}</p>
                <div className="tag-list">
                  {group.technologies.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="content-section">
        <Reveal>
          <SectionHeading number="05" title="Learning, on record" />
          <div className="certification-list">
            {certifications.map((certification, index) => (
              <article key={certification.id}>
                <span className="mono muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{certification.title}</h3>
                  <p>
                    {certification.issuer}
                    {certification.issued && ` · ${certification.issued}`}
                  </p>
                  {certification.credentialId && (
                    <span className="mono credential">
                      Credential: {certification.credentialId}
                    </span>
                  )}
                </div>
                <ArrowUpRight size={18} />
              </article>
            ))}
          </div>
        </Reveal>
      </section>
      <CareerFocus email={profile.email} />
      <section className="content-section keyword-section">
        <p className="eyebrow">THINGS I’M THINKING ABOUT</p>
        <div className="keyword-cloud">
          {keywords.slice(0, 22).map((word) => (
            <a
              key={word.keyword}
              href={word.link.startsWith("https://") || word.link.startsWith("http://") ? word.link : "/projects"}
              {...(word.link.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {word.keyword}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
