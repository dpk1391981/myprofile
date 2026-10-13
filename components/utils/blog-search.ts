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
 * WHY IT FEELS SMARTER THAN KEYWORD MATCHING, WITHOUT AN LLM. Four cheap
 * steps do most of what readers mean by "AI search", in microseconds rather
 * than the second-plus and per-query cost of a model call:
 *   1. Filler is dropped, so "show me articles about k8s" searches "k8s".
 *   2. Synonyms — "k8s" also finds "kubernetes", "llm" finds "gpt" and "rag".
 *   3. Typos are corrected against the archive's own vocabulary, and the
 *      correction is reported ("Showing results for kubernetes").
 *   4. When nothing matches every word, the closest partial matches are
 *      returned and flagged, instead of an empty page.
 *
 * Pure and framework-free, so it can be unit-tested or moved without dragging
 * React along.
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

// Words that match nearly every post, or that only phrase the request ("show
// me articles about …"), and so carry no signal. Dropped unless the query is
// made of nothing else.
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for",
  "from", "how", "i", "in", "is", "it", "of", "on", "or", "the", "to", "what",
  "when", "why", "with", "vs", "versus", "your", "you", "me", "my", "we",
  "about", "article", "articles", "post", "posts", "blog", "blogs", "show",
  "find", "get", "any", "some", "something", "learn", "read", "using", "use",
]);

/*
  Shorthand → the words posts actually use. Keys and values are compact form
  (lowercase, no separators). A term matches if it OR any of these does, so
  synonyms widen a term rather than replace it.
*/
const SYNONYMS: Record<string, string[]> = {
  k8s: ["kubernetes"],
  kube: ["kubernetes"],
  js: ["javascript"],
  ts: ["typescript"],
  py: ["python"],
  reactjs: ["react"],
  next: ["nextjs"],
  node: ["nodejs"],
  llm: ["llms", "gpt", "openai", "langchain", "rag", "claude", "gemini"],
  llms: ["llm", "gpt", "openai", "langchain", "rag"],
  genai: ["ai", "llm", "gpt", "generative"],
  ai: ["ml", "llm", "aiml"],
  ml: ["ai", "machinelearning", "aiml"],
  gpt: ["openai", "chatgpt"],
  db: ["database", "databases", "sql", "mysql", "postgresql", "mongodb"],
  database: ["db", "sql", "mysql", "postgresql", "mongodb"],
  postgres: ["postgresql"],
  mongo: ["mongodb"],
  auth: ["authentication", "authorization", "oauth"],
  perf: ["performance"],
  a11y: ["accessibility"],
  ci: ["cicd", "githubactions", "pipeline"],
  cicd: ["ci", "githubactions", "pipeline", "devops"],
  docker: ["container", "containers"],
  container: ["docker", "kubernetes"],
  cloud: ["aws", "gcp", "azure"],
  gcp: ["googlecloud"],
  infra: ["infrastructure", "devops"],
  sec: ["security"],
  vuln: ["vulnerability", "vulnerabilities", "security", "cve"],
  css: ["tailwind", "styling"],
  seo: ["search", "google"],
};

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

/** Levenshtein distance, giving up as soon as it must exceed `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// ── Per-archive index ─────────────────────────────────────────────────────
// Field word lists and the vocabulary are built once per post list and reused
// for every query against it. Keyed by array identity: the index pages hand in
// the same per-request list, and the API route's list is the same object for
// as long as Next serves it from cache.

type Field = { words: string[]; compact: string; weight: number };
type Doc<T> = { post: T; fields: Field[] };
type Index<T> = {
  docs: Doc<T>[];
  /** Every word in titles, tags and categories → how many posts use it. */
  vocab: Map<string, number>;
  /** Tag/category labels by compact key, with post counts. */
  topics: Map<string, { label: string; count: number }>;
};

const W_TITLE = 5;
const W_TAG   = 4;
const W_DESC  = 1.5;
const W_SLUG  = 1;

const indexes = new WeakMap<object, Index<Searchable>>();

function buildIndex<T extends Searchable>(posts: T[]): Index<T> {
  const cached = indexes.get(posts);
  if (cached) return cached as Index<T>;

  const vocab = new Map<string, number>();
  const topics = new Map<string, { label: string; count: number }>();
  const docs = posts.map((post) => {
    const labels = [post.category, ...post.tags].filter(Boolean).map((t) => String(t).trim());
    const tagText = labels.join(" ");
    const seen = new Set<string>();
    for (const w of [...words(post.title), ...words(tagText)]) {
      if (w.length < 3 || seen.has(w)) continue;
      seen.add(w);
      vocab.set(w, (vocab.get(w) ?? 0) + 1);
    }
    for (const l of labels) {
      const key = compact(l);
      if (!key) continue;
      const e = topics.get(key) ?? { label: l, count: 0 };
      e.count += 1;
      topics.set(key, e);
    }
    return {
      post,
      fields: [
        { words: words(post.title),       compact: compact(post.title),       weight: W_TITLE },
        { words: words(tagText),          compact: compact(tagText),          weight: W_TAG },
        { words: words(post.description), compact: compact(post.description), weight: W_DESC },
        { words: words(post.slug),        compact: compact(post.slug),        weight: W_SLUG },
      ],
    };
  });

  const index = { docs, vocab, topics };
  indexes.set(posts, index as Index<Searchable>);
  return index;
}

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
  if (term.length >= 2 && f.words.some((w) => w.startsWith(term))) return 2 * f.weight;
  if (term.length >= 4 && f.compact.includes(term)) return f.weight;
  return 0;
}

