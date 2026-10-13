/**
 * The posts the blog index lists — API rows merged with the hand-written
 * fallbacks, newest first. Shared by the index pages and /api/blog/search so
 * both search exactly the same list.
 */
import { cache } from "react";
import { BLOG_POSTS } from "@/components/utils/portfolio-data";
import { listAllPosts } from "@/components/utils/portfolio-api";

export type IndexPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  /** The full release instant, "2026-08-21T11:04:00+05:30".
   *
   *  Separate from `date` on purpose. `date` stays a bare YYYY-MM-DD because
   *  sorting, the `dateTime` attribute and the JSON-LD all want a plain day;
   *  this is the only field that knows the time, and it is empty for the
   *  hand-written fallback posts, which never had one. */
  publishedAt: string;
  readTime: string;
  tags: string[];
  coverEmoji: string;
  featured: boolean;
  category: string;
  /** True when the post's own page will answer `noindex`. */
  noIndex: boolean;
  /** Unique readers. Display only here — the index does not track anything;
   *  the count is written by the article page's own beacon. */
  views: number;
};

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
    publishedAt: p.publishedAt || "",
    readTime:    p.readTime,
    tags:        p.tags ?? [],
    coverEmoji:  p.coverEmoji,
    featured:    p.featured,
    category:    p.category || "",
    noIndex:     Boolean(p.noIndex) || Boolean(p.robots?.includes("noindex")),
    views:       p.views ?? 0,
  }));
}

/** Every post the index knows about, newest first.
 *
 *  Wrapped in React's per-request cache: metadata, the page count and the view
 *  all ask for it during one render, and only the first call should pay for
 *  the merge and sort. (The upstream fetch is deduplicated by Next already.) */
export const getAllPosts = cache(async (): Promise<IndexPost[]> => {
  const dbPosts = await getDbPosts();
  const staticPosts: IndexPost[] = BLOG_POSTS.filter(
    (sp) => !dbPosts.some((dp) => dp.slug === sp.slug)
    // No `publishedAt`: these were hand-written and only ever carried a day.
    // formatISTDateTime() falls back to the date alone rather than inventing a
    // midnight for them.
  ).map((p) => ({ ...p, category: "", noIndex: false, publishedAt: "", views: 0 }));

  return [...dbPosts, ...staticPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

