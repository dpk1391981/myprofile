import Link from "next/link";
import { IconBrandGithub, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import { FOOTER_NAV } from "./utils/site-data";
import { PERSONAL_INFO } from "./utils/portfolio-data";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bs-footer" role="contentinfo">
      <div className="bs-rail-hair" />
      <div className="bs-footer-grid">
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em" }}>
            {PERSONAL_INFO.fullName}
          </p>
          <p className="bs-small bs-quiet bs-mt-1" style={{ maxWidth: "34ch" }}>
            Senior Software Engineer in New Delhi, India — MERN stack, Next.js and Generative AI.
            Available for senior roles and contract work, on-site in Delhi NCR or fully remote.
          </p>
          <div className="bs-socials bs-mt-3">
            <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <IconBrandGithub size={21} />
            </a>
            <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <IconBrandLinkedin size={21} />
            </a>
            <a href={PERSONAL_INFO.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <IconBrandX size={21} />
            </a>
          </div>
        </div>

        {FOOTER_NAV.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="bs-footer-col-title">{col.title}</p>
            <div className="bs-footer-links">
              {col.links.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </div>
          </nav>
        ))}
      </div>

      <div className="bs-footer-base">
        <p>© {year} Deepak Kumar · officialdeepak.in</p>
        <p>New Delhi, India · IST (UTC+5:30)</p>
      </div>
    </footer>
  );
};

export default Footer;
