/**
 * Article HTML post-processing
 * ============================
 * The content agent stores article bodies as plain semantic HTML — `<h2>`,
 * `<p>`, `<ol>`, `<pre>`, `<code>` — with no ids on the headings. Two things
 * the page needs are therefore derived here rather than at write time:
 *
 *   1. STABLE HEADING ANCHORS. Without an `id`, a heading cannot be linked to,
 *      which costs the page both the in-page table of contents and Google's
 *      "jump to section" sitelinks. Slugs are derived from the heading text so
 *      they stay stable across re-renders, and de-duplicated so two sections
 *      called "Summary" do not collide.
 *
 *   2. THE OUTLINE. The same pass collects the headings into a list the page
 *      renders as its contents rail. Reading the outline out of the stored
 *      HTML — rather than keeping a separate field — means the rail can never
 *      drift from the article it describes.
 *
 * These operate on a trusted string: the HTML comes from our own database via
 * the agent service, and is already rendered with `dangerouslySetInnerHTML`
 * upstream. Nothing here escapes or sanitises, because nothing here is the
 * right place to do it — if that content ever becomes untrusted, it has to be
 * sanitised before it reaches this file.
 */

export type Heading = { id: string; text: string; level: 2 | 3 };

/** Strip tags and decode the handful of entities that appear in headings. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60)
      .replace(/^-|-$/g, "") || "section"
  );
}

/**
 * Add an `id` to every h2/h3 that lacks one and return the outline alongside
 * the rewritten HTML. A heading that already carries an id keeps it, so a
 * hand-written post can pin its own anchors.
 */
export function withHeadingAnchors(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, lvl: string, attrs: string, inner: string) => {
      const text = plainText(inner);
      if (!text) return match;

      const existing = /\bid=["']([^"']+)["']/i.exec(attrs);
      let id = existing?.[1];

      if (!id) {
        const base = slugify(text);
        id = base;
        let n = 2;
        while (used.has(id)) id = `${base}-${n++}`;
      }
      used.add(id);

      headings.push({ id, text, level: Number(lvl) as 2 | 3 });
      return existing
        ? match
        : `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
    }
  );

  return { html: out, headings };
}

/** Word count of the rendered text, used for `wordCount` in structured data. */
export function countWords(html: string): number {
  return plainText(html).split(/\s+/).filter(Boolean).length;
}
