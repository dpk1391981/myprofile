/**
 * Blog index pagination — shared by the index pages and by sitemap.ts.
 *
 * The index used to request a single page of 100 posts and render all of them.
 * At a daily publishing cadence that ceiling is about three months away, and
 * the failure is silent: post 101 keeps appearing in the sitemap while no page
 * on the site links to it any more. A URL a crawler can only reach through the
 * sitemap is crawled late and ranked worse, so the index pages itself instead.
 *
 * Kept in its own module (rather than exported from the view) so `app/sitemap.ts`
 * can compute the same page count without pulling a React tree into its graph.
 */

/** Articles per index page — the lead counts as one on page 1. */
export const POSTS_PER_PAGE = 12;

/** How many index pages `total` posts need (always at least 1). */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

/**
 * Canonical URL for an index page. Page 1 is `/blog`, never `/blog/page/1` —
 * two URLs listing the same articles is exactly the duplication this pagination
 * is meant to avoid.
 */
export function indexPath(page: number): string {
  return page <= 1 ? "/blog" : `/blog/page/${page}`;
}
