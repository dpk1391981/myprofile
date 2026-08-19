import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import {
  IconArrowLeft, IconArrowRight, IconArrowNarrowRight, IconChevronDown,
  IconBrandTwitter, IconBrandLinkedin, IconBrandWhatsapp, IconBrandGithub,
} from "@tabler/icons-react";
import { getPost as apiGetPost, getSeoConfig } from "@/components/utils/portfolio-api";
import AdSlot from "@/components/blog/AdSlot";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { withHeadingAnchors, countWords, type Heading } from "@/components/utils/article-html";

/**
 * RENDERING STRATEGY. This was `force-dynamic`, which re-fetched the agent
 * service on every hit — including every crawler hit. Nothing on an article
 * page is per-request (no cookies, no session, no personalisation), so the
 * only thing that bought was freshness, and it cost a full upstream round trip
 * of TTFB on the exact request Google measures. ISR gives the same freshness
 * within five minutes and serves the cached HTML instantly in between; an edit
 * in the admin appears on the next revalidation rather than the next reload.
 */
export const revalidate = 300;

const SLOT_TOP     = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP    ?? "2222222222";
const SLOT_MID     = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID    ?? "5555555555";
const SLOT_BOTTOM  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM ?? "3333333333";
const SLOT_SIDEBAR = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR        ?? "4444444444";

const SITE_URL = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

/**
 * Mid-article ad placement.
 *
 * The previous version split the body at the nearest `</p>` to the 45 % mark,
 * which could drop an ad unit into the middle of an argument — and, if a `</p>`
 * ever appeared inside a list item, between an opening `<ol>` and its close,
 * producing broken markup. This splits at a SECTION boundary instead: the
 * `<h2>` closest to the 45 % mark. The reader finishes a section, sees a
 * clearly-labelled ad, and starts the next one — and because `<h2>`s are always
 * top-level in the stored HTML, the two halves are each well-formed.
 *
 * Returns `[whole, ""]` when the article is too short or has too few sections,
 * in which case no mid-article ad renders at all.
 */
const MID_AD_MIN_WORDS = 600;
const MID_AD_MIN_SECTIONS = 4;

function splitAtSectionBoundary(html: string): [string, string] {
  const positions: number[] = [];
  const re = /<h2[\s>]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) positions.push(m.index);

  // The first <h2> is the article's opening section — splitting there would put
  // the ad above all the prose, so only interior boundaries are candidates.
  const candidates = positions.slice(1);
  if (positions.length < MID_AD_MIN_SECTIONS || candidates.length === 0) return [html, ""];

  const target = html.length * 0.45;
  const cut = candidates.reduce((best, p) =>
    Math.abs(p - target) < Math.abs(best - target) ? p : best
  );
  return [html.slice(0, cut), html.slice(cut)];
}

// ── Helpers ───────────────────────────────────────────────────────────────

// The API is the primary source; the hand-written BLOG_POSTS in
// portfolio-data remain the fallback so the older essays keep their URLs and
// the page still renders if the agent service is unreachable.
async function getPost(slug: string) {
  const result = await apiGetPost(slug);
  if (result?.post) {
    const p = result.post;
    return {
      _fromDb:        true,
      slug:           p.slug,
      title:          p.title,
      description:    p.description,
      date:           (p.date || p.publishedAt || "").slice(0, 10),
      updatedAt:      p.updatedAt || p.publishedAt || p.date || "",
      readTime:       p.readTime,
      tags:           p.tags ?? [],
      coverEmoji:     p.coverEmoji,
      featured:       p.featured,
      content:        p.content || "",
      category:       p.category || "",
      // SEO fields
      seoTitle:       p.seoTitle       || "",
      seoDescription: p.seoDescription || "",
      focusKeyword:   p.focusKeyword   || "",
      seoKeywords:    p.seoKeywords    || [],
      ogImage:        p.ogImage        || "",
      canonicalUrl:   p.canonicalUrl   || "",
      robots:         p.robots         || "index, follow",
      noIndex:        !!p.noIndex,
      // Provenance — rendered as an attribution line under the article.
      sourceUrl:      p.sourceUrl      || "",
      sourceTitle:    p.sourceTitle    || "",
      schemaJsonLd:   p.schemaJsonLd   || null,
      faq:            p.faq            || [],
      related:        result.related   || [],
    };
  }
  const sp = getBlogPost(slug);
  if (!sp) return null;
  return { ...sp, _fromDb: false, category: "", updatedAt: sp.date,
    seoTitle: "", seoDescription: "", focusKeyword: "",
    seoKeywords: [] as string[], ogImage: "", canonicalUrl: "", robots: "index, follow", noIndex: false,
    sourceUrl: "", sourceTitle: "", schemaJsonLd: null,
    faq: [] as { question: string; answer: string }[], related: [] as any[] };
}

