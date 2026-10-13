/**
 * Blog search — ranked keyword matching over the index listing.
 *
 * WHY HERE AND NOT UPSTREAM. The index already holds every post's title,
 * description, tags and category, fetched once and cached by Next for 300s
 * (see listAllPosts). Searching that list in memory costs no extra request to
 * the agent service and no MySQL work. At a few hundred posts it is well under
 * a millisecond. A FULLTEXT query upstream would mean a network round trip per
 * search, and would not match partial words ("kube" → "kubernetes") anyway.
 * Revisit if the archive passes a few thousand posts.
 *
 * Pure and framework-free, so it can be unit-tested or moved to an API route
 * without dragging React along.
 */

/** Longest query honoured. Anything past this is noise or abuse, and the work
 *  per post grows with the number of terms. */
export const MAX_QUERY_LENGTH = 80;
const MAX_TERMS = 8;

/** Fields a searchable post must expose — IndexPost satisfies this. */
export type Searchable = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
};

// Words that match nearly every post and so carry no signal. Dropped unless the
// query is made of nothing else ("how to" still searches for something).
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i",
  "in", "is", "it", "of", "on", "or", "the", "to", "what", "when", "why",
  "with", "vs", "your", "you",
]);

/** Lowercase, accents stripped. "Node.js" → "node.js". */
function fold(s: string): string {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Separators gone entirely, so "Node.js", "node js" and "nodejs" all agree. */
function compact(s: string): string {
  return fold(s).replace(/[^a-z0-9]+/g, "");
}

function words(s: string): string[] {
  return fold(s).split(/[^a-z0-9]+/).filter(Boolean);
}

/** Trim, cap and collapse whitespace — the form a query is echoed back in. */
export function normaliseQuery(raw: string | undefined | null): string {
  return String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

/**
 * Query → terms. A term is the compact form of each whitespace-separated word,
 * so "next.js" stays one term ("nextjs") rather than becoming "next" + "js".
 */
function queryTerms(q: string): string[] {
  const all = Array.from(new Set(q.split(" ").map(compact).filter(Boolean)));
  const meaningful = all.filter((t) => !STOPWORDS.has(t));
  return (meaningful.length ? meaningful : all).slice(0, MAX_TERMS);
}

type Field = { words: string[]; compact: string; weight: number };

/*
  Per-term score against one field:
    exact word   → 3 × weight
    word prefix  → 2 × weight   ("kube" finds "kubernetes")
    inside the compacted field → 1 × weight, only for terms of 4+ characters,
      which is what lets "nodejs" find "Node.js" without letting "ai" match the
      middle of "explain".
*/
function scoreField(term: string, f: Field): number {
  if (f.words.includes(term)) return 3 * f.weight;
  if (f.words.some((w) => w.startsWith(term))) return 2 * f.weight;
  if (term.length >= 4 && f.compact.includes(term)) return f.weight;
  return 0;
}

const W_TITLE = 5;
const W_TAG   = 4;
const W_DESC  = 1.5;
const W_SLUG  = 1;

/**
 * Posts matching every term, best first. Order among equal scores is the input
 * order, so passing a newest-first list keeps recency as the tie-break.
 */
export function searchPosts<T extends Searchable>(posts: T[], rawQuery: string): T[] {
  const q = normaliseQuery(rawQuery);
  const terms = queryTerms(q);
  if (!terms.length) return posts;

  const phrase = compact(q);
  const scored: { post: T; score: number; i: number }[] = [];

  posts.forEach((post, i) => {
    const tagText = [post.category, ...post.tags].filter(Boolean).join(" ");
    const fields: Field[] = [
      { words: words(post.title),       compact: compact(post.title),       weight: W_TITLE },
      { words: words(tagText),          compact: compact(tagText),          weight: W_TAG },
      { words: words(post.description), compact: compact(post.description), weight: W_DESC },
      { words: words(post.slug),        compact: compact(post.slug),        weight: W_SLUG },
    ];

    let score = 0;
    for (const term of terms) {
      let best = 0;
      for (const f of fields) best = Math.max(best, scoreField(term, f));
      // AND semantics: a post missing any term is not a result. Ranking several
      // half-matches above one full match is what makes site search feel broken.
      if (best === 0) return;
      score += best;
    }

    // The whole query appearing as written in the title is the strongest
    // signal there is — "react server components" should lead with the post
    // titled that, not one that mentions each word somewhere.
    if (terms.length > 1 && fields[0].compact.includes(phrase)) score += 10 * terms.length;

    scored.push({ post, score, i });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((s) => s.post);
}
