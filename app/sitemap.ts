import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/components/utils/portfolio-data";
import { sitemapPosts } from "@/components/utils/portfolio-api";
import { pageCount, indexPath } from "@/components/utils/blog-pagination";
import { listBooks, getBook } from "@/components/utils/books-api";

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
// notice), /admin (disallowed in robots.ts), /blog?topic=… (noindex, follow —
// see components/blog/BlogIndexView.tsx), and any post flagged noindex (the
// agent service filters those out of /blogs/sitemap).

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

/**
 * Books: the index, each book, and EVERY chapter.
 *
 * The chapter URLs are the point. A fifteen-chapter book is fifteen pages of
 * on-topic prose, and they are only discoverable from inside the book — listing
 * just /books/{slug} would leave the pages that actually rank to be found by
 * crawl depth alone.
 *
 * Deliberately absent: /books/{slug}/read, which is noindex (it duplicates
 * every chapter, and indexing both would split the book against itself).
 *
 * Degrades to an empty list if the agent service is unavailable — the rest of
 * the sitemap must still be valid.
 */
async function getBookEntries(now: Date): Promise<MetadataRoute.Sitemap> {
  const books = await listBooks();
  if (books.length === 0) return [];

  const entries: MetadataRoute.Sitemap = [{
    url: `${SITE_URL}/books`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }];

  for (const b of books) {
    const modified = toDate(b.updatedAt ?? b.publishedAt ?? undefined, now);
    entries.push({
      url: `${SITE_URL}/books/${b.slug}`,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.9,
    });
    const full = await getBook(b.slug);
    for (const c of full?.toc || []) {
      entries.push({
        url: `${SITE_URL}/books/${b.slug}/${c.ordinal}`,
        lastModified: modified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }
  return entries;
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

  /*
    The archive pages. /blog is the entry point but only lists the newest
    slice; the numbered pages are where the older articles are linked from, so
    a crawler that never sees them treats the archive as orphaned.

    The count is derived from the posts this file lists — which excludes any
    post flagged noindex, so it can only ever run SHORT of the real archive,
    never past its end into a 404.
  */
  const archivePages: MetadataRoute.Sitemap = Array.from(
    { length: pageCount(merged.length) - 1 },
    (_, i) => ({
      url: `${SITE_URL}${indexPath(i + 2)}`,
      lastModified: newestPost ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })
  );

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

  const bookEntries = await getBookEntries(now);

  return [...staticEntries, ...blogIndex, ...archivePages, ...blogEntries, ...bookEntries];
}
