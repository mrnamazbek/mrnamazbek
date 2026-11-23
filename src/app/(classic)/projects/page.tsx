import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getProjects } from "@/lib/content";
import { PageHeading } from "@/components/ui/page-heading";
import { ProjectList } from "@/components/content/filterable-lists";
import { SocialProfileLink } from "@/components/ui/social-profile-link";
import { ProjectShowcase } from "@/components/content/project-showcase";
import { engineeringWork } from "@/features/engineering/work";
import styles from "@/features/engineering/engineering.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source work and experiments in data engineering, software, and everyday developer tools.",
};
export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeading
        eyebrow="02 / WORK & EXPERIMENTS"
        title="Built to learn. Made to be used."
      >
        <p>
          Public repositories, side projects, and experiments. A working
          collection of the things I’m curious enough to build.
        </p>
        <nav className={styles.caseLinks} aria-label="Engineering case studies">
          {engineeringWork.map((work) => (
            <Link href={`/projects/${work.slug}`} className="text-link" key={work.slug}>
              {work.title} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </nav>
        <SocialProfileLink
          platform="github"
          className="text-link"
        >
          Follow the work on GitHub <ArrowUpRight size={17} />
        </SocialProfileLink>
      </PageHeading>
      <ProjectShowcase projects={projects.filter(project => project.featured).slice(0, 4)} />
      <section id="repository-index" aria-label="Repository index">
        <ProjectList projects={projects} />
      </section>
      <p className="source-note mono">
        Repository metadata captured {projects[0]?.capturedAt ?? "from GitHub"}.
        Open a repository for its latest activity.
      </p>
    </>
  );
}
