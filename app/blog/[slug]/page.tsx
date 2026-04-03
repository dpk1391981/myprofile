import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { IconArrowLeft, IconClock, IconBrandTwitter, IconBrandLinkedin, IconBrandWhatsapp } from "@tabler/icons-react";
import { connectToDB } from "@/utils/database";
import BlogModel from "@/models/Blog";
import SeoConfig from "@/models/SeoConfig";
import AdSlot from "@/components/blog/AdSlot";
import ReadingProgress from "@/components/blog/ReadingProgress";

export const dynamic = "force-dynamic";

const SLOT_TOP     = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP    ?? "2222222222";
const SLOT_MID     = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID    ?? "5555555555";
const SLOT_BOTTOM  = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM ?? "3333333333";
const SLOT_SIDEBAR = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR        ?? "4444444444";

// Mid-article ad: split HTML at the ~45 % paragraph boundary.
// Returns [firstHalf, secondHalf]; secondHalf is empty when content is
// too short (< MIN_WORDS) — in that case no mid-ad is rendered.
const MID_AD_MIN_WORDS = 600;
function splitAtMidParagraph(html: string): [string, string] {
  // Split on closing </p> tags so we never break inside a paragraph
  const paragraphs = html.split(/(<\/p>)/i);
  // paragraphs array alternates: [content, "</p>", content, "</p>", ...]
  const tagCount = Math.floor(paragraphs.length / 2); // number of </p> tags
  if (tagCount < 5) return [html, ""];              // too few paragraphs
  const splitAfter = Math.floor(tagCount * 0.45);   // insert after ~45 % of <p>s
  // Reconstruct first and second halves including the </p> tags
  const first: string[] = [];
  const second: string[] = [];
  let pSeen = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    if (/^<\/p>$/i.test(paragraphs[i])) pSeen++;
    if (pSeen <= splitAfter) first.push(paragraphs[i]);
    else second.push(paragraphs[i]);
  }
  return [first.join(""), second.join("")];
}
const SITE_URL     = process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in";

// ── Helpers ───────────────────────────────────────────────────────────────

async function getPost(slug: string) {
  try {
    await connectToDB();
    const p = await BlogModel.findOne({ slug, status: "published" }).lean() as any;
    if (p) return {
      _fromDb:        true,
      slug:           p.slug,
      title:          p.title,
      description:    p.description,
      date:           p.date || new Date(p.createdAt).toISOString().split("T")[0],
      updatedAt:      new Date(p.updatedAt || p.createdAt).toISOString(),
      readTime:       p.readTime,
      tags:           p.tags as string[],
      coverEmoji:     p.coverEmoji,
      featured:       !!p.featured,
      content:        p.content,
      category:       p.category || "",
      // SEO fields
      seoTitle:       p.seoTitle      || "",
      seoDescription: p.seoDescription || "",
      focusKeyword:   p.focusKeyword  || "",
      seoKeywords:    (p.seoKeywords  || []) as string[],
      ogImage:        p.ogImage       || "",
      canonicalUrl:   p.canonicalUrl  || "",
      robots:         p.robots        || "index, follow",
      noIndex:        !!p.noIndex,
    };
  } catch {}
  const sp = getBlogPost(slug);
  if (!sp) return null;
  return { ...sp, _fromDb: false, category: "", updatedAt: sp.date,
    seoTitle: "", seoDescription: "", focusKeyword: "",
    seoKeywords: [] as string[], ogImage: "", canonicalUrl: "", robots: "index, follow", noIndex: false };
}

async function getDefaults() {
  try {
    await connectToDB();
    return await SeoConfig.findOne({ key: "blog-defaults" }).lean() as any;
  } catch { return null; }
}

