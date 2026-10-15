/**
 * The book `description` field, which authors write in Markdown.
 *
 * It was rendered as plain paragraphs, so a description pasted with headings
 * showed literal "# Title" and "## What You Will Learn" on the landing page,
 * and the same "#" marks went into the meta description, the JSON-LD and the
 * /books listing. Deliberately a tiny subset — headings, bullet/numbered lists,
 * paragraphs, inline emphasis/code stripped to text — because the output is
 * rendered as React text nodes (no HTML injection) and that is all the field
 * ever needs.
 */

export type DescBlock =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul" | "ol"; items: string[] };

/** **bold**, *em*, _em_, `code`, [text](url) -> their text. */
export function stripInline(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])[*_]([^*_\n]+)[*_](?=[^\w*]|$)/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

const words = (s: string) =>
  new Set(s.toLowerCase().replace(/[^\p{L}\p{N}.\s]/gu, " ").split(/\s+/).filter(Boolean));

/** Share of `a`'s words that also appear in `b`. */
function overlap(a: string, b: string): number {
  const A = words(a), B = words(b);
  if (!A.size) return 0;
  let n = 0;
  A.forEach((w) => { if (B.has(w)) n++; });
  return n / A.size;
}

export function parseDescription(
  text: string,
  /** The page already shows these right above; a description that opens by
   *  repeating them is dropped to its first real sentence. */
  context: { title?: string; subtitle?: string } = {}
): DescBlock[] {
  const blocks: DescBlock[] = [];
  let para: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ kind: "p", text: stripInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list?.items.length) blocks.push(list);
    list = null;
  };

  for (const raw of (text || "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    const ul = /^[-*+]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (h) {
      flushPara(); flushList();
      blocks.push({ kind: "h", text: stripInline(h[1].replace(/\s#+$/, "")) });
    } else if (ul || ol) {
      flushPara();
      const kind = ul ? "ul" : "ol";
      if (!list || list.kind !== kind) { flushList(); list = { kind, items: [] }; }
      list.items.push(stripInline((ul || ol)![1]));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara(); flushList();

  // Drop a leading restatement of the title / subtitle (first two blocks only).
  for (let i = 0; i < 2 && blocks.length; i++) {
    const b = blocks[0];
    if ("items" in b) break;
    const repeatsTitle = !!context.title && overlap(b.text, context.title) >= 0.7;
    const repeatsSub = !!context.subtitle && b.text.length < 160 &&
      overlap(context.subtitle, b.text) >= 0.7;
    if (repeatsTitle || repeatsSub) blocks.shift();
    else break;
  }
  return blocks.filter((b) => ("items" in b ? b.items.length : b.text));
}

/** One plain-text string for meta tags, JSON-LD and listing blurbs. */
export function descriptionPlain(
  text: string,
  context: { title?: string; subtitle?: string } = {}
): string {
  // Headings ("What you will learn") read as noise inside a one-line snippet.
  return parseDescription(text, context)
    .filter((b) => b.kind !== "h")
    .map((b) => ("items" in b ? b.items.join("; ") : b.text))
    // A heading-like line with no full stop would run into the next sentence
    // ("…Production Engineering Building modern…") once joined into one line.
    .map((t) => (/[.!?:;…]["')\]]?$/.test(t) ? t : `${t}.`))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
