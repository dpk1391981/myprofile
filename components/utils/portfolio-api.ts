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
  date: string | null;
  publishedAt: string | null;
  sourceUrl: string;
  sourceTitle: string;
  // Present only on the single-post endpoint
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  seoKeywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  noIndex?: boolean;
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
};

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    revalidate = 300,
    timeoutMs = READ_TIMEOUT_MS,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && INTERNAL_KEY) headers["X-Internal-Key"] = INTERNAL_KEY;

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

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`${method} ${path} → ${res.status} ${detail.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
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
}): Promise<{ ok: boolean; id?: number; errors?: Record<string, string> }> {
  return apiFetch("/portfolio/contact", {
    method: "POST",
    body: payload,
    revalidate: false,
    timeoutMs: 15000,
  });
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
