import type { Metadata } from "next";
import Link from "next/link";
import { getProfile } from "@/lib/content";
import { ContactForm } from "@/components/contact-form";
import { parseConnectIntent } from "@/features/studio/contact/intent";
import { ChapterLink } from "@/features/studio/components/chapter-link";
import styles from "@/features/studio/components/studio.module.css";

export const metadata: Metadata = {
  title: "Connect | Founder’s Engineering Lab",
  alternates: { canonical: "/studio/connect" },
};
const contexts = {
  cofound:
    "Cofound · explore a shared problem and a possible working relationship.",
  invest: "Invest · discuss an early hypothesis and its next validation step.",
  partner: "Partner · collaborate on a practical engineering problem.",
};
export default async function StudioConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string | string[] }>;
}) {
  const [query, profile] = await Promise.all([searchParams, getProfile()]);
  const intent = parseConnectIntent(query.intent);
  return (
    <article className={styles.modulePage}>
      <ChapterLink
        chapter="studio-ventures"
        className={styles.eyebrow}
        aria-label="Back to the lab"
      >
        ← Back to the lab
      </ChapterLink>
      <h1>Start a conversation.</h1>
      <p className={styles.moduleIntro}>
        Bring a concrete problem, a question worth testing, or a useful point of
        view. We can find a sensible next step together.
      </p>
      <div className={styles.status} data-connect-intent={intent ?? "general"}>
        {intent
          ? contexts[intent]
          : "General conversation · tell me what you have in mind."}
      </div>
      <div className={styles.connectGrid}>
        <section
          className={styles.contactFrame}
          aria-label="Personal contact form"
        >
          <span className={styles.eyebrow}>
            PERSONAL CONTACT / REAL MESSAGE
          </span>
          <h2>What are you thinking about?</h2>
          <p>
            A successful confirmation means your message was saved for a reply.
          </p>
          <ContactForm email={profile.email} />
        </section>
        <aside className={styles.contactAside}>
          <span className={styles.eyebrow}>{profile.name}</span>
          <h2>Good work starts with a clear question.</h2>
          <p>
            {profile.role}
            <br />
            {profile.location}
          </p>
          <a className={styles.contactEmail} href={`mailto:${profile.email}`}>
            {profile.email} ↗
          </a>
          <hr />
          <p>
            The Venture Lab ideas are still hypotheses. The next step is
            validation with people; no users or revenue are claimed.
          </p>
          <Link href="/" className={styles.action}>
            Explore my portfolio ↗
          </Link>
        </aside>
      </div>
    </article>
  );
}
