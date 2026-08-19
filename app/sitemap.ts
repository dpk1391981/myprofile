import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/components/utils/portfolio-data";
import { sitemapPosts } from "@/components/utils/portfolio-api";

const SITE_URL = (process.env.NEXT_PUBLIC_WEB_SITE || "https://officialdeepak.in").replace(/\/+$/, "");

/**
 * Regenerated hourly rather than on every crawl. A sitemap that re-queries the
 * agent service per request turns a crawler's polling into upstream load, and
 * the underlying content changes once a day at most.
 */
export const revalidate = 3600;

// Static routes with crawl priorities tuned for a portfolio.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "",            priority: 1.0,  changeFrequency: "weekly" },
  { path: "/about",      priority: 0.9,  changeFrequency: "monthly" },
  { path: "/experience", priority: 0.9,  changeFrequency: "monthly" },
  { path: "/projects",   priority: 0.95, changeFrequency: "monthly" },
  { path: "/skills",     priority: 0.8,  changeFrequency: "monthly" },
  { path: "/education",  priority: 0.7,  changeFrequency: "monthly" },
  { path: "/reviews",    priority: 0.6,  changeFrequency: "monthly" },
  { path: "/contact",    priority: 0.9,  changeFrequency: "monthly" },
  // The hire page. It is listed in llms.txt and linked from every article's
  // author box and CTA, but was missing here — a page that is internally
  // linked everywhere and absent from the sitemap reads to a crawler as an
  // oversight rather than as an intent signal.
  { path: "/joinme",     priority: 0.85, changeFrequency: "monthly" },
  // Keyword landing pages — the phrases this site targets in search.
  { path: "/react-developer-in-india",      priority: 0.95, changeFrequency: "weekly" },
  { path: "/software-developer-in-india",   priority: 0.95, changeFrequency: "weekly" },
  { path: "/javascript-developer-in-india", priority: 0.95, changeFrequency: "weekly" },
  { path: "/full-stack-developer-in-india", priority: 0.95, changeFrequency: "weekly" },
  { path: "/ai-engineer-in-india",          priority: 0.95, changeFrequency: "weekly" },
];
// Deliberately absent: /success (noindex — a form receipt), /moved (a redirect
// notice), /admin (disallowed in robots.ts), and /blog?topic=… (canonicalised
// back to /blog; see app/blog/page.tsx).

// Pull published blog posts from the content API (gracefully degrades to an
// empty list if the agent service is unavailable — the static routes and the
// hand-written BLOG_POSTS below still produce a valid sitemap).
async function getDbBlogSlugs(): Promise<{ slug: string; date?: string }[]> {
  const posts = await sitemapPosts();
  return posts.map((p) => ({ slug: p.slug, date: p.lastModified ?? undefined }));
}

/** Safe date parse — a malformed `lastModified` must not poison the whole file. */
function toDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Merge DB posts with static BLOG_POSTS (DB wins on slug collision).
  const dbPosts = await getDbBlogSlugs();
  const dbSlugs = new Set(dbPosts.map((p) => p.slug));
  const staticPosts = BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug)).map((p) => ({
    slug: p.slug,
    date: p.date,
  }));

  const merged = [...dbPosts, ...staticPosts].map((p) => ({
    slug: p.slug,
    lastModified: toDate(p.date, now),
  }));

  /*
    The blog index's own lastmod is the newest post it lists, not "now".
    Stamping every crawl with the current time is the fastest way to teach a
    crawler that this site's lastmod values mean nothing — after which it
    ignores them on the pages where they are true.
  */
  const newestPost = merged.reduce<Date | null>(
    (max, p) => (!max || p.lastModified > max ? p.lastModified : max),
    null
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // /blog is not in STATIC_ROUTES: it is the one static page whose lastmod is
  // derived from content rather than from the deploy.
  const blogIndex: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/blog`,
    lastModified: newestPost ?? now,
    changeFrequency: "daily",
    priority: 0.9,
  }];

  const blogEntries: MetadataRoute.Sitemap = merged
    // Newest first, so a crawler reading the file top-down meets fresh URLs
    // before the archive.
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .map((p, i) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.lastModified,
      changeFrequency: "monthly" as const,
      // The most recent handful carry a higher priority than the archive:
      // they are the pages most likely to be worth a fresh crawl.
      priority: i < 5 ? 0.85 : 0.7,
    }));

  return [...staticEntries, ...blogIndex, ...blogEntries];
}
