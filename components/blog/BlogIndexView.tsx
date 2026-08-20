/**
 * The blog index, shared by `/blog` (page 1) and `/blog/page/[page]` (2…n).
 *
 * Both routes are the same page with a different slice, so both the metadata
 * and the markup live here — a second copy of this logic under the paginated
 * route is how a canonical, a robots tag and a JSON-LD block drift apart.
 */
import { YEARS_WHOLE } from "@/components/utils/site-data";
import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconArrowRight, IconRss } from "@tabler/icons-react";
import { listAllPosts, getSeoConfig } from "@/components/utils/portfolio-api";
import AdSlot from "@/components/blog/AdSlot";
import { POSTS_PER_PAGE, pageCount, indexPath } from "@/components/utils/blog-pagination";

const SLOT_TOP    = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP    ?? "0000000000";
const SLOT_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INFEED ?? "1111111111";
const SITE_URL    = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

export type IndexPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  coverEmoji: string;
  featured: boolean;
  category: string;
  /** True when the post's own page will answer `noindex`. */
  noIndex: boolean;
};

// ── Fetch page-level SEO config ───────────────────────────────────────────
// Served by the agent service (see components/utils/portfolio-api.ts for why
// this is an HTTP call and not a database read).
async function getBlogIndexSeo() {
  return getSeoConfig("blog-index");
}

// ── Fetch published posts ─────────────────────────────────────────────────
// Returns [] if the API is unreachable, so the page still renders. The static
// BLOG_POSTS below then carry the index on their own.
async function getDbPosts(): Promise<IndexPost[]> {
  const posts = await listAllPosts();
  return posts.map((p) => ({
    slug:        p.slug,
    title:       p.title,
    description: p.description,
    date:        (p.date || p.publishedAt || "").slice(0, 10),
    readTime:    p.readTime,
    tags:        p.tags ?? [],
    coverEmoji:  p.coverEmoji,
    featured:    p.featured,
    category:    p.category || "",
    noIndex:     Boolean(p.noIndex) || Boolean(p.robots?.includes("noindex")),
  }));
}

