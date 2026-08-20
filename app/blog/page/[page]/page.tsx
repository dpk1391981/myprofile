import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BlogIndexView, { buildBlogIndexMetadata, blogPageCount } from "@/components/blog/BlogIndexView";

/**
 * /blog/page/2, /blog/page/3, … — the archive.
 *
 * WHY THIS ROUTE EXISTS. The index used to render one API page of posts and
 * stop. Everything past that ceiling stayed in the sitemap with no internal
 * link pointing at it, which is the slowest and weakest way into Google's
 * index. Now every published post is reachable from /blog in at most two
 * clicks, and each archive page is its own indexable, self-canonical URL.
 *
 * A static segment beats a dynamic one in Next's router, so this takes
 * precedence over /blog/[slug]; the cost is that "page" is not available as a
 * post slug.
 */
export const revalidate = 300;

function parsePage(raw: string): number | null {
  // Only bare positive integers. "01", "2.0" and "2abc" are other spellings of
  // a URL that already exists — they must 404 rather than duplicate it.
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

export async function generateMetadata(
  { params, searchParams }: { params: { page: string }; searchParams: { topic?: string } }
): Promise<Metadata> {
  const page = parsePage(params.page);
  if (page === null) return {};
  return buildBlogIndexMetadata({ page, topic: searchParams?.topic || "" });
}

export default async function BlogArchivePage(
  { params, searchParams }: { params: { page: string }; searchParams: { topic?: string } }
) {
  const page = parsePage(params.page);
  if (page === null) notFound();

  const topic = searchParams?.topic || "";

  // /blog/page/1 is /blog under a second URL. Redirect rather than render, so
  // the duplicate never gets crawled or linked.
  if (page === 1) redirect(topic ? `/blog?topic=${encodeURIComponent(topic)}` : "/blog");

  // Past the end of the archive there is no page — a soft 200 on an empty list
  // is the "soft 404" Search Console flags.
  const total = await blogPageCount(topic);
  if (page > total) notFound();

  return <BlogIndexView page={page} topic={topic} />;
}