/** Best score for a term across a post, counting synonyms at 70%. */
function scoreTerm(term: string, fields: Field[]): number {
  let best = 0;
  for (const f of fields) best = Math.max(best, scoreField(term, f));
  for (const alt of SYNONYMS[term] ?? []) {
    for (const f of fields) best = Math.max(best, 0.7 * scoreField(alt, f));
  }
  return best;
}

/** Does any word in the archive answer this term (directly or via synonym)? */
function knownTerm(term: string, vocab: Map<string, number>): boolean {
  if (SYNONYMS[term]) return true;
  let found = false;
  vocab.forEach((_, w) => {
    if (!found && (w === term || w.startsWith(term) || (term.length >= 4 && w.includes(term)))) found = true;
  });
  return found;
}

/** Closest archive word to a misspelt term, preferring common words. */
function correctTerm(term: string, vocab: Map<string, number>): string | null {
  if (term.length < 4 || /^\d+$/.test(term)) return null;
  const max = term.length >= 8 ? 2 : 1;
  let best: string | null = null;
  let bestD = max + 1;
  let bestN = 0;
  vocab.forEach((n, w) => {
    const d = editDistance(term, w, max);
    if (d < bestD || (d === bestD && n > bestN)) { best = w; bestD = d; bestN = n; }
  });
  return bestD <= max ? best : null;
}

export type SearchOutcome<T> = {
  results: T[];
  /** The query actually searched, when typos were corrected. */
  corrected?: string;
  /** True when no post matched every word and these are the closest matches. */
  partial?: boolean;
  /** Tags/categories the query names, most-used first. */
  topics: { label: string; count: number }[];
  /** Whole-query completions of the last, partly typed word. */
  completions: string[];
};

/**
 * The full search. Posts matching every term, best first; order among equal
 * scores is the input order, so a newest-first list keeps recency as the
 * tie-break.
 */
export function search<T extends Searchable>(posts: T[], rawQuery: string): SearchOutcome<T> {
  const q = normaliseQuery(rawQuery);
  let terms = queryTerms(q);
  if (!terms.length) return { results: posts, topics: [], completions: [] };

  const index = buildIndex(posts);

  // ── Typo correction against the archive's own words ──
  let corrected: string | undefined;
  const fixes = new Map<string, string>();
  for (const t of terms) {
    if (knownTerm(t, index.vocab)) continue;
    const c = correctTerm(t, index.vocab);
    if (c) fixes.set(t, c);
  }
  if (fixes.size) {
    terms = terms.map((t) => fixes.get(t) ?? t);
    // Echo the reader's own wording with only the misspelt words swapped.
    corrected = q.split(" ").map((w) => fixes.get(compact(w)) ?? w).join(" ");
  }

  const phrase = compact(corrected ?? q);
  const scored: { post: T; score: number; hits: number; i: number }[] = [];

  index.docs.forEach(({ post, fields }, i) => {
    let score = 0;
    let hits = 0;
    for (const term of terms) {
      const s = scoreTerm(term, fields);
      if (s > 0) { score += s; hits += 1; }
    }
    if (!hits) return;
    // The whole query appearing as written in the title is the strongest
    // signal there is — "react server components" should lead with the post
    // titled that, not one that mentions each word somewhere.
    if (terms.length > 1 && fields[0].compact.includes(phrase)) score += 10 * terms.length;
    scored.push({ post, score, hits, i });
  });

  // AND first: ranking several half-matches above one full match is what
  // makes site search feel broken. Only when nothing matches every word do the
  // closest partial matches stand in — flagged, so the UI can say so.
  const full = scored.filter((s) => s.hits === terms.length);
  const partial = !full.length && terms.length > 1;
  const pool = partial ? scored.filter((s) => s.hits >= Math.ceil(terms.length / 2)) : full;
  const results = pool
    .sort((a, b) => b.hits - a.hits || b.score - a.score || a.i - b.i)
    .map((s) => s.post);

  // ── Suggestions ──
  const topics: { label: string; count: number }[] = [];
  index.topics.forEach((t, key) => {
    if (terms.some((term) => key === term || (term.length >= 2 && key.startsWith(term)) ||
        (SYNONYMS[term] ?? []).includes(key))) topics.push(t);
  });
  topics.sort((a, b) => b.count - a.count);

  // Complete the word being typed: "kube" → "kubernetes", keeping the rest of
  // the query as written.
  const completions: string[] = [];
  const parts = q.split(" ");
  const last = compact(parts[parts.length - 1] ?? "");
  if (last.length >= 2 && !corrected) {
    const head = parts.slice(0, -1).join(" ");
    Array.from(index.vocab.entries())
      // Two posts minimum: a word only one title uses ("reaches") is noise
      // as a suggestion, however well it completes the prefix.
      .filter(([w, n]) => n >= 2 && w.startsWith(last) && w !== last)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .forEach(([w]) => completions.push(head ? `${head} ${w}` : w));
  }

  return {
    results,
    ...(corrected ? { corrected } : {}),
    ...(partial && results.length ? { partial: true } : {}),
    topics: topics.slice(0, 4),
    completions,
  };
}

/** Just the ranked posts — for callers that do not show suggestions. */
export function searchPosts<T extends Searchable>(posts: T[], rawQuery: string): T[] {
  return search(posts, rawQuery).results;
}

/** The query words worth highlighting in a result — filler dropped, as typed. */
export function highlightWords(rawQuery: string): string[] {
  const ws = normaliseQuery(rawQuery).split(" ").filter((w) => w.length > 1);
  const meaningful = ws.filter((w) => !STOPWORDS.has(compact(w)));
  return meaningful.length ? meaningful : ws;
}
