import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getProfile } from "@/lib/content";
import { PageHeading } from "@/components/ui/page-heading";
import { ContactForm } from "@/components/contact-form";
import { SocialProfileLink } from "@/components/ui/social-profile-link";
import { socialPlatforms } from "@/content/social-profiles";
import { AmbientBackdrop } from "@/components/ui/scroll-story";

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
        <AmbientBackdrop className="contact-info">
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
            {socialPlatforms.map((name) => (
              <SocialProfileLink
                key={name}
                platform={name}
                href={profile.links[name]}
              >
                {name === "telegram"
                  ? "Telegram channel"
                  : name === "github"
                    ? "GitHub"
                    : "LinkedIn"}
                <ArrowUpRight size={17} />
              </SocialProfileLink>
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
        </AmbientBackdrop>
        <ContactForm email={profile.email} />
      </section>
    </>
  );
}
