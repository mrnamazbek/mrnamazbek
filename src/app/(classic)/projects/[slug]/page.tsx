import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { engineeringWork } from "@/features/engineering/work";
import { WorkVisual } from "@/features/engineering/work-visual";
import styles from "@/features/engineering/engineering.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return engineeringWork.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = engineeringWork.find((item) => item.slug === slug);
  if (!work) return {};
  return {
    title: work.title,
    description: work.summary,
    alternates: { canonical: `/projects/${work.slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const index = engineeringWork.findIndex((item) => item.slug === slug);
  const work = engineeringWork[index];
  if (!work) notFound();
  const next = engineeringWork[(index + 1) % engineeringWork.length];

  return (
    <article className={`${styles.section} ${styles.caseStudy}`}>
      <Link href="/#selected-work" className="text-link"><ArrowLeft size={17} aria-hidden="true" /> Selected work</Link>
      <header className={styles.caseHead}>
        <p className={styles.discipline}>{work.discipline}</p>
        <h1>{work.title}</h1>
        <p>{work.summary}</p>
        <ul className={styles.stack} aria-label="Technology stack">
          {work.stack.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </header>
      <WorkVisual work={work} />
      <div className={styles.caseBody}>
        <section>
          <h2>The problem</h2>
          <p>{work.problem}</p>
        </section>
        <section>
          <h2>How it works</h2>
          <ol className={styles.caseFlow} aria-label="Workflow">
            {work.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          {work.decisions.map(([title, copy]) => (
            <div className={styles.decision} key={title}><h3>{title}</h3><p>{copy}</p></div>
          ))}
        </section>
        <section>
          <h2>What I’d test next</h2>
          <p>{work.lesson}</p>
        </section>
      </div>
      <div className={styles.caseActions}>
        <a className="text-link" href={work.source}>View source <ArrowUpRight size={17} aria-hidden="true" /></a>
        <Link className="text-link" href={work.lab[0]}>{work.lab[1]} <ArrowUpRight size={17} aria-hidden="true" /></Link>
        <Link className="text-link" href={`/writing/${work.log[0]}`}>{work.log[1]} <ArrowUpRight size={17} aria-hidden="true" /></Link>
        <Link className="text-link" href="/#start-a-project">Discuss a similar project <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
      <Link className={styles.nextCase} href={`/projects/${next.slug}`}>
        <span><small>Next case study</small><strong>{next.title}</strong></span><ArrowRight aria-hidden="true" />
      </Link>
    </article>
  );
}
