import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getProfile } from "@/lib/content";
import { PageHeading } from "@/components/ui/page-heading";
import { ContactForm } from "@/components/contact-form";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a project, a question, or an idea? Get in touch with Namazbek Bekzhanov.",
};

export default async function ContactPage() {
  const profile = await getProfile();
  return (
    <>
      <PageHeading
        eyebrow="06 / SAY HELLO"
        title="Good things start with a conversation."
      >
        <p>
          A data challenge, an interesting project, or an idea you can’t stop
          thinking about — I’d love to hear it.
        </p>
      </PageHeading>
      <section className="contact-layout">
        <div className="contact-info">
          <p className="eyebrow">DIRECT LINE</p>
          <a className="contact-email" href={`mailto:${profile.email}`}>
            {profile.email}
            <ArrowUpRight size={21} />
          </a>
          <p>
            {profile.location}
            <br />
            UTC +05:00
          </p>
          <div className="contact-socials">
            {Object.entries(profile.links).map(([name, link]) => (
              <a
                key={name}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name === "telegram"
                  ? "Telegram channel"
                  : name === "github"
                    ? "GitHub"
                    : "LinkedIn"}
                <ArrowUpRight size={17} />
              </a>
            ))}
          </div>
          <details className="other-emails">
            <summary>Other email addresses</summary>
            <a href={`mailto:${profile.secondaryEmail}`}>
              {profile.secondaryEmail}
            </a>
            <a href={`mailto:${profile.workEmail}`}>{profile.workEmail}</a>
          </details>
          <div className="availability">
            <span className="status-dot" />
            <span>{profile.availability}</span>
          </div>
        </div>
        <ContactForm email={profile.email} />
      </section>
    </>
  );
}
