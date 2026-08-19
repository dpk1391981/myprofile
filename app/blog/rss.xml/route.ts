/**
 * /blog/rss.xml — the feed.
 *
 * WHY THIS EXISTS. The site had a sitemap and an llms.txt but no feed, which
 * left the blog with no push-style discovery path at all: no reader can
 * subscribe, and none of the aggregators that still crawl RSS (including
 * Google's own Reader-era infrastructure and most AI training/answer pipelines)
 * had anything to poll. A sitemap says "these URLs exist"; a feed says "this
 * one is new", and for a blog publishing on a daily cron that difference is the
 * whole point.
 *
 * Same merge rule as sitemap.ts and llms.txt: the database is the source of
 * truth, the hand-written BLOG_POSTS fill in behind it, and on a slug collision
 * the database wins. `listPosts` swallows its own errors, so an agent service
 * that is down produces a valid but short feed rather than a 500.
 *
 * NOTE: a file at public/blog/rss.xml would SHADOW this route — Next serves
 * static assets before route handlers.
 */
import { BLOG_POSTS, PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { listPosts } from "@/components/utils/portfolio-api";

const SITE_URL = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

// Rebuilt hourly. Feed readers poll far more often than a daily cron publishes.
export const revalidate = 3600;

const MAX_ITEMS = 30;

/** XML text escaping. Everything interpolated below goes through this. */
function xml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822, which is what RSS 2.0 requires — not ISO 8601. */
function rfc822(dateStr: string): string {
  const d = new Date(dateStr);
  return (Number.isNaN(d.getTime()) ? new Date() : d).toUTCString();
}

export async function GET() {
  const { posts } = await listPosts({ limit: MAX_ITEMS });

  const fromDb = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.publishedAt || p.date || "",
    category: p.category || "",
    tags: p.tags ?? [],
  }));

  const dbSlugs = new Set(fromDb.map((p) => p.slug));
  const fromStatic = BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug)).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: "",
    tags: p.tags ?? [],
  }));

  const items = [...fromDb, ...fromStatic]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, MAX_ITEMS);

  const feedTitle = `${PERSONAL_INFO.fullName} — Engineering Blog`;
  const feedDesc =
    `Articles on React and Next.js performance, Generative AI and RAG engineering, ` +
    `Node.js and MERN architecture, by ${PERSONAL_INFO.fullName}, ${PERSONAL_INFO.title} ` +
    `at ${PERSONAL_INFO.currentWork.company}.`;
  const lastBuild = items[0]?.date ? rfc822(items[0].date) : new Date().toUTCString();

  // Contact comes from NEXT_PUBLIC_EMAIL_ID (same source as PERSONAL_INFO.email).
  // If it is unset, omit the element rather than emit an empty/placeholder address —
  // a malformed managingEditor fails feed validators.
  const managingEditor = PERSONAL_INFO.email
    ? `    <managingEditor>${xml(PERSONAL_INFO.email)} (${xml(PERSONAL_INFO.fullName)})</managingEditor>\n`
    : "";

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(feedTitle)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${xml(feedDesc)}</description>
    <language>en-in</language>
    <copyright>© ${new Date().getFullYear()} ${xml(PERSONAL_INFO.fullName)}</copyright>
${managingEditor}    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>officialdeepak.in</generator>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map((p) => {
    const url = `${SITE_URL}/blog/${p.slug}`;
    const categories = [p.category, ...p.tags]
      .filter(Boolean)
      .slice(0, 6)
      .map((c) => `      <category>${xml(String(c))}</category>`)
      .join("\n");
    return `    <item>
      <title>${xml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>${xml(PERSONAL_INFO.fullName)}</dc:creator>
      <description>${xml(p.description)}</description>
${categories}
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
