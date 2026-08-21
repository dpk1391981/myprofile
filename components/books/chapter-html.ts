import { withHeadingAnchors, type Heading } from "@/components/utils/article-html";

/**
 * Prepare a chapter body for reading.
 *
 * Reuses the blog's `withHeadingAnchors` rather than reimplementing it — the
 * slug rules must match, or a link copied from a chapter would not resolve the
 * same way one copied from an article does.
 *
 * On top of that it injects the visible ¶ affordance, which is what makes a
 * section linkable in practice: an id nobody can see is an anchor nobody uses.
 */
export function prepareChapter(html: string): { html: string; headings: Heading[] } {
  const { html: anchored, headings } = withHeadingAnchors(html || "");

  // Insert the anchor link inside each heading that now carries an id.
  const withLinks = anchored.replace(
    /<(h[23])([^>]*\bid=["']([^"']+)["'][^>]*)>/gi,
    (_m, tag: string, attrs: string, id: string) =>
      `<${tag}${attrs}><a class="bk-anchor" href="#${id}" aria-label="Link to this section">¶</a>`
  );

  return { html: withLinks, headings };
}
