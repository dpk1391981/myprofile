import { revalidatePath } from "next/cache";

/**
 * Purge every cached surface a post appears on.
 *
 * The public article page is ISR with `revalidate = 300` (app/blog/[slug]/page.tsx),
 * and the upstream reads inside it are cached for the same window. That is the
 * right default for crawler traffic, but it is the wrong answer after an admin
 * edit: without this, "Publish" is followed by up to five minutes of the old
 * page — or of a 404, if the path was first requested before the post existed.
 *
 * The route-level purge (`"/blog/[slug]", "page"`) is what covers a delete and a
 * slug change, where the path that needs dropping is not the one we now hold.
 */
export function revalidateBlog(slug?: string | null) {
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  if (slug) revalidatePath(`/blog/${slug}`);
  // The feeds are built from the same list and would otherwise advertise a
  // post that 404s, or keep advertising one that was deleted.
  revalidatePath("/blog/rss.xml");
  revalidatePath("/sitemap.xml");
}
