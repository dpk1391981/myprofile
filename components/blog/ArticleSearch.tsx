"use client";

import dynamic from "next/dynamic";

/**
 * The floating search on article pages.
 *
 * Loaded lazily and client-only: article pages are the ones Core Web Vitals
 * are measured on, and nothing here is needed for the first paint. The button
 * itself only appears once the reader scrolls past the first screen.
 */
const BlogSearchSheet = dynamic(() => import("@/components/blog/BlogSearchSheet"), { ssr: false });

export default function ArticleSearch({ tags }: { tags: string[] }) {
  // The article's own tags are the most likely next search — "more like this".
  const suggestions = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean))).slice(0, 8);
  return <BlogSearchSheet suggestions={suggestions} suggestionsLabel="More on this article's topics" />;
}
