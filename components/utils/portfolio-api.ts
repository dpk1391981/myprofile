/**
 * Portfolio content API client
 * =============================
 * The blog and contact data live in MySQL (`portfolio_db`) on the VPS that runs
 * the agent service. This site is deployed on Vercel and cannot open a database
 * connection to that host, so everything goes over HTTP to the agent service's
 * portfolio routes instead.
 *
 *   Production base: https://ai.vtechxhub.com/api/v1
 *   Routes:          /portfolio/blogs, /portfolio/blogs/{slug}, /portfolio/contact, …
 *
 * SERVER-SIDE ONLY. `INTERNAL_KEY` must never reach the browser, so nothing in
 * this file may be imported from a "use client" component.
 *
 * READ PATHS DEGRADE, THEY DO NOT THROW. If the agent service is down or slow,
 * the blog index renders empty rather than returning a 500 for the whole site —
 * a portfolio whose About page dies because a blog API is unreachable is a worse
 * outcome than a portfolio with a temporarily empty blog list. Write paths
 * (contact, admin) do surface their errors, because silently swallowing a failed
 * enquiry would lose a real message.
 */

const API_BASE = (
  process.env.PORTFOLIO_API_URL || "https://ai.vtechxhub.com/api/v1"
).replace(/\/+$/, "");

const INTERNAL_KEY = process.env.PORTFOLIO_API_KEY || "";

/** Read timeout. Vercel's own limit is much higher; this keeps a hung upstream
 *  from holding a page render open until the platform kills it. */
const READ_TIMEOUT_MS = 8000;

export type PortfolioPost = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverEmoji: string;
  readTime: string;
  wordCount: number;
  featured: boolean;
  status: string;
  /** Unique visitors, and of those the ones who actually read it. Present on
   *  listings as well as the single post — see _shape_post upstream. */
  views?: number;
  reads?: number;
  date: string | null;
  publishedAt: string | null;
  sourceUrl: string;
  sourceTitle: string;
  /** Meta-robots directive for the post's own page. Present on listings too, so
   *  the index and the feed can agree with what the article page will emit. */
  robots?: string;
  noIndex?: boolean;
  // Present only on the single-post endpoint
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  seoKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  sources?: string[];
  faq?: { question: string; answer: string }[];
  schemaJsonLd?: Record<string, unknown> | null;
  updatedAt?: string | null;
};

type FetchOpts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  revalidate?: number | false;
  timeoutMs?: number;
  /** Statuses whose JSON body IS the answer rather than a failure. A 422 from
   *  the contact route carries the per-field messages the sender needs to see;
   *  throwing on it turns "your message is too short" into "server error". */
  jsonStatuses?: number[];
  /** Extra request headers. Used by the view beacon to pass the reader's own IP
   *  and user agent through, since the upstream would otherwise fingerprint
   *  Vercel's egress node and count every reader as the same person. */
  headers?: Record<string, string>;
};

async function apiFetchRaw<T>(
  path: string,
  opts: FetchOpts = {}
): Promise<{ status: number; data: T }> {
  const {
    method = "GET",
    body,
    auth = false,
    revalidate = 300,
    timeoutMs = READ_TIMEOUT_MS,
    jsonStatuses = [],
    headers: extraHeaders,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && INTERNAL_KEY) headers["X-Internal-Key"] = INTERNAL_KEY;
  if (extraHeaders) Object.assign(headers, extraHeaders);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      // Authenticated and mutating calls must never be served from a cache.
      ...(method !== "GET" || auth
        ? { cache: "no-store" as const }
        : { next: { revalidate: revalidate === false ? 0 : revalidate } }),
    });

    // Read the body once — a stream cannot be consumed twice, and both the
    // error path and the tolerated-status path need it.
    const raw = await res.text().catch(() => "");

    if (!res.ok) {
      if (jsonStatuses.includes(res.status)) {
        try {
          return { status: res.status, data: JSON.parse(raw) as T };
        } catch {
          // Not the JSON we were promised — fall through and throw.
        }
      }
      throw new Error(`${method} ${path} → ${res.status} ${raw.slice(0, 200)}`);
    }
    return { status: res.status, data: JSON.parse(raw) as T };
  } finally {
    clearTimeout(timer);
  }
}

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  return (await apiFetchRaw<T>(path, opts)).data;
}

// ── Reads (degrade to empty) ─────────────────────────────────────────────────

