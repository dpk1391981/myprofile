import type { Metadata } from "next";
import BlogIndexView, { buildBlogIndexMetadata } from "@/components/blog/BlogIndexView";

/**
 * RENDERING. The index reads `searchParams` for the topic filter, so Next
 * renders it per request. That is cheaper than it looks: `apiFetch` caches the
 * upstream GET for 300s, so a burst of requests costs one call to the agent
 * service, and the article pages — the ones Core Web Vitals are actually
 * measured on — are statically regenerated (see app/blog/[slug]/page.tsx).
 *
 * Page 1 only. Pages 2…n live at /blog/page/[page]; both render the same view
 * (components/blog/BlogIndexView.tsx).
 */
export const revalidate = 300;

export async function generateMetadata(
  { searchParams }: { searchParams: { topic?: string } }
): Promise<Metadata> {
  return buildBlogIndexMetadata({ page: 1, topic: searchParams?.topic || "" });
}

export default async function BlogPage(
  { searchParams }: { searchParams: { topic?: string } }
) {
  return <BlogIndexView page={1} topic={searchParams?.topic || ""} />;
}
