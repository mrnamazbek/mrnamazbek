import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link href="/" className="footer-wordmark">
          Keep building<span>.</span>
        </Link>
        <div className="footer-links">
          <a
            href="https://github.com/mrnamazbek"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <ArrowUpRight size={14} />
          </a>
          <a
            href="https://linkedin.com/in/namazbek-bekzhanov"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn <ArrowUpRight size={14} />
          </a>
          <a
            href="https://t.me/tech_digest_kz"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getUTCFullYear()} Namazbek Bekzhanov</span>
        <span>Made with intent. Built to evolve.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
