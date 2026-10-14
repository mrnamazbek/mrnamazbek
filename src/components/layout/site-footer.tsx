import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SocialProfileLink } from "@/components/ui/social-profile-link";
import { BackToTopLink } from "@/components/ui/magnetic-link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link href="/" className="footer-wordmark">
          Keep building<span>.</span>
        </Link>
        <div className="footer-links">
          <SocialProfileLink platform="github">
            GitHub <ArrowUpRight size={14} />
          </SocialProfileLink>
          <SocialProfileLink platform="linkedin">
            LinkedIn <ArrowUpRight size={14} />
          </SocialProfileLink>
          <SocialProfileLink platform="telegram">
            Telegram <ArrowUpRight size={14} />
          </SocialProfileLink>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getUTCFullYear()} Namazbek Bekzhanov</span>
        <span>Made with intent. Built to evolve.</span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Editions reset document-scoped theme and rendering state. */}
        <a href="/v2">Liquid Glass edition <ArrowUpRight size={12} /></a>
        <BackToTopLink />
      </div>
    </footer>
  );
}
