import Image from "next/image";
import SocialIconLink from "@/components/shared/SocialIconLink";
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
import { EXPERIENCES, FOOTER, PERSONAL_INFO } from "../utils/portfolio-data";
import { listPosts } from "../utils/portfolio-api";
import { listBooks } from "../utils/books-api";
import { formatISTDate } from "../utils/date";
import { getHomePosts } from "./TechBlogs";

/** Same freshness as the page itself (app/page.tsx). */
const FEED_REVALIDATE = 900;

/* The hero's side column: the current role, then what is new — the two newest
   posts not already in the Tech Blogs strip, and the latest book. Not past
   employers: the Career section directly below lists every one of them. Not a contact block: the hero's own buttons
   are the contact block. Both reads degrade to [] when the API is down, and
   each block simply drops out rather than showing an empty frame. */
async function HeroRail() {
  const current = EXPERIENCES.find((e) => e.isCurrent);
  const [{ posts }, books, strip] = await Promise.all([
    listPosts({ limit: 8, revalidate: FEED_REVALIDATE }),
    listBooks(),
    getHomePosts(),
  ]);
  // Skip whatever the Tech Blogs strip further down already shows. Two links
  // to the same post from one page add nothing; two links to two more posts
  // put two more of them one hop from the front page. The strip's reads are
  // the same fetches, so Next dedupes them within the render.
  const shown = new Set(strip ? [strip.lead.slug, ...strip.rows.map((p) => p.slug)] : []);
  const latest = posts
    .filter((p) => !p.noIndex && !p.robots?.toLowerCase().includes("noindex"))
    .filter((p) => !shown.has(p.slug))
    .slice(0, 2);
  const book = [...books].sort(
    (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
  )[0];

  return (
    <aside className="bs-side" aria-label="Currently and new">
      {current ? (
        <a href={current.url} target="_blank" rel="noopener noreferrer" className="bs-side-current">
          <p className="bs-eyebrow">Currently</p>
          <div className="bs-side-current-row">
            <Image src={current.logo} alt={current.logoAlt} width={44} height={44} className="bs-logo" />
            <div>
              <p className="bs-side-title">{current.company}</p>
              <p className="bs-small bs-quiet">
                {current.role} · since {current.dateLabel.split(" - ")[0]}
              </p>
            </div>
          </div>
        </a>
      ) : null}

      {latest.length ? (
        <div className="bs-side-block">
          <p className="bs-eyebrow">New on the blog</p>
          <ul className="bs-side-list">
            {latest.map((p) => {
              const date = (p.date || p.publishedAt || "").slice(0, 10);
              return (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="bs-side-link">{p.title}</Link>
                  <p className="bs-side-meta">
                    {date ? <time dateTime={date}>{formatISTDate(date)}</time> : null}
                    {p.readTime ? ` · ${p.readTime}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
          <Link href="/blog" className="bs-side-more">All articles →</Link>
        </div>
      ) : null}

      {book ? (
        <div className="bs-side-block">
          <p className="bs-eyebrow">Latest book</p>
          <Link href={`/books/${book.slug}`} className="bs-side-book">
            <span className="bs-side-book-cover" aria-hidden="true">{book.coverEmoji || "📘"}</span>
            <span>
              <span className="bs-side-link">{book.title}</span>
              <span className="bs-side-meta">
                {book.chapters} chapters{book.pages ? ` · ${book.pages} pages` : ""} · Free to read
              </span>
            </span>
          </Link>
        </div>
      ) : null}
    </aside>
  );
}

/** The front page: dateline rail, headline beside the current role and what is new, proof figures. */
export default function Hero() {
  const [ledeBefore, ledeAfter] = HERO.lede.split("India Today Group");

  return (
    <section className="bs-wrap bs-head-top" id="top">
      <div className="bs-rail-thick" />
      <div className="bs-dateline">
        <span>{DATELINE.left}</span>
        <span>{DATELINE.centre}</span>
        {/* The only social links in the head, so the profiles are reachable
            before any scroll. */}
        <span className="bs-socials bs-dateline-social">
          <SocialIconLink href={PERSONAL_INFO.social.github} network="GitHub" location="hero_dateline">
            <IconBrandGithub size={16} />
          </SocialIconLink>
          <SocialIconLink href={PERSONAL_INFO.social.linkedin} network="LinkedIn" location="hero_dateline">
            <IconBrandLinkedin size={16} />
          </SocialIconLink>
          <SocialIconLink href={PERSONAL_INFO.social.twitter} network="X" location="hero_dateline" label="X (Twitter) profile">
            <IconBrandX size={16} />
          </SocialIconLink>
        </span>
      </div>
      <div className="bs-rail-thin" />

      {/* No portrait: it doubled the height of the head. It still shows on
          /about and on blog bylines, and the Person schema points at the file
          directly, so image search and the Knowledge Panel keep their source.
          The right track is the current role and what is new: the home page
          is the most-linked page on the site, and linking the newest posts
          and book from its first screen is the shortest crawl path to them. */}
      <div className="bs-head-body">
        <div className="bs-split">
          <div>
            {/* The name and role open the H1 itself, as a kicker line. The
                tagline alone named neither, and the H1 is the heading Google
                weighs most for "Deepak Kumar" and "software engineer India";
                the <title> already leads with the same words, so the two now
                agree. Inside the h1, not an eyebrow above it, or it does not
                count as part of the heading. */}
            <h1 className="bs-h1" style={{ fontSize: "clamp(2rem, 4.2vw, 3.2rem)" }}>
              <span className="bs-h1-kicker">Deepak Kumar · Software &amp; AI Engineer in India</span>
              {HERO.headlineParts.lead}{" "}
              <span className="bs-h1-accent">{HERO.headlineParts.accent}</span>{" "}
              {HERO.headlineParts.tail}
            </h1>

            <p className="bs-lede bs-mt-4" style={{ maxWidth: "58ch" }}>
              {ledeBefore}
              <a href={PERSONAL_INFO.currentWork.url} target="_blank" rel="noopener noreferrer">
                India&nbsp;Today&nbsp;Group
              </a>
              {ledeAfter}
            </p>

            <div className="bs-actions bs-mt-4">
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
          </div>
          <HeroRail />
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
    </section>
  );
}
