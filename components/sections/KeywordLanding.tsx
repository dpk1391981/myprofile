import Link from "next/link";
import { IconArrowUpRight, IconCornerDownRight } from "@tabler/icons-react";
import PageHeader from "../bs/PageHeader";
import { PortraitFigure } from "../bs/HeadFigure";
import Jsonld from "../bs/Jsonld";
import Faq from "./Faq";
import HireCta from "./HireCta";
import SelectedWork from "./SelectedWork";
import Recommendations from "./Recommendations";
import SectionHead from "./SectionHead";
import type { LandingPage } from "../utils/site-data";
import { breadcrumbLd, faqLd } from "../utils/seo";
import { listAllPosts, type PortfolioPost } from "../utils/portfolio-api";

/** One keyword landing page, rendered from its LANDING_PAGES entry. */
/*
  "a" vs "an" for the keyword in the FAQ heading.

  Hardcoding "a" read fine for every keyword this template had when it was
  written (React, JavaScript, full stack, software, AI) and broke the moment a
  page targeted an initialism: "Hiring a LLM engineer in India".

  The rule is PRONUNCIATION, not spelling — "an LLM" because the letter L is
  said "el", while "a UI developer" keeps "a" because U is said "you". A bare
  vowel check gets both of those wrong, so the initialism case is handled by
  the sound of its first letter and everything else falls back to the vowel.
*/
const VOWEL_SOUND_LETTERS = new Set(["A", "E", "F", "H", "I", "L", "M", "N", "O", "R", "S", "X"]);

function indefiniteArticle(phrase: string): string {
  const first = phrase.trim().split(/\s+/)[0] ?? "";
  // An initialism — two or more capitals, e.g. "LLM", "AI", "UI".
  if (/^[A-Z]{2,}$/.test(first)) {
    return VOWEL_SOUND_LETTERS.has(first[0]) ? "an" : "a";
  }
  return /^[aeiou]/i.test(first) ? "an" : "a";
}

/*
  "Writing on this" — the landing page's links into the blog.

  These six pages are the site's strongest internal-link sources after the
  home page, and they linked to no article at all, so most of the archive was
  reachable only through /blog's numbered pages. Linking from here gives the
  articles a short crawl path and tells Google which posts belong to which
  skill.

  Ranked by readers, not recency: a hire page should vouch for the posts
  people actually read, and the newest post on a topic is often the weakest.
  Ties fall back to newest. Fetched at the page's own 86400s so this section
  does not drag the route below its daily revalidate (in Next 14 the shortest
  fetch wins). Degrades to no section if the agent service is unavailable.
*/
const BLOG_LINKS = 6;

async function topicPosts(topics: string[]): Promise<PortfolioPost[]> {
  if (!topics.length) return [];
  const wanted = new Set(topics.map((t) => t.toLowerCase()));
  const all = await listAllPosts(86400);
  return all
    .filter((p) => !/noindex/i.test(p.robots || ""))
    .filter((p) => [p.category, ...(p.tags || [])].some((t) => wanted.has(String(t).toLowerCase())))
    .sort(
      (a, b) =>
        (b.views ?? 0) - (a.views ?? 0) ||
        String(b.publishedAt ?? b.date ?? "").localeCompare(String(a.publishedAt ?? a.date ?? ""))
    )
    .slice(0, BLOG_LINKS);
}

export default async function KeywordLanding({ page }: { page: LandingPage }) {
  const posts = await topicPosts(page.blogTopics);
  return (
    <>
      <Jsonld
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: page.keyword, path: `/${page.slug}` },
        ])}
      />
      <Jsonld data={faqLd(page.faqs)} />

      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: page.keyword }]}
        dateline={["Hire", "New Delhi, India · Remote friendly", "Open to senior & contract work"]}
        kicker={page.kicker}
        title={page.h1}
        lede={page.lede}
        /* A hire page is read by someone deciding whether to write to a
           person, so the figure here is the person — same portrait, caption,
           and profile links as /about. The stack terms come from the page's
           own kicker, so each landing page captions itself. */
        figure={<PortraitFigure caption={`Deepak Kumar, New Delhi. ${page.kicker}.`} />}
      >
        {/* In the head rather than in a band under it: the portrait is taller
            than the headline and lede together, so this column was ending
            half a screen early on every one of these pages. */}
        <div className="bs-proof bs-proof--half bs-mt-6">
          {page.proof.map((f) => (
            <div key={f.label}>
              <p className="bs-proof-value">{f.value}</p>
              <p className="bs-proof-label">{f.label}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      {/*
        Side-head, not heading-over-text. Each of these sections was a 24ch
        headline above a 62ch paragraph above a 72ch list, all hard against the
        left margin — three sections of that is three screens of half-empty
        page. The heading now holds its own column and the prose runs beside
        it, which uses the measure the design already has and cuts the run
        roughly in half. Below 1024px it stacks back to heading-over-text.
      */}
      {page.sections.map((s) => (
        <section key={s.heading} className="bs-wrap bs-section">
          <div className="bs-split bs-sidehead">
            <h2 className="bs-h2">{s.heading}</h2>
            <div>
              <p className="bs-body-text" style={{ fontSize: 17 }}>{s.body}</p>
              {s.bullets?.length ? (
                <ul className="bs-arrow-list bs-mt-5">
                  {s.bullets.map((b) => (
                    <li key={b}>
                      <IconCornerDownRight size={15} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      <SelectedWork limit={4} showMore />
      <Recommendations />

      {posts.length > 0 && (
        <section className="bs-wrap bs-section">
          <SectionHead kicker="From the blog" title="What I have written on this." />
          <div className="bs-mt-5">
            {posts.map((p) => (
              <div key={p.slug} className="bs-list-row">
                <IconArrowUpRight size={18} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 3 }} />
                <div>
                  <Link href={`/blog/${p.slug}`} style={{ fontSize: 17, fontWeight: 600 }}>{p.title}</Link>
                  {p.description ? <p className="bs-body-text" style={{ fontSize: 15, marginTop: 4 }}>{p.description}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Faq
        items={page.faqs}
        kicker="Straight answers"
        title={`Hiring ${indefiniteArticle(page.keyword)} ${page.keyword} — the usual questions.`}
        id={`${page.slug}-faq`}
      />

      <section className="bs-wrap bs-section">
        <SectionHead kicker="Related" title="Other ways people search for this." />
        <div className="bs-mt-5">
          {page.related.map((r) => (
            <div key={r.href} className="bs-list-row">
              <IconArrowUpRight size={18} style={{ color: "var(--spot)", flexShrink: 0, marginTop: 3 }} />
              <Link href={r.href} style={{ fontSize: 17, fontWeight: 600 }}>{r.label}</Link>
            </div>
          ))}
        </div>
      </section>

      <HireCta />
    </>
  );
}