/** Every post the index knows about, newest first. */
async function getAllPosts(): Promise<IndexPost[]> {
  const dbPosts = await getDbPosts();
  const staticPosts: IndexPost[] = BLOG_POSTS.filter(
    (sp) => !dbPosts.some((dp) => dp.slug === sp.slug)
  ).map((p) => ({ ...p, category: "", noIndex: false }));

  return [...dbPosts, ...staticPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

const matchesTopic = (p: IndexPost, topic: string) =>
  !topic ||
  [p.category, ...p.tags].some((t) => String(t).toLowerCase() === topic.toLowerCase());

// ── Metadata ──────────────────────────────────────────────────────────────

/*
  The head term this index is written for is "tech blogs in India" — the query
  a reader types, not the word an engineer would pick for their own archive
  ("engineering notes", "writing"). The stack terms that follow are what the
  articles are actually about, so the title earns the click for the long tail
  ("react blog india", "langchain tutorial") as well as the head.

  These live at module scope because the <title> and the CollectionPage
  JSON-LD `name` below are the same claim in two formats: when they drifted
  apart, the page told Google one thing in the head and another in the graph.
  Anything the admin sets in the SEO panel overrides them, per field.
*/
const DEFAULT_INDEX_TITLE =
  `Tech Blogs in India | ${PERSONAL_INFO.fullName} — React, AI & Node.js`;
const DEFAULT_INDEX_DESC =
  `Tech blogs from India by ${PERSONAL_INFO.fullName} — React.js, Next.js and Node.js, ` +
  `AI/ML with OpenAI and LangChain, MERN architecture and system design.`;
const DEFAULT_INDEX_KEYWORDS = [
  // Head terms first: this is the order a human scans, and the order that
  // makes the intent of the page obvious to an answer engine reading them.
  "tech blogs in India", "tech blog India", "Indian tech blog",
  "software engineering blog India", "best tech blogs for developers",
  // The subjects the archive actually has depth in.
  "React blog", "React performance", "Next.js blog", "Node.js blog",
  "JavaScript blog India", "TypeScript blog", "MERN stack blog",
  "AI ML blog India", "LangChain tutorial", "OpenAI tutorial", "RAG tutorial",
  "Generative AI tutorial", "system design blog India",
  // Brand.
  "Deepak Kumar blog", "India Today engineering",
];

export async function buildBlogIndexMetadata(
  { page = 1, topic = "" }: { page?: number; topic?: string }
): Promise<Metadata> {
  const cfg = await getBlogIndexSeo();
  topic = topic.trim();

  const title       = cfg?.pageTitle      || DEFAULT_INDEX_TITLE;
  const description = cfg?.metaDescription || DEFAULT_INDEX_DESC;
  const keywords: string[] = cfg?.keywords?.length ? cfg.keywords : DEFAULT_INDEX_KEYWORDS;
  const ogTitle     = cfg?.ogTitle        || `Tech Blogs in India | ${PERSONAL_INFO.fullName}`;
  const ogDescription = cfg?.ogDescription || description;
  // The blog's own share card, not the site-wide portrait one: a link to
  // /blog previews as the page it opens. See scripts/og-blog.html.
  const ogImage       = cfg?.ogImage       || `${SITE_URL}/assets/images/og-blog.png`;
  const robots        = cfg?.robots        || "index, follow";

  const [robotsIndex, robotsFollow] = robots.split(",").map((s: string) => s.trim());

  /*
    A topic-filtered view is the same articles in a different order — near-
    duplicate content that would compete with /blog itself for the same
    queries. It stays crawlable (follow) so the article links are discovered,
    but is kept out of the index. Without this, every tag on every post would
    mint an indexable thin page.

    Its canonical points at itself rather than at /blog: `noindex` already
    settles what happens to the URL, and a noindex page whose canonical names a
    *different* URL sends Google two contradictory instructions about the same
    document — the one case Search Central explicitly warns against.
  */
  const filtered = Boolean(topic);
  const indexable = !filtered && !robotsIndex.includes("noindex");
  const followable = !robotsFollow?.includes("nofollow");

  // Paginated pages are indexable and self-canonical. They are not duplicates
  // of page 1 — they list different articles — and each one is the only URL
  // that links to the posts in its own slice.
  const path = indexPath(page);
  const query = filtered ? `?topic=${encodeURIComponent(topic)}` : "";
  const canonical = filtered || page > 1
    ? `${SITE_URL}${path}${query}`
    : cfg?.canonicalUrl || `${SITE_URL}/blog`;

  /*
    Page 2+ gets its own shorter title rather than the page-1 title with a
    suffix bolted on: the full one is already close to the ~60 characters
    Google renders, so " — Page 4" only pushed the brand off the end of the
    SERP line. An admin-set title is still honoured — it is a deliberate
    choice, and silently replacing it on the archive pages would be surprising.
  */
  const pageSuffix = page > 1 ? ` — Page ${page}` : "";
  const pageTitle = filtered
    ? `${topic} Tech Blogs${pageSuffix} | ${PERSONAL_INFO.fullName}`
    : page > 1
      ? (cfg?.pageTitle
          ? `${cfg.pageTitle}${pageSuffix}`
          : `Tech Blogs in India — Page ${page} | ${PERSONAL_INFO.fullName}`)
      : title;

  return {
    title: pageTitle,
    // Same reasoning as the title: a prefixed sentence pushed the real
    // description past the ~160 characters a SERP shows, so the archive pages
    // get their own, already short enough to survive intact.
    description: page > 1
      ? `Page ${page} of the tech blog archive — React, Next.js, Node.js, AI/ML and system design articles by ${PERSONAL_INFO.fullName}.`
      : description,
    keywords,
    authors:      [{ name: PERSONAL_INFO.fullName, url: SITE_URL }],
    creator:      PERSONAL_INFO.fullName,
    openGraph: {
      title: page > 1 ? `${ogTitle} — Page ${page}` : ogTitle,
      description: ogDescription,
      type: "website",
      url: canonical,
      siteName: `${PERSONAL_INFO.fullName} Blog`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
      locale: "en_IN",
    },
    twitter: {
      card:        "summary_large_image",
      title:       cfg?.twitterTitle       || ogTitle,
      description: cfg?.twitterDescription || description,
      creator:     cfg?.twitterCreator     || "@deepakkutniyal",
      images:      [ogImage],
    },
    robots: {
      index:  indexable,
      follow: followable,
      googleBot: {
        index:               indexable,
        follow:              followable,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet":       -1,
      },
    },
    alternates: {
      canonical,
      types: {
        "application/rss+xml": [
          { url: `${SITE_URL}/blog/rss.xml`, title: `${PERSONAL_INFO.fullName} — Engineering Blog` },
        ],
      },
    },
  };
}

/** Total number of index pages — `app/blog/page/[page]` uses it to 404 past the end. */
export async function blogPageCount(topic = ""): Promise<number> {
  const all = await getAllPosts();
  return pageCount(all.filter((p) => matchesTopic(p, topic.trim())).length);
}

// ── View ──────────────────────────────────────────────────────────────────

export default async function BlogIndexView(
  { page = 1, topic = "" }: { page?: number; topic?: string }
) {
  const [cfg, allPosts] = await Promise.all([getBlogIndexSeo(), getAllPosts()]);

  /*
    Topics are derived from the posts themselves — category first, then tags —
    rather than kept in a hand-maintained list, so a new subject area appears
    in the rail the moment something is published under it. Counted so the
    rail shows where the blog actually has depth.
  */
  const topicCounts = new Map<string, number>();
  for (const p of allPosts) {
    for (const t of [p.category, ...p.tags].filter(Boolean)) {
      const key = String(t).trim();
      if (key) topicCounts.set(key, (topicCounts.get(key) ?? 0) + 1);
    }
  }
  const topics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12);

  const activeTopic = topic.trim();
  const matching = allPosts.filter((p) => matchesTopic(p, activeTopic));

  const totalPages = pageCount(matching.length);
  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = matching.slice(start, start + POSTS_PER_PAGE);

  /*
    The lead. One article gets the top of the page rather than two competing
    "featured" cards — a front page with two leads has no lead. Preference goes
    to the newest featured post, falling back to the newest post overall. Only
    page 1 has a lead; deeper pages are the archive and read as a list.
  */
  const lead = page === 1 ? (posts.find((p) => p.featured) ?? posts[0]) : undefined;
  const rest = lead ? posts.filter((p) => p.slug !== lead.slug) : posts;

  const latestDate = allPosts[0]?.date || "";
  const qs = activeTopic ? `?topic=${encodeURIComponent(activeTopic)}` : "";
  const pageUrl = `${SITE_URL}${indexPath(page)}${qs}`;

  // ── Structured data — Blog + ItemList + BreadcrumbList ─────────────
  // ItemList is what lets a search or answer engine read this page as an
  // ordered index of articles rather than as one long document; each entry
  // carries the URL it should cite instead of citing /blog.
  //
  // Only indexable posts are described. Markup that recommends a URL the same
  // site tells Google to drop is a contradiction, and the ItemList is the part
  // an answer engine is most likely to quote.
  const pageTitle = cfg?.pageTitle || DEFAULT_INDEX_TITLE;
  const pageDesc  = cfg?.metaDescription || DEFAULT_INDEX_DESC;
  const listable  = matching.filter((p) => !p.noIndex);

  const author = {
    "@type": "Person",
    name: PERSONAL_INFO.fullName,
    url: SITE_URL,
    jobTitle: PERSONAL_INFO.title,
    sameAs: [
      "https://x.com/deepakkutniyal",
      "https://www.linkedin.com/in/dpk1391981/",
      "https://github.com/dpk1391981",
    ],
  };

  // The slice this page actually shows, so position numbers stay globally
  // correct across the paginated set rather than restarting at 1 on every page.
  const listedHere = posts.filter((p) => !p.noIndex);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CollectionPage", "Blog"],
        "@id": pageUrl,
        name: page > 1 ? `${pageTitle} — Page ${page}` : pageTitle,
        description: pageDesc,
        url: pageUrl,
        inLanguage: "en-IN",
        author,
        publisher: author,
        ...(latestDate ? { dateModified: latestDate } : {}),
        ...(page > 1 ? { isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog` } } : {}),
        blogPost: listedHere.slice(0, 10).map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.date,
          keywords: p.tags.join(", "),
          author: { "@type": "Person", name: PERSONAL_INFO.fullName },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#articles`,
        name: "Articles",
        numberOfItems: listable.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: listedHere.map((p) => ({
          "@type": "ListItem",
          position: listable.indexOf(p) + 1,
          url: `${SITE_URL}/blog/${p.slug}`,
          name: p.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          ...(page > 1
            ? [{ "@type": "ListItem", position: 3, name: `Page ${page}`, item: pageUrl }]
            : []),
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className="bs-wrap" style={{ paddingTop: 26 }}>
        <nav className="bs-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">·</span>
          {page > 1 ? <Link href="/blog">Blog</Link> : <span>Blog</span>}
          {page > 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span>Page {page}</span>
            </>
          )}
        </nav>

        <div className="bs-rail-thick" style={{ marginTop: 16 }} />
        <div className="bs-dateline">
          <span>Tech blog</span>
          <span>React · AI · Architecture</span>
          <span className="bs-live">{allPosts.length} article{allPosts.length === 1 ? "" : "s"}</span>
        </div>
        <div className="bs-rail-thin" />

        <div style={{ paddingTop: 52 }}>
          {/* The H1 carries the same term as the <title> on purpose. It read
              "Thoughts on code, architecture and AI." — true, and invisible to
              anyone searching for a tech blog. The voice is unchanged; the
              noun is now the one people actually type. */}
          <p className="bs-kicker">Tech blog · India{page > 1 ? ` · page ${page}` : ""}</p>
          <h1 className="bs-h1 bs-mt-2" style={{ maxWidth: "20ch" }}>
            Tech blogs on code, architecture and AI.
          </h1>
          <p className="bs-lede bs-mt-4" style={{ maxWidth: "58ch" }}>
            Deep dives into React.js, AI and ML integration, MERN stack patterns, and lessons
            from building production applications at scale in India — written by{" "}
            {PERSONAL_INFO.fullName}.
          </p>
        </div>

        {/* Topic rail — a filtered view of the same list, one URL per topic. */}
        {topics.length > 0 && (
          <nav className="bs-mt-5" aria-label="Filter by topic">
            <p className="bs-eyebrow">Browse by topic</p>
            <div className="blog-topics">
              <Link href="/blog" className="blog-topic" data-active={!activeTopic}>
                All<span className="blog-topic-count">{allPosts.length}</span>
              </Link>
              {topics.map(([t, count]) => (
                <Link key={t} href={`/blog?topic=${encodeURIComponent(t)}`}
                  className="blog-topic"
                  data-active={t.toLowerCase() === activeTopic.toLowerCase()}>
                  {t}<span className="blog-topic-count">{count}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <section className="bs-wrap bs-section--tight" style={{ paddingTop: 40 }}>
        {/*
          Ad slot 1 — top banner. Sits below the complete page header with a
          clear visual break, carries its own "Advertisement" label from
          AdSlot, and reserves 90px to prevent layout shift.
        */}
        <AdSlot slot={SLOT_TOP} format="horizontal" className="blog-ad-banner" />

        {activeTopic && (
          <p className="bs-quiet bs-mt-4" style={{ fontSize: 15 }}>
            Showing {matching.length} article{matching.length === 1 ? "" : "s"} tagged{" "}
            <strong style={{ color: "var(--ink)" }}>{activeTopic}</strong>.{" "}
            <Link href="/blog" className="bs-link-plain" style={{ textDecoration: "underline" }}>
              Clear filter
            </Link>
          </p>
        )}

        {posts.length === 0 && (
          <p className="bs-quiet bs-mt-5" style={{ fontSize: 16 }}>
            Nothing published under this topic yet.{" "}
            <Link href="/blog" className="bs-link-plain" style={{ textDecoration: "underline" }}>
              See all articles
            </Link>
            .
          </p>
        )}

        {/* The lead article. */}
        {lead && (
          <div className="blog-lead bs-mt-5">
            <div>
              <p className="bs-eyebrow">
                {lead.featured ? "Lead article" : "Latest"}
                {lead.category ? ` · ${lead.category}` : ""}
              </p>
              <h2 className="blog-lead-title">
                <Link href={`/blog/${lead.slug}`} className="bs-link-plain">{lead.title}</Link>
              </h2>
              <p className="bs-eyebrow bs-mt-3">
                <time dateTime={lead.date}>{formatDate(lead.date)}</time> · {lead.readTime}
              </p>
            </div>
            <div>
              <p className="blog-lead-desc" style={{ marginTop: 0 }}>{lead.description}</p>
              <div className="bs-tags bs-mt-3" style={{ gap: 6 }}>
                {lead.tags.slice(0, 5).map((tag: string) => (
                  <span key={tag} className="bs-tag bs-tag--outline">{tag}</span>
                ))}
              </div>
              <Link href={`/blog/${lead.slug}`} className="bs-link bs-mt-3">
                Read the article <IconArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section className="bs-wrap bs-section--tight" id="all-articles" style={{ paddingTop: 52 }}>
          <p className="bs-list-head">
            {activeTopic ? "More on this topic" : page > 1 ? `Archive · page ${page}` : "All articles"}
          </p>

          <div className="bs-mt-4">
            {rest.map((post, index) => (
              <div key={post.slug}>
                {/*
                  In-feed ad every sixth article — keeps the content-to-ad ratio
                  well above the AdSense minimum, sits as a sibling of the post
                  rows (never inside a link), and reserves 120px against CLS.
                */}
                {index > 0 && index % 6 === 0 && (
                  <AdSlot slot={SLOT_INFEED} format="fluid" className="blog-ad-infeed" />
                )}

                <article className="blog-row">
                  <p className="blog-row-index" aria-hidden="true">
                    {String(start + index + (lead ? 2 : 1)).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="blog-row-title">
                      <Link href={`/blog/${post.slug}`} className="bs-link-plain">{post.title}</Link>
                    </h3>
                    <p className="blog-row-desc">{post.description}</p>
                    <div className="bs-tags bs-mt-2" style={{ gap: 6 }}>
                      {post.tags.slice(0, 4).map((tag: string) => (
                        <span key={tag} className="bs-tag bs-tag--outline">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="blog-row-meta">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <br />
                    {post.readTime}
                    {post.category ? <><br />{post.category}</> : null}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </section>
      )}

      {/*
        Pagination. Plain <a>-backed links to every page: a crawler that can
        only reach page 7 through a "load more" button never reaches it at all,
        and the numbered rail keeps every archived post within two clicks of
        the index.
      */}
      {totalPages > 1 && (
        <nav className="bs-wrap bs-section--tight blog-pagination" aria-label="Pagination"
             style={{ paddingTop: 44 }}>
          <p className="bs-eyebrow">Page {page} of {totalPages}</p>
          <div className="blog-topics bs-mt-2">
            {page > 1 && (
              <Link href={`${indexPath(page - 1)}${qs}`} className="blog-topic" rel="prev">
                ← Newer
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={`${indexPath(n)}${qs}`} className="blog-topic"
                data-active={n === page}
                aria-current={n === page ? "page" : undefined}>
                {n}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={`${indexPath(page + 1)}${qs}`} className="blog-topic" rel="next">
                Older →
              </Link>
            )}
          </div>
        </nav>
      )}

      <section className="bs-wrap bs-section">
        <div className="bs-rail-thick" />
        <div className="bs-rail-thin" style={{ marginTop: 4 }} />
        <div style={{ paddingTop: 34, display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px" }}>
            <p className="bs-eyebrow">About the author</p>
            <p className="bs-h4 bs-mt-2">{PERSONAL_INFO.fullName}</p>
            <p className="bs-small bs-quiet bs-mt-1">
              {PERSONAL_INFO.title} at {PERSONAL_INFO.currentWork.company}
            </p>
            <p className="bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: "58ch" }}>
              Building scalable web applications and Generative AI systems. Writing about React,
              Node.js, AI and the engineering lessons from {YEARS_WHOLE} years of production work.
            </p>
            <Link href="/about" className="bs-link bs-mt-3">
              More about me <IconArrowRight size={15} />
            </Link>
          </div>

          {/* The feed, offered where a reader who just finished the index is. */}
          <div style={{ flex: "0 1 280px" }}>
            <p className="bs-eyebrow">Follow along</p>
            <p className="bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>
              New articles land here as they publish. Subscribe in any reader.
            </p>
            <a href="/blog/rss.xml" className="bs-link bs-mt-3">
              <IconRss size={15} /> RSS feed
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