async function getRelated(slug: string, tags: string[]) {
  const all: any[] = [];
  try {
    await connectToDB();
    const rows = await BlogModel.find({ slug: { $ne: slug }, tags: { $in: tags }, status: "published" })
      .limit(4).lean() as any[];
    all.push(...rows.map((p: any) => ({
      slug: p.slug, title: p.title, coverEmoji: p.coverEmoji,
      date: p.date || new Date(p.createdAt).toISOString().split("T")[0], readTime: p.readTime,
    })));
  } catch {}
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
    alternates: { canonical },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, defaults, related] = await Promise.all([
    getPost(params.slug),
    getDefaults(),
    getPost(params.slug).then((p) => p ? getRelated(p.slug, p.tags) : []),
  ]);
  if (!post) notFound();

  const titleSuffix = defaults?.titleSuffix || ` | ${PERSONAL_INFO.fullName}`;
  const postUrl     = `${SITE_URL}/blog/${post.slug}`;
  const ogImage     = post.ogImage || defaults?.ogImage || `${SITE_URL}/assets/images/profile-pic-removebg-preview.png`;
  const wordCount   = post.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const readMins    = parseInt(post.readTime) || 5;

  // Mid-article ad — only injected when the article is long enough that
  // the ad does not dominate the page (content > ads ratio stays healthy).
  const hasMidAd = wordCount >= MID_AD_MIN_WORDS;
  const [contentFirst, contentSecond] = hasMidAd
    ? splitAtMidParagraph(post.content)
    : [post.content, ""];

  // ── Structured data — TechArticle + BreadcrumbList ────────────────
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": postUrl,
        headline:     post.seoTitle || post.title,
        name:         post.seoTitle || post.title,
        description:  post.seoDescription || post.description,
        url:          postUrl,
        datePublished: post.date + "T00:00:00+05:30",
        dateModified:  post.updatedAt,
        author: {
          "@type": "Person",
          name:    PERSONAL_INFO.fullName,
          url:     SITE_URL,
          sameAs: ["https://x.com/deepakkutniyal", "https://www.linkedin.com/in/dpk1391981/", "https://github.com/dpk1391981"],
        },
        publisher: {
          "@type": "Person",
          name: PERSONAL_INFO.fullName,
          url:  SITE_URL,
        },
        image:             { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 },
        mainEntityOfPage:  { "@type": "WebPage", "@id": postUrl },
        keywords:          [post.focusKeyword, ...post.seoKeywords, ...post.tags].filter(Boolean).join(", "),
        articleSection:    post.category || post.tags[0] || "Technology",
        inLanguage:        "en-IN",
        wordCount,
        timeRequired:      `PT${readMins}M`,
        isAccessibleForFree: true,
        ...(post.focusKeyword ? { about: { "@type": "Thing", name: post.focusKeyword } } : {}),
      },
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

  return (
    <main className="portfolio-page">
      <ReadingProgress />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <article itemScope itemType="https://schema.org/TechArticle">

        {/* ── Full-width article header ──────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 md:pt-12">
          <Link href="/blog" className="blog-back-link mb-6">
            <IconArrowLeft size={15} /> All Articles
          </Link>

          <div className="flex items-center gap-2 flex-wrap mb-5">
            {post.category && (
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            )}
            {post.tags.slice(0, 4).map((tag: string) => (
              <span key={tag} className="blog-tag">{tag}</span>
            ))}
          </div>

          <span className="blog-article-cover-emoji" aria-hidden="true">{post.coverEmoji}</span>

          <h1
            className="text-2xl sm:text-3xl md:text-[2.1rem] font-bold text-slate-900 tracking-tight leading-tight mb-4"
            itemProp="headline"
          >
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-6" itemProp="description">
            {post.description}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-3 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-800" itemProp="author">{PERSONAL_INFO.fullName}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date} itemProp="datePublished">{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5"><IconClock size={13} className="text-slate-400" /> {post.readTime}</span>
            </div>
            <div className="flex items-center gap-2" aria-label="Share this article">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                target="_blank" rel="noopener noreferrer" className="blog-share-btn" aria-label="Share on Twitter">
                <IconBrandTwitter size={16} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank" rel="noopener noreferrer" className="blog-share-btn" aria-label="Share on LinkedIn">
                <IconBrandLinkedin size={16} />
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + postUrl)}`}
                target="_blank" rel="noopener noreferrer" className="blog-share-btn" aria-label="Share on WhatsApp">
                <IconBrandWhatsapp size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ────────────────────────────────────── */}
        <div className="blog-article-grid">

          {/* Main column */}
          <div className="blog-article-main">

            {/*
              ── Ad Slot: Below Title / Top of Article Body ──────────────
              COMPLIANCE:
              • Placed AFTER the complete article header (title, description,
                author line, share buttons, divider) — the reader has already
                consumed the article context before encountering any ad.
              • blog-ad-article CSS wraps it in border-top + border-bottom
                + generous margin (32 px top/bottom) — visually isolated from
                both the header above and the prose below.
              • "Advertisement" label always rendered above the ins tag.
              • format="rectangle" (300×250 medium rectangle) — a clearly
                recognisable ad unit that nobody mistakes for article content.
              • min-height=250 px pre-reserved inside AdSlot to prevent CLS.
              • NOT placed next to any button, form, or interactive control.
            */}
            <AdSlot slot={SLOT_TOP} format="rectangle" className="blog-ad-article" />

            {/* First half of article body */}
            <div className="blog-content" itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: contentFirst }} />

            {/*
              ── Ad Slot: Mid-Article ─────────────────────────────────────
              COMPLIANCE:
              • Rendered ONLY when wordCount ≥ 600 (hasMidAd flag) so the
                article always has substantially more content than ads.
                A short post will never show this slot — AdSense policy
                prohibits ads on thin/low-content pages.
              • Injected at the 45 % paragraph boundary — the reader has
                read roughly half the article, so interruption is minimal.
              • blog-ad-mid-article CSS uses stronger top/bottom borders and
                slightly elevated background so it cannot be confused with a
                blockquote, callout, or any article element.
              • "Advertisement" label always rendered above the ins tag.
              • min-height=250 px pre-reserved inside AdSlot to prevent CLS.
              • NOT adjacent to any "Next / Previous" navigation, CTA button,
                or interactive element — at least 200 px of prose above/below.
            */}
            {hasMidAd && contentSecond && (
              <>
                <AdSlot slot={SLOT_MID} format="rectangle" className="blog-ad-mid-article" />
                <div className="blog-content"
                  dangerouslySetInnerHTML={{ __html: contentSecond }} />
              </>
            )}

            {/*
              ── Ad Slot: End of Article ──────────────────────────────────
              COMPLIANCE:
              • Placed AFTER the full article body has been read — the reader
                has consumed all editorial content before seeing this ad.
              • Clear border-top / border-bottom separation (blog-ad-article).
              • There are at least 48 px of margin between this ad and the
                author box below (which contains no interactive buttons
                directly adjacent to the ad boundary).
              • "Hire Me" CTA in the author box is separated from the ad
                bottom-border by the author box's own padding + margin.
              • min-height=250 px pre-reserved inside AdSlot to prevent CLS.
            */}
            <AdSlot slot={SLOT_BOTTOM} format="rectangle" className="blog-ad-article" />

            {/* Author box */}
            <div className="blog-author-box">
              <div>
                <p className="text-sm font-bold text-slate-900">{PERSONAL_INFO.fullName}</p>
                <p className="text-xs text-slate-500">{PERSONAL_INFO.title} at {PERSONAL_INFO.currentWork.company}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {PERSONAL_INFO.currentWork.focus.join(" · ")} · {post.tags.slice(0, 2).join(" · ")}
                </p>
              </div>
              <Link href="/joinme" className="blog-author-cta">Hire Me</Link>
            </div>

            {/* Related articles — mobile only */}
            {related.length > 0 && (
              <div className="mt-10 lg:hidden">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Related Articles</h2>
                <div className="space-y-3">
                  {related.map((p: any) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
                      <span className="blog-card-emoji blog-card-emoji--sm">{p.coverEmoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                        <span className="text-[11px] text-slate-400">{formatDate(p.date)} · {p.readTime}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Footer tags + back */}
            <div className="mt-10 pt-8 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <Link href="/blog" className="blog-back-link"><IconArrowLeft size={15} /> All Articles</Link>
              <div className="flex items-center gap-2 flex-wrap">
                {post.tags.map((tag: string) => <span key={tag} className="blog-tag">{tag}</span>)}
              </div>
            </div>
          </div>

          {/* Sidebar — desktop */}
          <aside className="blog-article-sidebar" aria-label="Sidebar">
            <div className="blog-article-sidebar-inner">
              {/*
                ── Ad Slot: Sidebar (desktop ≥ 1024 px only) ────────────
                COMPLIANCE:
                • Sidebar column is hidden on mobile via CSS
                  (display:none at <1024 px) — no accidental tap risk
                  on small screens.
                • Sticky offset is top:88 px (below the fixed nav) so the
                  ad never overlaps navigation or the browser chrome.
                • sidebar-inner uses overflow:hidden + max-height to prevent
                  the ad from scrolling beyond the article region.
                • The ad does NOT overlay article text — it lives in a
                  separate 300 px grid column with a 48 px gutter.
                • "Advertisement" label always rendered above the ins tag.
                • min-height=250 px pre-reserved inside AdSlot to prevent CLS.
              */}
              <AdSlot slot={SLOT_SIDEBAR} format="rectangle" className="blog-ad-sidebar" />

              {related.length > 0 && (
                <div>
                  <p className="blog-sidebar-heading">Related Articles</p>
                  {related.map((p: any) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-sidebar-related-link">
                      <span className="blog-sidebar-related-emoji">{p.coverEmoji}</span>
                      <div className="min-w-0">
                        <p className="blog-sidebar-related-title line-clamp-2">{p.title}</p>
                        <p className="blog-sidebar-related-meta">{formatDate(p.date)} · {p.readTime}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Share */}
              <div>
                <p className="blog-sidebar-heading">Share this article</p>
                <div className="flex gap-2">
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="blog-share-btn flex-1 justify-center" aria-label="Share on Twitter">
                    <IconBrandTwitter size={16} />
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="blog-share-btn flex-1 justify-center" aria-label="Share on LinkedIn">
                    <IconBrandLinkedin size={16} />
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + postUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="blog-share-btn flex-1 justify-center" aria-label="Share on WhatsApp">
                    <IconBrandWhatsapp size={16} />
                  </a>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white text-center">
                <p className="font-bold text-sm mb-1">Open to Work</p>
                <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                  Need a React / Node.js / AI engineer? Let&apos;s connect.
                </p>
                <Link href="/joinme"
                  className="inline-block bg-white text-blue-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Hire Me →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