async function getDefaults() {
  return getSeoConfig("blog-defaults");
}

// `apiRelated` is what the single-post endpoint already returned alongside the
// article — reusing it avoids a second round trip just to fill this rail.
async function getRelated(slug: string, tags: string[], apiRelated: any[] = []) {
  const all: any[] = apiRelated.slice(0, 4).map((p: any) => ({
    slug: p.slug, title: p.title, coverEmoji: p.coverEmoji,
    date: (p.date || p.publishedAt || "").slice(0, 10), readTime: p.readTime,
  }));
  const staticRelated = BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.tags.some((t) => tags.includes(t)) && !all.some((a) => a.slug === p.slug)
  ).slice(0, 4 - all.length);
  return [...all, ...staticRelated].slice(0, 4);
}

// ── Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [post, defaults] = await Promise.all([getPost(params.slug), getDefaults()]);
  if (!post) return {};

  const titleSuffix = defaults?.titleSuffix || ` | ${PERSONAL_INFO.fullName}`;
  const defaultKws  = (defaults?.defaultKeywords || []) as string[];

  const title       = (post.seoTitle || post.title) + titleSuffix;
  const description = post.seoDescription || post.description;
  const kwSet = new Set([post.focusKeyword, ...post.seoKeywords, ...post.tags, ...defaultKws, PERSONAL_INFO.fullName, "blog", "tutorial"].filter(Boolean));
  const keywords = Array.from(kwSet);
  const ogImage     = post.ogImage || defaults?.ogImage || `${SITE_URL}/assets/images/profile-pic-removebg-preview.png`;
  const canonical   = post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;
  const robots      = post.noIndex ? "noindex, nofollow" : (post.robots || "index, follow");
  const [ri, rf]    = robots.split(",").map((s: string) => s.trim());

  return {
    title,
    description,
    keywords,
    authors:  [{ name: PERSONAL_INFO.fullName, url: SITE_URL }],
    creator:  PERSONAL_INFO.fullName,
    category: post.category || undefined,
    openGraph: {
      title:         post.seoTitle || post.title,
      description,
      type:          "article",
      publishedTime: post.date + "T00:00:00+05:30",
      modifiedTime:  post.updatedAt,
      authors:       [PERSONAL_INFO.fullName],
      tags:          [...post.tags, ...(post.seoKeywords || [])],
      url:           canonical,
      siteName:      `${PERSONAL_INFO.fullName} Blog`,
      images:        [{ url: ogImage, width: 1200, height: 630, alt: post.seoTitle || post.title }],
      locale:        "en_IN",
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.seoTitle || post.title,
      description,
      creator:     defaults?.twitterCreator || "@deepakkutniyal",
      images:      [ogImage],
    },
    robots: {
      index:  !ri.includes("noindex"),
      follow: !rf?.includes("nofollow"),
      googleBot: {
        index: !ri.includes("noindex"), follow: !rf?.includes("nofollow"),
        "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      // Every article page advertises the feed, so a reader (or an indexer)
      // that lands on one post can subscribe without going via /blog.
      types: { "application/rss+xml": [{ url: `${SITE_URL}/blog/rss.xml`, title: `${PERSONAL_INFO.fullName} — Engineering Blog` }] },
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // One post fetch, not two: the related rail is derived from the same
  // response, which already carries its siblings.
  const [post, defaults] = await Promise.all([
    getPost(params.slug),
    getDefaults(),
  ]);
  if (!post) notFound();

  const related = await getRelated(post.slug, post.tags, (post as any).related ?? []);

  const postUrl   = `${SITE_URL}/blog/${post.slug}`;
  const ogImage   = post.ogImage || defaults?.ogImage || `${SITE_URL}/assets/images/profile-pic-removebg-preview.png`;
  const wordCount = countWords(post.content);
  const readMins  = parseInt(post.readTime) || Math.max(1, Math.round(wordCount / 225));
  const faq: { question: string; answer: string }[] = (post as any).faq ?? [];

  /*
    Heading anchors are added before anything else touches the body, so the
    contents rail, the mid-article split and the rendered HTML all agree on the
    same ids. See components/utils/article-html.ts for why this happens at
    render time rather than at write time.
  */
  const { html: bodyHtml, headings } = withHeadingAnchors(post.content);
  const tocHeadings: Heading[] = headings.length >= 3 ? headings : [];

  // Mid-article ad — only injected when the article is long enough that
  // the ad does not dominate the page (content > ads ratio stays healthy).
  const [contentFirst, contentSecond] =
    wordCount >= MID_AD_MIN_WORDS ? splitAtSectionBoundary(bodyHtml) : [bodyHtml, ""];
  const hasMidAd = Boolean(contentSecond);

  const publishedLabel = formatDate(post.date);
  const updatedLabel   = post.updatedAt ? formatDate(post.updatedAt.slice(0, 10)) : "";
  const wasUpdated     = Boolean(updatedLabel) && updatedLabel !== publishedLabel;

  // ── Structured data ───────────────────────────────────────────────
  // TechArticle + BreadcrumbList as before, plus two additions:
  //
  //   • FAQPage. The agent already writes an FAQ onto every post and the page
  //     already rendered it as prose, but the matching JSON-LD was never
  //     emitted — the `schemaJsonLd` column was read into the component and
  //     then dropped on the floor. Those question/answer pairs are the part of
  //     an article an answer engine can quote directly, so this is the single
  //     largest AEO gap on the page. It is built from the same `faq` array the
  //     markup below renders, which is what keeps the two from drifting (Google
  //     penalises FAQ markup whose answers are not visible on the page).
  //
  //   • speakable. Points at the standfirst and the FAQ answers — the two
  //     blocks that read correctly aloud out of context.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${postUrl}#article`,
        headline:     post.seoTitle || post.title,
        name:         post.seoTitle || post.title,
        description:  post.seoDescription || post.description,
        url:          postUrl,
        datePublished: post.date + "T00:00:00+05:30",
        dateModified:  post.updatedAt || post.date + "T00:00:00+05:30",
        // One Person, referenced by a stable @id, so this article's author
        // resolves to the same entity the site-wide Person schema in
        // app/seo_config.ts already describes rather than looking like a
        // second, unrelated Deepak Kumar.
        author: {
          "@type": "Person",
          "@id":   `${SITE_URL}/#person`,
          name:    PERSONAL_INFO.fullName,
          url:     SITE_URL,
          jobTitle: PERSONAL_INFO.title,
          image:   `${SITE_URL}${PERSONAL_INFO.profileImage}`,
          worksFor: { "@type": "Organization", name: PERSONAL_INFO.currentWork.company },
          sameAs: [PERSONAL_INFO.social.twitter, PERSONAL_INFO.social.linkedin, PERSONAL_INFO.social.github],
        },
        // Spelled out rather than left as a bare {"@id"} reference: the site
        // Person node lives in a different <script> tag (app/layout.tsx), and
        // Google's Rich Results test reports a missing publisher name when the
        // reference cannot be resolved inside this graph. The @id still merges
        // the two into one entity.
        publisher: {
          "@type": "Person",
          "@id":   `${SITE_URL}/#person`,
          name:    PERSONAL_INFO.fullName,
          url:     SITE_URL,
          logo:    { "@type": "ImageObject", url: `${SITE_URL}${PERSONAL_INFO.profileImage}` },
        },
        image:             { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 },
        mainEntityOfPage:  { "@type": "WebPage", "@id": postUrl },
        keywords:          [post.focusKeyword, ...post.seoKeywords, ...post.tags].filter(Boolean).join(", "),
        articleSection:    post.category || post.tags[0] || "Technology",
        inLanguage:        "en-IN",
        wordCount,
        timeRequired:      `PT${readMins}M`,
        isAccessibleForFree: true,
        // The section headings, so an answer engine can see the article's
        // shape without parsing the body.
        ...(tocHeadings.length
          ? { hasPart: tocHeadings.filter((h) => h.level === 2).map((h) => ({
              "@type": "WebPageElement", name: h.text, url: `${postUrl}#${h.id}`,
            })) }
          : {}),
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".blog-standfirst", ".blog-faq-a"],
        },
        // Provenance, when the piece was written from a named source. Carried
        // over from the agent's own schema block.
        ...((post as any).sourceUrl
          ? { citation: { "@type": "CreativeWork", url: (post as any).sourceUrl,
                          ...((post as any).sourceTitle ? { name: (post as any).sourceTitle } : {}) } }
          : {}),
        ...(post.focusKeyword ? { about: { "@type": "Thing", name: post.focusKeyword } } : {}),
      },
      ...(faq.length
        ? [{
            "@type": "FAQPage",
            "@id": `${postUrl}#faq`,
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog",    item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
        ],
      },
    ],
  };

  const shareLinks = [
    { href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`, label: "Share on X", Icon: IconBrandTwitter },
    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, label: "Share on LinkedIn", Icon: IconBrandLinkedin },
    { href: `https://wa.me/?text=${encodeURIComponent(post.title + " " + postUrl)}`, label: "Share on WhatsApp", Icon: IconBrandWhatsapp },
  ];

  const readNext = related.slice(0, 2);

  return (
    <div className="blog-article-shell" style={{ paddingTop: 30, paddingBottom: 20 }}>
      <ReadingProgress />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Breadcrumb — the visible counterpart of the BreadcrumbList above. */}
      <nav className="bs-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">·</span>
        <Link href="/blog">Blog</Link>
        <span aria-hidden="true">·</span>
        <span>{post.category || "Article"}</span>
      </nav>

      <article itemScope itemType="https://schema.org/TechArticle">

        {/*
          The header now sits inside the grid's main column rather than in its
          own centred `max-w-3xl` wrapper. Previously the headline started
          156px to the right of the prose it introduced — two competing left
          edges on one page. One axis now runs from the kicker to the footer.
        */}
        <div className="blog-article-grid">
          <div className="blog-article-main">

            <header className="blog-article-head">
              <div className="blog-kicker-row">
                <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>{post.coverEmoji}</span>
                {post.category && <span className="blog-category">{post.category}</span>}
                {post.category && <span className="blog-kicker-sep" aria-hidden="true">/</span>}
                <span className="bs-eyebrow">
                  <time dateTime={post.date} itemProp="datePublished">{publishedLabel}</time>
                </span>
              </div>

              <h1 className="blog-article-title" itemProp="headline">{post.title}</h1>

              {/*
                The standfirst. Marked `speakable` in the JSON-LD above: it is
                the one block on the page that answers "what is this article
                about" in a single sentence, which is what a voice or answer
                engine lifts.
              */}
              <p className="blog-standfirst" itemProp="description">{post.description}</p>

              <div className="blog-byline">
                {/*
                  A named author with a face and a link to who he is. This is a
                  personal engineering blog published under one byline, and the
                  header should read that way before the first paragraph does —
                  it is also the authorship signal Google matches against the
                  Person entity in the JSON-LD below.
                */}
                <div className="blog-byline-author">
                  <img
                    src={PERSONAL_INFO.profileImage}
                    alt={PERSONAL_INFO.fullName}
                    className="blog-avatar"
                    width={44} height={44} loading="eager" decoding="async"
                  />
                  <div style={{ minWidth: 0 }}>
                    <p className="blog-byline-who">
                      By{" "}
                      <Link href="/about" className="bs-link-plain" itemProp="author">
                        <strong>{PERSONAL_INFO.fullName}</strong>
                      </Link>
                    </p>
                    <p className="blog-byline-meta">
                      <span>{PERSONAL_INFO.title}, {PERSONAL_INFO.currentWork.company}</span>
                      <span className="sep" aria-hidden="true">·</span>
                      <span>{post.readTime}</span>
                      {wasUpdated && (
                        <>
                          <span className="sep" aria-hidden="true">·</span>
                          <span>Updated <time dateTime={post.updatedAt}>{updatedLabel}</time></span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="blog-share-row" aria-label="Share this article">
                  {shareLinks.map(({ href, label, Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="blog-share-btn" aria-label={label} title={label}>
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {/*
                Key facts. Every value is a stored field — topic, length,
                reading time, and where the reporting came from — so the strip
                summarises the article without asserting anything the article
                does not already carry. It is also the block that makes the
                page scan as reference material rather than as a wall of prose.
              */}
              <dl className="blog-facts">
                <div className="blog-fact">
                  <dt className="blog-fact-label">Topic</dt>
                  <dd className="blog-fact-value">{post.category || post.tags[0] || "Engineering"}</dd>
                </div>
                <div className="blog-fact">
                  <dt className="blog-fact-label">Reading time</dt>
                  <dd className="blog-fact-value">{readMins} min</dd>
                </div>
                <div className="blog-fact">
                  <dt className="blog-fact-label">Length</dt>
                  <dd className="blog-fact-value">{wordCount.toLocaleString("en-IN")} words</dd>
                </div>
                <div className="blog-fact">
                  <dt className="blog-fact-label">Published</dt>
                  <dd className="blog-fact-value">{publishedLabel}</dd>
                </div>
              </dl>
            </header>

            {/*
              ── Ad Slot: Below Title / Top of Article Body ──────────────
              COMPLIANCE:
              • Placed AFTER the complete article header (title, standfirst,
                byline, key facts) — the reader has already consumed the
                article context before encountering any ad.
              • blog-ad-article CSS wraps it in border-top + border-bottom
                + 40px margin — visually isolated from both the header above
                and the prose below.
              • "Advertisement" label always rendered above the ins tag.
              • format="rectangle" (300×250 medium rectangle) — a clearly
                recognisable ad unit that nobody mistakes for article content.
              • min-height=250px pre-reserved inside AdSlot to prevent CLS.
              • NOT placed next to any button, form, or interactive control.
            */}
            <AdSlot slot={SLOT_TOP} format="rectangle" className="blog-ad-article" />

            {/*
              Contents, inline. Only rendered below 1024px, where the sticky
              sidebar copy is not on screen — a <details> so it costs one line
              closed. Suppressed entirely for articles with fewer than three
              headings, where a contents list is noise.
            */}
            {tocHeadings.length > 0 && (
              <details className="blog-toc blog-toc--inline lg:hidden">
                <summary className="blog-toc-head">
                  In this article
                  <IconChevronDown size={14} className="blog-toc-chevron" />
                </summary>
                <TocList headings={tocHeadings} />
              </details>
            )}

            {/* First half of article body */}
            <div className="blog-content" itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: contentFirst }} />

            {/*
              ── Ad Slot: Mid-Article ─────────────────────────────────────
              COMPLIANCE:
              • Rendered ONLY when wordCount ≥ 600 AND the article has at
                least 4 sections, so the article always has substantially
                more content than ads. A short post never shows this slot —
                AdSense policy prohibits ads on thin/low-content pages.
              • Injected at a SECTION boundary near the 45 % mark: the reader
                finishes a section before the interruption, and neither half
                can contain an unclosed element.
              • blog-ad-mid-article CSS uses top/bottom rules and 40px margin
                so it cannot be confused with a blockquote, callout, or any
                article element.
              • "Advertisement" label always rendered above the ins tag.
              • min-height=250px pre-reserved inside AdSlot to prevent CLS.
              • NOT adjacent to any navigation, CTA button, or interactive
                element — prose runs above and below it.
            */}
            {hasMidAd && (
              <>
                <AdSlot slot={SLOT_MID} format="rectangle" className="blog-ad-mid-article" />
                <div className="blog-content"
                  dangerouslySetInnerHTML={{ __html: contentSecond }} />
              </>
            )}

            {/*
              Source attribution. Articles produced by the content agent are
              written from a specific fetched source and are fact-checked against
              it before publishing; naming that source is the honest half of that
              arrangement, and it is what lets a reader verify a claim rather
              than take it on trust. Only rendered when a source actually exists,
              so hand-written essays are unaffected.
            */}
            {(post as any).sourceUrl ? (
              <section className="blog-sources" aria-labelledby="sources-heading">
                <h2 className="blog-sources-head" id="sources-heading">Sources</h2>
                <p className="blog-sources-item">
                  <a href={(post as any).sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
                    {(post as any).sourceTitle || (post as any).sourceUrl}
                  </a>
                </p>
                <p className="blog-sources-note">
                  Every claim above was checked against this source before publishing.
                  The analysis, the code and the opinions are mine.
                </p>
              </section>
            ) : null}

            {/*
              FAQ. Emitted as FAQPage JSON-LD above from this same array —
              Google requires the answers to be visible on the page, so these
              are rendered as open prose rather than behind an accordion.
            */}
            {faq.length > 0 ? (
              <section className="blog-faq" aria-labelledby="faq-heading">
                <h2 className="blog-faq-head" id="faq-heading">Frequently asked</h2>
                {faq.map((f) => (
                  <div key={f.question} className="blog-faq-item">
                    <h3 className="blog-faq-q">{f.question}</h3>
                    <p className="blog-faq-a">{f.answer}</p>
                  </div>
                ))}
              </section>
            ) : null}

            {/*
              ── Ad Slot: End of Article ──────────────────────────────────
              COMPLIANCE:
              • Placed AFTER the full article body and FAQ have been read —
                the reader has consumed all editorial content before seeing
                this ad.
              • Clear border-top / border-bottom separation (blog-ad-article).
              • 40px margin below it and the author box's own 52px top margin
                keep the "Hire Me" CTA well clear of the ad boundary.
              • min-height=250px pre-reserved inside AdSlot to prevent CLS.
            */}
            <AdSlot slot={SLOT_BOTTOM} format="rectangle" className="blog-ad-article" />

            {/*
              Author card. The end of an article is where a reader decides
              whether to trust the next one, so this says plainly who wrote it,
              what he does, and where else to find him — the same Person the
              JSON-LD `author` and `sameAs` describe.
            */}
            <div className="blog-author-box">
              <img
                src={PERSONAL_INFO.profileImage}
                alt={PERSONAL_INFO.fullName}
                className="blog-avatar blog-avatar--lg"
                width={66} height={66} loading="lazy" decoding="async"
              />
              <div className="blog-author-body">
                <p className="bs-eyebrow">Written by</p>
                <p className="blog-author-name">
                  <Link href="/about">{PERSONAL_INFO.fullName}</Link>
                </p>
                <p className="blog-author-role">
                  {PERSONAL_INFO.title} at {PERSONAL_INFO.currentWork.company}
                  {" · "}{PERSONAL_INFO.currentWork.focus.join(" · ")}
                </p>
                <p className="blog-author-bio">
                  I build production web applications and Generative AI systems — React and
                  Next.js on the front, Node.js and RAG pipelines behind them. I write here
                  about what those systems actually do once real traffic hits them.
                </p>
                <div className="blog-author-links">
                  <Link href="/about" className="blog-author-link">
                    About <IconArrowNarrowRight size={15} />
                  </Link>
                  <a href={PERSONAL_INFO.social.linkedin} target="_blank" rel="noopener noreferrer me" className="blog-author-link">
                    <IconBrandLinkedin size={15} /> LinkedIn
                  </a>
                  <a href={PERSONAL_INFO.social.github} target="_blank" rel="noopener noreferrer me" className="blog-author-link">
                    <IconBrandGithub size={15} /> GitHub
                  </a>
                  <a href={PERSONAL_INFO.social.twitter} target="_blank" rel="noopener noreferrer me" className="blog-author-link">
                    <IconBrandTwitter size={15} /> {PERSONAL_INFO.social.twitterHandle}
                  </a>
                  <Link href="/joinme" className="blog-author-cta">
                    Work with me <IconArrowNarrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Read next — the two closest articles, as a pager. */}
            {readNext.length > 0 && (
              <nav className="blog-pager" aria-label="More articles">
                {readNext.map((p: any, i: number) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`}
                    className={`blog-pager-link${i === 1 ? " blog-pager-link--next" : ""}`}>
                    <p className="blog-pager-dir">{i === 0 ? "Read next" : "Also on the blog"}</p>
                    <p className="blog-pager-title">{p.title}</p>
                    <p className="blog-sidebar-related-meta">{formatDate(p.date)} · {p.readTime}</p>
                  </Link>
                ))}
              </nav>
            )}

            {/* Footer tags + back */}
            <div style={{
              marginTop: 44, paddingTop: 20, borderTop: "1px solid var(--hair)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 16,
            }}>
              <Link href="/blog" className="blog-back-link"><IconArrowLeft size={15} /> All articles</Link>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {post.tags.map((tag: string) => (
                  <Link key={tag} href={`/blog?topic=${encodeURIComponent(tag)}`} className="blog-tag">{tag}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — desktop */}
          <aside className="blog-article-sidebar" aria-label="Article sidebar">
            <div className="blog-article-sidebar-inner">

              {/* Contents — the sticky copy, visible from 1024px up. */}
              {tocHeadings.length > 0 && (
                <nav className="blog-toc" aria-label="Table of contents">
                  <p className="blog-toc-head">In this article</p>
                  <TocList headings={tocHeadings} />
                </nav>
              )}

              {related.length > 0 && (
                <div>
                  <p className="blog-sidebar-heading">Related articles</p>
                  {related.map((p: any) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-sidebar-related-link">
                      <p className="blog-sidebar-related-title">{p.title}</p>
                      <p className="blog-sidebar-related-meta">{formatDate(p.date)} · {p.readTime}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Share */}
              <div>
                <p className="blog-sidebar-heading">Share this article</p>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {shareLinks.map(({ href, label, Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="blog-share-btn blog-share-btn--wide" aria-label={label} title={label}>
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="blog-cta">
                <p className="blog-cta-label">Open to work</p>
                <p className="blog-cta-title">Need a React, Node.js or AI engineer?</p>
                <p className="blog-cta-body">
                  Available for senior full-stack and AI/ML roles, freelance and remote.
                </p>
                <Link href="/joinme" className="blog-cta-link">
                  Start a conversation <IconArrowRight size={14} />
                </Link>
              </div>

              {/*
                ── Ad Slot: Sidebar (desktop ≥ 1024px only) ────────────
                COMPLIANCE:
                • The sidebar column collapses into the main flow below
                  1024px, where this unit sits after the CTA rather than
                  beside it — no accidental tap risk on small screens.
                • Sticky offset is top:92px (below the fixed masthead) so the
                  ad never overlaps navigation or the browser chrome.
                • The ad does NOT overlay article text — it lives in a
                  separate 300px grid column with a 64px gutter.
                • It is the LAST item in the rail, so it is never adjacent to
                  the "Start a conversation" CTA above it by less than that
                  card's own padding plus the rail's 34px gap.
                • "Advertisement" label always rendered above the ins tag.
                • min-height=250px pre-reserved inside AdSlot to prevent CLS.
              */}
              <AdSlot slot={SLOT_SIDEBAR} format="rectangle" className="blog-ad-sidebar" />
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

/** The contents list. Rendered twice — sticky in the rail, inline on mobile —
 *  from one definition so the two can never disagree. */
function TocList({ headings }: { headings: Heading[] }) {
  return (
    <ol className="blog-toc-list">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "is-sub" : undefined}>
          <a href={`#${h.id}`}>{h.text}</a>
        </li>
      ))}
    </ol>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
