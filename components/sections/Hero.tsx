import Image from "next/image";
import Link from "next/link";
import {
  IconDownload,
  IconMail,
  IconCalendarEvent,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import { DATELINE, HERO, PROOF } from "../utils/site-data";
import { FOOTER, PERSONAL_INFO } from "../utils/portfolio-data";

/** The front page: dateline rail, headline, proof figures, portrait. */
export default function Hero() {
  const [ledeBefore, ledeAfter] = HERO.lede.split("India Today Group");

  return (
    <section className="bs-wrap" id="top" style={{ paddingTop: 26 }}>
      <div className="bs-rail-thick" />
      <div className="bs-dateline">
        <span>{DATELINE.left}</span>
        <span>{DATELINE.centre}</span>
        {/* Social also appears under the portrait further down this column;
            repeated here so the profiles are reachable before any scroll. */}
        <span className="bs-socials bs-dateline-social">
          <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <IconBrandGithub size={16} />
          </a>
          <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <IconBrandLinkedin size={16} />
          </a>
          <a href={PERSONAL_INFO.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
            <IconBrandX size={16} />
          </a>
        </span>
      </div>
      <div className="bs-rail-thin" />

      <div className="bs-split" style={{ paddingTop: 56 }}>
        <div>
          <h1 className="bs-h1" style={{ maxWidth: "22ch" }}>
            {HERO.headlineParts.lead}{" "}
            <span className="bs-h1-accent">{HERO.headlineParts.accent}</span>{" "}
            {HERO.headlineParts.tail}
          </h1>

          <p className="bs-lede bs-mt-5" style={{ maxWidth: "52ch" }}>
            {ledeBefore}
            <a href={PERSONAL_INFO.currentWork.url} target="_blank" rel="noopener noreferrer">
              India&nbsp;Today&nbsp;Group
            </a>
            {ledeAfter}
          </p>

          <div className="bs-actions bs-mt-5">
            <a
              href={FOOTER.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="bs-btn bs-btn--solid"
            >
              <IconDownload size={17} /> Download resume
            </a>
            <Link href="/contact" className="bs-btn bs-btn--outline">
              <IconCalendarEvent size={17} /> Book a 20-min call
            </Link>
            {PERSONAL_INFO.email ? (
              <a href={`mailto:${PERSONAL_INFO.email}`} className="bs-btn bs-btn--ghost">
                <IconMail size={17} /> Email me
              </a>
            ) : null}
          </div>

          <div className="bs-proof bs-mt-6">
            {PROOF.map((f) => (
              <div key={f.label}>
                <p className="bs-proof-value">{f.value}</p>
                <p className="bs-proof-label">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* The <figure> wraps image AND caption; .bs-halftone is now an inner
              box so its overflow clip applies to the portrait only. A
              figcaption outside its figure is invalid HTML and loses the
              caption-to-image association that image search reads. */}
          <figure className="bs-figure">
            <div className="bs-halftone" style={{ width: "100%", aspectRatio: "4 / 5", position: "relative" }}>
              <Image
                src="/assets/images/deepak-kumar-react-developer-india.jpg"
                alt="Deepak Kumar, senior React developer and software engineer in India, at India Today Group in New Delhi"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 380px"
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
            </div>
            <figcaption className="bs-figcaption">{HERO.captions.photo}</figcaption>
          </figure>

          <div className="bs-mt-5" style={{ paddingTop: 20, borderTop: "1px solid var(--hair)" }}>
            <p className="bs-eyebrow">Currently</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
              <Image
                src={PERSONAL_INFO.currentWork.logo}
                alt={PERSONAL_INFO.currentWork.company}
                width={38}
                height={38}
                className="bs-logo"
              />
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>
                  {PERSONAL_INFO.currentWork.company}
                </p>
                <p className="bs-small bs-quiet">{PERSONAL_INFO.currentWork.role} · May 2025 →</p>
              </div>
            </div>
            <p className="bs-small bs-quiet bs-mt-2">
              Editorial AI tooling, election dashboards and video CMS components — OpenAI and
              LangChain for automation, MERN underneath.
            </p>
          </div>

          <div className="bs-socials bs-mt-4">
            <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <IconBrandGithub size={22} />
            </a>
            <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <IconBrandLinkedin size={22} />
            </a>
            <a href={PERSONAL_INFO.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
              <IconBrandX size={22} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
