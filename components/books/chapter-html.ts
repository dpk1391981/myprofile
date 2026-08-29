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

/**
 * Backticks leak the same way, and from the same place — chapter 5 of
 * JavaScript Core Engineer lists "- **`writable`**: A boolean that…" with the
 * asterisks repaired and the backticks still on the page. Same narrowness: a
 * pair on one line, no tags between them, so it can only ever match something
 * that was already meant to be a code span.
 */
const CODE = /`([^`<>\n]{1,120})`/g;

/** Everything that must be passed through untouched, kept as whole segments. */
const PROTECTED = /(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/gi;

export function repairEmphasis(html: string): string {
  return html
    .split(PROTECTED)
    .map((seg) =>
      /^<(pre|code)\b/i.test(seg)
        ? seg
        : seg.replace(BOLD, "<strong>$1</strong>").replace(CODE, "<code>$1</code>")
    )
    .join("");
}

/* ────────────────────────────────────────────────────────────────────────────
   PARAGRAPHS THE PIPELINE FORGOT

   The same defect as the asterisks above, one level up: some chapters come back
   with headings, <pre> and inline <code> as real HTML and every paragraph as
   BARE TEXT separated by blank lines. Chapter 3 of JavaScript Core Engineer has
   five <h2>, thirteen <pre> and not one <p> in 22KB of body.

   In HTML a blank line is a space, so the whole chapter renders as a single
   unbroken run — "…unless they capture large amounts of state. I recommend
   using closures judiciously…" arrives on one line, and `.bk-prose p`'s 1.35em
   of separation never applies because there are no paragraphs to apply it to.
   The heading margins vanish for the same reason they vanish for everything
   else on the page (see the specificity note in broadsheet.css), but even with
   those restored the prose underneath stays a wall.

   It is chapter-by-chapter, not book-by-book: chapters 1 and 5 of that same
   book DO have <p>. So this cannot be an all-or-nothing switch on the document
   — it has to wrap what is loose and leave what is already marked up alone.

   Rules, in the same spirit as the emphasis repair — repair what is
   unambiguous, touch nothing that might be deliberate:

     - Real block elements are lifted out whole and restored untouched, so a
       <pre>, a <ul> or a <table> can never be split or wrapped.
     - What is left is split on blank lines. Each piece becomes one <p>.
     - A piece whose lines are all "- x" or "1. x" becomes a list instead;
       those are the other half of the same leaked Markdown, and left as prose
       they collapse into one paragraph of run-together bullets.
     - Single newlines inside a piece join with a space, which is what Markdown
       means by them and what the browser was doing anyway.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Block-level elements lifted out before the split.
 *
 * Non-greedy, so a nested list closes at the inner </ul> and leaves a stray
 * </ul> behind in the text. That is handled rather than prevented: a fragment
 * that is nothing but tags is passed through instead of wrapped, so the worst
 * case is markup that stays exactly as broken as it arrived — never worse.
 */
const BLOCKS = new RegExp(
  "(" +
    [
      "<pre[\\s\\S]*?</pre>",
      "<ul[\\s\\S]*?</ul>",
      "<ol[\\s\\S]*?</ol>",
      "<table[\\s\\S]*?</table>",
      "<blockquote[\\s\\S]*?</blockquote>",
      "<figure[\\s\\S]*?</figure>",
      "<p[\\s\\S]*?</p>",
      "<h[1-6][\\s\\S]*?</h[1-6]>",
      "<hr\\s*/?>",
    ].join("|") +
  ")",
  "gi"
);

/** A fragment carrying no prose of its own — a stray closing tag, or nothing. */
const MARKUP_ONLY = /^(?:\s|<[^>]*>)*$/;

const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

/** One blank-line-separated fragment of loose text → one <p>, <ul> or <ol>. */
function wrapFragment(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return "";

  // A list only when EVERY line is an item. A single stray dash in the middle
  // of a paragraph — "the trade-off — is real" — must stay a paragraph.
  const items = (re: RegExp) =>
    lines.length >= 2 && lines.every((l) => re.test(l))
      ? lines.map((l) => `<li>${l.replace(re, "$1")}</li>`).join("")
      : null;

  const bullets = items(BULLET);
  if (bullets) return `<ul>${bullets}</ul>`;

  const numbers = items(NUMBERED);
  if (numbers) return `<ol>${numbers}</ol>`;

  return `<p>${lines.join(" ")}</p>`;
}

export function paragraphise(html: string): string {
  return html
    .split(BLOCKS)
    .map((seg, i) => {
      // Odd indices are the captured block elements — already markup.
      if (i % 2 === 1) return seg;
      if (MARKUP_ONLY.test(seg)) return seg;
      return seg.split(/\n\s*\n+/).map(wrapFragment).join("\n");
    })
    .join("\n");
}

/**
 * Everything a stored chapter body needs before it can be rendered: the
 * emphasis repair, then the paragraphs. In that order, so `**Block Scope**`
 * alone on a line is already a <strong> when it gets wrapped, rather than a
 * paragraph with visible asterisks in it.
 */
export function prepareBody(html: string): string {
  return paragraphise(repairEmphasis(html || ""));
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
  const { html: anchored, headings } = withHeadingAnchors(prepareBody(html));

  // Insert the anchor link inside each heading that now carries an id.
  const withLinks = anchored.replace(
    /<(h[23])([^>]*\bid=["']([^"']+)["'][^>]*)>/gi,
    (_m, tag: string, attrs: string, id: string) =>
      `<${tag}${attrs}><a class="bk-anchor" href="#${id}" aria-label="Link to this section">¶</a>`
  );

  return { html: withLinks, headings };
}