export async function listPosts(params: {
  limit?: number;
  offset?: number;
  category?: string;
  featured?: boolean;
  tag?: string;
} = {}): Promise<{ posts: PortfolioPost[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.offset !== undefined) qs.set("offset", String(params.offset));
  if (params.category) qs.set("category", params.category);
  if (params.featured !== undefined) qs.set("featured", String(params.featured));
  if (params.tag) qs.set("tag", params.tag);

  try {
    return await apiFetch<{ posts: PortfolioPost[]; total: number }>(
      `/portfolio/blogs${qs.toString() ? `?${qs}` : ""}`
    );
  } catch (err) {
    console.error("[portfolio-api] listPosts failed:", (err as Error).message);
    return { posts: [], total: 0 };
  }
}

/**
 * Every published post, not just the first page.
 *
 * `listPosts` is capped at the API's maximum page size (100). That was fine
 * while the blog was small and quietly wrong once it was not: post 101 would
 * have appeared in the sitemap and nowhere else, with no internal link pointing
 * at it — the slowest possible path into the index. This walks the pages until
 * the reported total is covered, bounded by MAX_PAGES so a bad `total` cannot
 * spin the render.
 */
const PAGE = 100;
const MAX_PAGES = 20;

export async function listAllPosts(): Promise<PortfolioPost[]> {
  const first = await listPosts({ limit: PAGE, offset: 0 });
  const out = [...first.posts];
  const pages = Math.min(Math.ceil((first.total || 0) / PAGE), MAX_PAGES);

  for (let i = 1; i < pages; i++) {
    const next = await listPosts({ limit: PAGE, offset: i * PAGE });
    if (!next.posts.length) break; // Upstream disagrees with its own total.
    out.push(...next.posts);
  }
  return out;
}

export async function getPost(
  slug: string
): Promise<{ post: PortfolioPost; related: PortfolioPost[] } | null> {
  try {
    return await apiFetch<{ post: PortfolioPost; related: PortfolioPost[] }>(
      `/portfolio/blogs/${encodeURIComponent(slug)}`
    );
  } catch (err) {
    // A 404 here is an ordinary "no such post" and the caller renders notFound().
    const msg = (err as Error).message;
    if (!msg.includes("404")) {
      console.error("[portfolio-api] getPost failed:", msg);
    }
    return null;
  }
}

export async function sitemapPosts(): Promise<
  { slug: string; lastModified: string | null }[]
> {
  try {
    const data = await apiFetch<{
      posts: { slug: string; lastModified: string | null }[];
    }>("/portfolio/blogs/sitemap", { revalidate: 900 });
    return data.posts ?? [];
  } catch (err) {
    console.error("[portfolio-api] sitemapPosts failed:", (err as Error).message);
    return [];
  }
}

export type SeoConfig = {
  key: string;
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterCreator: string;
  canonicalUrl: string;
  robots: string;
  titleSuffix: string;
  defaultKeywords: string[];
};

/** Page-level SEO overrides. `null` means "not configured" — the caller falls
 *  back to its own defaults, which is the normal case for most pages. */
/**
 * Record one article view or read.
 *
 * Degrades silently. This is a counter, not content: if the agent service is
 * unreachable the reader must still get their article, and a failed beacon is
 * not worth a single line of red in their console.
 */
