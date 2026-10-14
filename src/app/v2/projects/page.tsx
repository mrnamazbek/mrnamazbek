import type { Metadata } from "next";
import { getProjects } from "@/lib/content";
import { CollectionHeading, GlassProjects } from "@/components/liquid-glass/collections";
import styles from "@/components/liquid-glass/collections.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Projects · Liquid Glass",
  description: "Namazbek’s open-source work, software experiments, and data engineering projects in a new Liquid Glass view.",
  alternates: { canonical: "/projects" },
};

export default async function GlassProjectsPage() {
  const projects = await getProjects();
  return (
    <div className={styles.page}>
      <CollectionHeading
        eyebrow="Work & experiments"
        title="Curiosity, made tangible."
        count={projects.length}
        countLabel="projects"
      >
        <p>
          Public repositories, useful tools, and ideas worked through in code.
          A collection of the things I’m curious enough to build.
        </p>
      </CollectionHeading>
      <GlassProjects projects={projects} />
    </div>
  );
}
