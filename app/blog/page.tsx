import { YEARS_WHOLE } from "@/components/utils/site-data";
import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconClock, IconArrowRight } from "@tabler/icons-react";
import { listPosts, getSeoConfig } from "@/components/utils/portfolio-api";
import AdSlot from "@/components/blog/AdSlot";
import SmartLoader from "@/components/ui/SmartLoader";

export const dynamic = "force-dynamic";

const SLOT_TOP    = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP    ?? "0000000000";
const SLOT_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INFEED ?? "1111111111";
const SITE_URL    = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

// ── Fetch page-level SEO config ───────────────────────────────────────────
// Served by the agent service (see components/utils/portfolio-api.ts for why
// this is an HTTP call and not a database read).
async function getBlogIndexSeo() {
  return getSeoConfig("blog-index");
}

// ── Fetch published posts ─────────────────────────────────────────────────
// Returns [] if the API is unreachable, so the page still renders. The static
// BLOG_POSTS below then carry the index on their own.
async function getDbPosts() {
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
export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getBlogIndexSeo();

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

  return {
    title,
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
      index:  !robotsIndex.includes("noindex"),
      follow: !robotsFollow?.includes("nofollow"),
      googleBot: {
        index:               !robotsIndex.includes("noindex"),
        follow:              !robotsFollow?.includes("nofollow"),
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet":       -1,
      },
    },
    alternates: { canonical },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function BlogPage() {
  const [cfg, dbPosts] = await Promise.all([getBlogIndexSeo(), getDbPosts()]);

  const staticPosts = BLOG_POSTS.filter(
    (sp) => !dbPosts.some((dp) => dp.slug === sp.slug)
  ).map((p) => ({ ...p, category: "" }));

  const allPosts = [...dbPosts, ...staticPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const featured = allPosts.filter((p) => p.featured).slice(0, 2);

  // Structured data — CollectionPage + BreadcrumbList
  const siteUrl   = SITE_URL;
  const pageTitle = cfg?.pageTitle || `Blog | ${PERSONAL_INFO.fullName}`;
  const pageDesc  = cfg?.metaDescription || "";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/blog`,
        name: pageTitle,
        description: pageDesc,
        url: `${siteUrl}/blog`,
        inLanguage: "en-IN",
        author: {
          "@type": "Person",
          name: PERSONAL_INFO.fullName,
          url: siteUrl,
          sameAs: [
            "https://x.com/deepakkutniyal",
            "https://www.linkedin.com/in/dpk1391981/",
            "https://github.com/dpk1391981",
          ],
        },
        hasPart: allPosts.slice(0, 10).map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          url: `${siteUrl}/blog/${p.slug}`,
          datePublished: p.date,
          author: { "@type": "Person", name: PERSONAL_INFO.fullName },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
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
          <span className="bs-live">{allPosts.length} articles</span>
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
      </header>

      <section className="bs-wrap bs-section--tight" style={{ paddingTop: 44 }}>
        {/*
          Ad slot 1 — top banner. Sits below the complete page header with a
          clear visual break, carries its own "Advertisement" label from
          AdSlot, and reserves 90px to prevent layout shift.
        */}
        <AdSlot slot={SLOT_TOP} format="horizontal" className="blog-ad-banner" />

        {featured.length > 0 && (
          <div className="bs-mt-5">
            <p className="bs-list-head">Featured</p>
            <div className="bs-cols--quotes bs-mt-4" style={{ display: "grid", gap: 40 }}>
              {featured.map((post) => (
                <article key={post.slug}>
                  <p className="bs-eyebrow">
                    <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readTime}
                  </p>
                  <h2 className="bs-h3 bs-mt-2">
                    <Link href={`/blog/${post.slug}`} className="bs-link-plain">{post.title}</Link>
                  </h2>
                  <p className="bs-quiet bs-mt-2" style={{ fontSize: 16, lineHeight: 1.65 }}>
                    {post.description}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="bs-link bs-mt-3">
                    Read the article <IconArrowRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bs-wrap bs-section" id="all-articles">
        <p className="bs-list-head">All articles</p>

        <div className="bs-mt-4">
          {allPosts.map((post, index) => (
            <div key={post.slug}>
              {/*
                In-feed ad every sixth article — keeps the content-to-ad ratio
                well above the AdSense minimum, sits as a sibling of the post
                rows (never inside a link), and reserves 120px against CLS.
              */}
              {index > 0 && index % 6 === 0 && (
                <AdSlot slot={SLOT_INFEED} format="fluid" className="blog-ad-infeed" />
              )}

              <article className="bs-ledger-row" style={{ gridTemplateColumns: "minmax(0,7fr) minmax(0,3fr)" }}>
                <div>
                  <h3 style={{ fontSize: 19, lineHeight: 1.32 }}>
                    <Link href={`/blog/${post.slug}`} className="bs-link-plain">{post.title}</Link>
                  </h3>
                  <p className="bs-quiet bs-mt-1" style={{ fontSize: 15, lineHeight: 1.6 }}>
                    {post.description}
                  </p>
                  <div className="bs-tags bs-mt-2" style={{ gap: 6 }}>
                    {post.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="bs-tag bs-tag--outline">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="bs-small bs-quiet">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </p>
                  <p className="bs-small bs-quiet bs-mt-1">
                    <IconClock size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> {post.readTime}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="bs-link bs-mt-2" style={{ fontSize: 13.5 }}>
                    Read <IconArrowRight size={14} />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="bs-wrap bs-section">
        <div className="bs-rail-thick" />
        <div className="bs-rail-thin" style={{ marginTop: 4 }} />
        <div style={{ paddingTop: 34, display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
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
        </div>
      </section>
    </>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