export async function recordBlogView(
  slug: string,
  payload: { event: "view" | "read"; dwellSeconds?: number; scrollPct?: number; referrer?: string },
  visitor: { ip: string; ua: string }
): Promise<{ ok: boolean; counted: boolean; views: number; reads: number } | null> {
  try {
    return await apiFetch(`/portfolio/blogs/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      body: payload,
      // The key is what makes the upstream trust the forwarded visitor headers.
      auth: true,
      headers: { "X-Visitor-Ip": visitor.ip, "X-Visitor-Ua": visitor.ua },
      timeoutMs: 4000,
    });
  } catch {
    return null;
  }
}

/** Current counters for one post, with no side effect. */
export async function getBlogStats(
  slug: string
): Promise<{ views: number; reads: number } | null> {
  try {
    return await apiFetch(`/portfolio/blogs/${encodeURIComponent(slug)}/stats`, {
      revalidate: 60,
      timeoutMs: 4000,
    });
  } catch {
    return null;
  }
}

export async function getSeoConfig(key: string): Promise<SeoConfig | null> {
  try {
    const data = await apiFetch<{ config: SeoConfig | null }>(
      `/portfolio/seo/${encodeURIComponent(key)}`,
      { revalidate: 900 }
    );
    return data.config ?? null;
  } catch (err) {
    console.error("[portfolio-api] getSeoConfig failed:", (err as Error).message);
    return null;
  }
}

export async function adminUpsertSeo(
  key: string,
  body: Record<string, unknown>
): Promise<{ config: SeoConfig | null }> {
  return apiFetch(`/portfolio/seo/${encodeURIComponent(key)}`, {
    method: "PUT",
    body,
    auth: true,
    revalidate: false,
  });
}

// ── Writes (surface their errors) ────────────────────────────────────────────

export type ContactResult = {
  ok: boolean;
  id?: number;
  /** Per-field messages, already written for a human to read. */
  errors?: Record<string, string>;
  /** Upstream HTTP status, so the caller can tell "fix your input" (422) from
   *  "you are being rate-limited" (429). */
  status: number;
};

/** FastAPI's own request-validation failures come back as
 *  `{detail: [{loc: ["body","email"], msg: "Field required"}, …]}`, not as the
 *  route's `{errors: {…}}`. Flatten both into one field→message map so callers
 *  have a single shape to render. */
function normaliseContactErrors(data: unknown): Record<string, string> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const body = data as Record<string, unknown>;

  if (body.errors && typeof body.errors === "object") {
    return body.errors as Record<string, string>;
  }

  if (Array.isArray(body.detail)) {
    const out: Record<string, string> = {};
    for (const item of body.detail as Record<string, unknown>[]) {
      const loc = Array.isArray(item?.loc) ? item.loc : [];
      const field = String(loc[loc.length - 1] ?? "message");
      out[field] = String(item?.msg ?? "Invalid value");
    }
    return Object.keys(out).length ? out : undefined;
  }

  return undefined;
}

export async function submitContact(payload: {
  name?: string;
  email: string;
  organisation?: string;
  phone?: string;
  subject?: string;
  message: string;
  pageUrl?: string;
  source?: string;
  company?: string; // honeypot
}): Promise<ContactResult> {
  // 422 (validation) and 429 (rate limit) are answers, not outages: both carry
  // a message the sender must see. Only a genuine failure throws from here.
  const { status, data } = await apiFetchRaw<{
    ok?: boolean;
    id?: number;
    errors?: Record<string, string>;
    detail?: unknown;
  }>("/portfolio/contact", {
    method: "POST",
    body: payload,
    revalidate: false,
    timeoutMs: 15000,
    jsonStatuses: [422, 429],
  });

  return {
    ok: status < 400 && data?.ok !== false,
    id: data?.id,
    errors: normaliseContactErrors(data),
    status,
  };
}

// ── Admin (all require INTERNAL_KEY) ─────────────────────────────────────────

export async function adminListPosts(): Promise<{
  posts: PortfolioPost[];
  total: number;
}> {
  return apiFetch("/portfolio/blogs-admin?limit=300", { auth: true, revalidate: false });
}

export async function adminCreatePost(
  body: Record<string, unknown>
): Promise<{ post: PortfolioPost }> {
  return apiFetch("/portfolio/blogs", {
    method: "POST",
    body,
    auth: true,
    revalidate: false,
  });
}

export async function adminUpdatePost(
  id: number | string,
  body: Record<string, unknown>
): Promise<{ post: PortfolioPost }> {
  return apiFetch(`/portfolio/blogs/${id}`, {
    method: "PUT",
    body,
    auth: true,
    revalidate: false,
  });
}

export async function adminDeletePost(
  id: number | string
): Promise<{ deleted: boolean }> {
  return apiFetch(`/portfolio/blogs/${id}`, {
    method: "DELETE",
    auth: true,
    revalidate: false,
  });
}

export async function adminListContacts(): Promise<{
  contacts: Record<string, unknown>[];
  total: number;
}> {
  return apiFetch("/portfolio/contacts?limit=300", { auth: true, revalidate: false });
}

/**
 * Kick off a portfolio content generation run on the agent service.
 *
 * The upstream route hands the work to a FastAPI BackgroundTask and answers
 * straight away, so this call is fast even though the run itself takes minutes.
 * All we get back is the run id — there is nothing to poll from here, and the
 * finished articles simply appear in the post list.
 */
export async function adminTriggerContentRun(params: {
  count?: number;
  publish?: boolean;
  /** false = release each article on write instead of 4–25 minutes later. */
  schedule?: boolean;
} = {}): Promise<{
  status: string;
  run_id: string;
  count: number;
  publish: boolean;
  schedule?: boolean;
}> {
  return apiFetch("/portfolio/blog/run-daily", {
    method: "POST",
    auth: true,
    revalidate: false,
    body: {
      count: params.count,
      publish: params.publish ?? true,
      schedule: params.schedule ?? true,
    },
  });
}
