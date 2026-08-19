import { YEARS_WHOLE } from "@/components/utils/site-data";
import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconArrowRight, IconRss } from "@tabler/icons-react";
import { listPosts, getSeoConfig } from "@/components/utils/portfolio-api";
import AdSlot from "@/components/blog/AdSlot";

/**
 * RENDERING. The index reads `searchParams` for the topic filter, so Next
 * renders it per request. That is cheaper than it looks: `apiFetch` caches the
 * upstream GET for 300s, so a burst of requests costs one call to the agent
 * service, and the article pages — the ones Core Web Vitals are actually
 * measured on — are statically regenerated (see app/blog/[slug]/page.tsx).
 */
export const revalidate = 300;

const SLOT_TOP    = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP    ?? "0000000000";
const SLOT_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INFEED ?? "1111111111";
const SITE_URL    = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

type IndexPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  coverEmoji: string;
  featured: boolean;
  category: string;
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
  const { posts } = await listPosts({ limit: 100 });
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
  }));
}

// ── Dynamic metadata built from DB config ─────────────────────────────────
export async function generateMetadata(
  { searchParams }: { searchParams: { topic?: string } }
): Promise<Metadata> {
  const cfg = await getBlogIndexSeo();
  const topic = (searchParams?.topic || "").trim();

  const title = cfg?.pageTitle ||
    `Blog | ${PERSONAL_INFO.fullName} — React, AI/ML, Full Stack Engineering`;
  const description = cfg?.metaDescription ||
    `Technical blog by ${PERSONAL_INFO.fullName} — in-depth articles on React.js performance, AI/ML integration with LangChain & OpenAI, MERN stack architecture, and building scalable web applications at India Today Group.`;
  const keywords: string[] = cfg?.keywords?.length
    ? cfg.keywords
    : ["React blog", "JavaScript blog", "AI ML blog", "LangChain tutorial", "OpenAI tutorial",
       "MERN stack blog", "Next.js blog", "web development blog", "Deepak Kumar blog",
       "software engineering articles", "India Today engineering", "React performance",
       "RAG tutorial", "Generative AI tutorial", "Node.js blog", "TypeScript blog",
       "full stack developer blog", "software engineer blog India"];
  const ogTitle       = cfg?.ogTitle       || `Engineering Blog | ${PERSONAL_INFO.fullName}`;
  const ogDescription = cfg?.ogDescription || description;
  const ogImage       = cfg?.ogImage       || `${SITE_URL}/assets/images/profile-pic-removebg-preview.png`;
  const robots        = cfg?.robots        || "index, follow";
  const canonical     = cfg?.canonicalUrl  || `${SITE_URL}/blog`;

  const [robotsIndex, robotsFollow] = robots.split(",").map((s: string) => s.trim());

  /*
    A topic-filtered view is the same articles in a different order — near-
    duplicate content that would compete with /blog itself for the same
    queries. It stays crawlable (follow) so the article links are discovered,
    but is kept out of the index, and its canonical points back at /blog.
    Without this, every tag on every post would mint an indexable thin page.
  */
  const filtered = Boolean(topic);
  const indexable = !filtered && !robotsIndex.includes("noindex");
  const followable = !robotsFollow?.includes("nofollow");

  return {
    title: filtered ? `${topic} articles | ${PERSONAL_INFO.fullName}` : title,
    description,
    keywords,
    authors:      [{ name: PERSONAL_INFO.fullName, url: SITE_URL }],
    creator:      PERSONAL_INFO.fullName,
    openGraph: {
      title: ogTitle,
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

// ── Page ──────────────────────────────────────────────────────────────────
export default async function BlogPage(
  { searchParams }: { searchParams: { topic?: string } }
) {
  const [cfg, dbPosts] = await Promise.all([getBlogIndexSeo(), getDbPosts()]);

  const staticPosts: IndexPost[] = BLOG_POSTS.filter(
    (sp) => !dbPosts.some((dp) => dp.slug === sp.slug)
  ).map((p) => ({ ...p, category: "" }));

  const allPosts = [...dbPosts, ...staticPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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

  const activeTopic = (searchParams?.topic || "").trim();
  const matchesTopic = (p: IndexPost) =>
    !activeTopic ||
    [p.category, ...p.tags].some((t) => String(t).toLowerCase() === activeTopic.toLowerCase());

  const posts = allPosts.filter(matchesTopic);

  /*
    The lead. One article gets the top of the page rather than two competing
    "featured" cards — a front page with two leads has no lead. Preference goes
    to the newest featured post, falling back to the newest post overall.
  */
  const lead = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== lead?.slug);

  const latestDate = allPosts[0]?.date || "";

  // ── Structured data — Blog + ItemList + BreadcrumbList ─────────────
  // ItemList is what lets a search or answer engine read this page as an
  // ordered index of articles rather than as one long document; each entry
  // carries the URL it should cite instead of citing /blog.
  const pageTitle = cfg?.pageTitle || `Blog | ${PERSONAL_INFO.fullName}`;
  const pageDesc  = cfg?.metaDescription || "";

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

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CollectionPage", "Blog"],
        "@id": `${SITE_URL}/blog`,
        name: pageTitle,
        description: pageDesc,
        url: `${SITE_URL}/blog`,
        inLanguage: "en-IN",
        author,
        publisher: author,
        ...(latestDate ? { dateModified: latestDate } : {}),
        blogPost: allPosts.slice(0, 10).map((p) => ({
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
        "@id": `${SITE_URL}/blog#articles`,
        name: "Articles",
        numberOfItems: allPosts.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: allPosts.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/blog/${p.slug}`,
          name: p.title,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
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
          <span>Blog</span>
        </nav>

        <div className="bs-rail-thick" style={{ marginTop: 16 }} />
        <div className="bs-dateline">
          <span>Engineering notes</span>
          <span>React · AI · Architecture</span>
          <span className="bs-live">{allPosts.length} article{allPosts.length === 1 ? "" : "s"}</span>
        </div>
        <div className="bs-rail-thin" />

        <div style={{ paddingTop: 52 }}>
          <p className="bs-kicker">Engineering blog</p>
          <h1 className="bs-h1 bs-mt-2" style={{ maxWidth: "20ch" }}>
            Thoughts on code, architecture and AI.
          </h1>
          <p className="bs-lede bs-mt-4" style={{ maxWidth: "58ch" }}>
            Deep dives into React.js, AI and ML integration, MERN stack patterns, and lessons
            from building production applications at scale — written by {PERSONAL_INFO.fullName}.
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
              {topics.map(([topic, count]) => (
                <Link key={topic} href={`/blog?topic=${encodeURIComponent(topic)}`}
                  className="blog-topic"
                  data-active={topic.toLowerCase() === activeTopic.toLowerCase()}>
                  {topic}<span className="blog-topic-count">{count}</span>
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
            Showing {posts.length} article{posts.length === 1 ? "" : "s"} tagged{" "}
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
          <p className="bs-list-head">{activeTopic ? "More on this topic" : "All articles"}</p>

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
                    {String(index + 2).padStart(2, "0")}
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
