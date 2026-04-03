import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconClock, IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { connectToDB } from "@/utils/database";
import BlogModel from "@/models/Blog";
import SeoConfig from "@/models/SeoConfig";
import AdSlot from "@/components/blog/AdSlot";

export const dynamic = "force-dynamic";

const SLOT_TOP    = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_TOP    ?? "0000000000";
const SLOT_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_INFEED ?? "1111111111";
const SITE_URL    = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

// ── Fetch page-level SEO config from DB ───────────────────────────────────
async function getBlogIndexSeo() {
  try {
    await connectToDB();
    const cfg = await SeoConfig.findOne({ key: "blog-index" }).lean() as any;
    return cfg || null;
  } catch { return null; }
}

// ── Fetch published DB posts ───────────────────────────────────────────────
async function getDbPosts() {
  try {
    await connectToDB();
    const posts = await BlogModel.find({ status: "published" }).sort({ date: -1 }).lean();
    return posts.map((p: any) => ({
      slug:        p.slug,
      title:       p.title,
      description: p.description,
      date:        p.date || new Date(p.createdAt).toISOString().split("T")[0],
      readTime:    p.readTime,
      tags:        p.tags as string[],
      coverEmoji:  p.coverEmoji,
      featured:    !!p.featured,
      category:    p.category || "",
    }));
  } catch { return []; }
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
    <main className="portfolio-page">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="py-8 md:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────── */}
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">
              Engineering Blog
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Thoughts on Code, Architecture & AI
            </h1>
            <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
              Deep dives into React.js, AI/ML integration, MERN stack patterns, and
              lessons from building production apps at scale — by{" "}
              <strong className="text-slate-700">{PERSONAL_INFO.fullName}</strong>.
            </p>
          </header>

          {/*
            ── Ad Slot 1 — Top Banner ──────────────────────────────────
            COMPLIANCE:
            • Placed BELOW the full page header (title + description text).
              There is a clear visual break (mb-8 + blog-ad-banner padding)
              between the heading block and this ad — no accidental-click risk.
            • "Advertisement" label rendered by AdSlot (blog-ad-label).
            • blog-ad-banner CSS gives a distinct background, generous vertical
              padding, and a bottom border so it cannot be confused with a
              content card or navigation link.
            • format="horizontal" → standard leaderboard / responsive banner
              unit; not deceptive, not an interactive UI element.
            • min-height=90 px pre-reserved inside AdSlot to prevent CLS.
          */}
          <AdSlot slot={SLOT_TOP} format="horizontal" className="blog-ad-banner" />

          {/* ── Featured ───────────────────────────────────────────── */}
          {featured.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <IconSparkles size={15} className="text-amber-500" />
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Featured</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {featured.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card blog-card--featured">
                    <span className="blog-card-emoji">{post.coverEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{post.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        <span className="flex items-center gap-1"><IconClock size={11} /> {post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/*
            ── All Articles — in-feed ad every 6th post ────────────────
            COMPLIANCE:
            • Frequency: 1 ad per 6 content items keeps content-to-ad ratio
              well above the AdSense minimum and avoids "more ads than content"
              violation. Google recommends no closer than every 5–7 items.
            • format="fluid" without layout="in-article" is the correct
              setting for list-page native/in-feed units (layout="in-article"
              is reserved for within-body article text only).
            • blog-ad-infeed CSS wraps the unit in a distinct white card with
              border and border-radius so it is visually separated from
              blog-card rows above and below — no confusion with content.
            • "Advertisement" label is always rendered above the unit.
            • Each in-feed ad sits in its own <div> sibling of post cards,
              never inside a clickable Link element — zero accidental-click risk.
            • min-height=120 px pre-reserved inside AdSlot to prevent CLS.
          */}
          <div>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4">
              All Articles
            </h2>
            <div className="space-y-3">
              {allPosts.map((post, index) => (
                <div key={post.slug}>
                  {index > 0 && index % 6 === 0 && (
                    <AdSlot slot={SLOT_INFEED} format="fluid" className="blog-ad-infeed" />
                  )}
                  <Link href={`/blog/${post.slug}`} className="blog-card">
                    <span className="blog-card-emoji blog-card-emoji--sm">{post.coverEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-0.5 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 hidden sm:block">{post.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="blog-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <time className="text-[11px] text-slate-400 font-medium" dateTime={post.date}>
                        {formatDate(post.date)}
                      </time>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <IconClock size={11} /> {post.readTime}
                      </span>
                    </div>
                    <IconArrowRight size={16} className="text-slate-300 flex-shrink-0 hidden sm:block" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ── Author strip (boosts AdSense trust) ────────────────── */}
          <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">About the author</p>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                DK
              </div>
              <div>
                <p className="font-bold text-slate-900">{PERSONAL_INFO.fullName}</p>
                <p className="text-sm text-slate-500">{PERSONAL_INFO.title} at {PERSONAL_INFO.currentWork.company}</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Building scalable web apps and Generative AI solutions.
                  Writing about React, Node.js, AI/ML, and engineering lessons
                  from 9+ years of production experience.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
