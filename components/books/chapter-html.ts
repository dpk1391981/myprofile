import { withHeadingAnchors, type Heading } from "@/components/utils/article-html";

/**
 * Markdown that survived the pipeline.
 *
 * The author agent writes Markdown and the service converts it to HTML, but
 * emphasis inside a paragraph occasionally comes through literally — chapter 10
 * of Advanced Automation QA renders "The first metric you should consider is
 * **Test Coverage**." with the asterisks visible. It is a small defect on the
 * pages that do all of the site's ranking, and it reads as carelessness on a
 * book that is otherwise clean.
 *
 * Fixing it at the source is right; catching it here is cheap insurance, and it
 * repairs the chapters that are ALREADY published without regenerating them.
 *
 * Deliberately narrow:
 *   - `**bold**` only. Single-asterisk emphasis is far too easy to hit by
 *     accident (a glob, a footnote marker, a multiplication) and the cost of a
 *     false positive is mangled prose.
 *   - The span may not contain a tag or a line break, so it can never wrap
 *     across markup and produce overlapping elements.
 *   - Code is left completely alone: `**kwargs` in a Python listing is code,
 *     not emphasis, and rewriting it would be a genuine error rather than a
 *     cosmetic one.
 */
const BOLD = /\*\*(?!\s)([^*<>\n]{1,200}?)(?<!\s)\*\*/g;

/** Everything that must be passed through untouched, kept as whole segments. */
const PROTECTED = /(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/gi;

export function repairEmphasis(html: string): string {
  return html
    .split(PROTECTED)
    .map((seg) =>
      /^<(pre|code)\b/i.test(seg) ? seg : seg.replace(BOLD, "<strong>$1</strong>")
    )
    .join("");
}

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
  const { html: anchored, headings } = withHeadingAnchors(repairEmphasis(html || ""));

  // Insert the anchor link inside each heading that now carries an id.
  const withLinks = anchored.replace(
    /<(h[23])([^>]*\bid=["']([^"']+)["'][^>]*)>/gi,
    (_m, tag: string, attrs: string, id: string) =>
      `<${tag}${attrs}><a class="bk-anchor" href="#${id}" aria-label="Link to this section">¶</a>`
  );

  return { html: withLinks, headings };
}
