/**
 * Books content API client
 * =========================
 * Books, chapters and the email list live in MySQL on the VPS that runs the
 * agent service. This site is on Vercel and cannot open a database connection
 * to that host, so everything goes over HTTP to the agent service's books
 * routes.
 *
 *   Production base: https://ai.vtechxhub.com/api/v1
 *   Routes:          /books, /books/{slug}, /books/{slug}/subscribe, /books/admin/*
 *
 * WHY THIS IS A SEPARATE FILE FROM portfolio-api.ts, given the near-identical
 * fetch wrapper: that module's `apiFetch` is not exported, and exporting it
 * would put every live blog and contact path — the ones already serving
 * traffic — behind a helper shared with a new feature. Forty duplicated lines
 * is the cheaper side of that trade. The two files intentionally read the SAME
 * env vars, so there is nothing extra to configure.
 *
 * SERVER-SIDE ONLY. `INTERNAL_KEY` must never reach the browser, so nothing
 * here may be imported from a "use client" component.
 *
 * READ PATHS DEGRADE, THEY DO NOT THROW — a books page that 500s because the
 * agent service blinked is worse than one that renders empty. Write paths
 * (subscribe, admin) do surface their errors: silently swallowing a signup
 * loses a real subscriber.
 */

const API_BASE = (
  process.env.PORTFOLIO_API_URL || "https://ai.vtechxhub.com/api/v1"
).replace(/\/+$/, "");

const INTERNAL_KEY = process.env.PORTFOLIO_API_KEY || "";

const READ_TIMEOUT_MS = 8000;

/** Generation is minutes long, but the trigger call itself only acks. This is
 *  the ceiling for the ack, not for the run. */
const WRITE_TIMEOUT_MS = 15000;

export type BookToc = {
  ordinal: number;
  heading: string;
  summary: string;
  words: number;
};

export type Book = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** What the book is about — feeds schema.org `about` and the meta fallback. */
  topic: string;
  audience: string;
  level: string;
  language: string;
  codeLanguage: string;
  outcomes: string[];
  prerequisites: string;
  coverEmoji: string;
  coverImage: string;
  chapters: number;
  wordCount: number;
  pages: number;
  access: string;
  authorName: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  updatedAt: string | null;
  /** "ai-generated" | "ai-assisted" | "none" — shown on the public page. */
  aiDisclosure: string;
  toc?: BookToc[];
  prefaceHtml?: string;
  introHtml?: string;
  conclusionHtml?: string;
  aboutAuthorHtml?: string;
  body?: { ordinal: number; heading: string; summary: string; html: string }[];
};

export type BookChapter = {
  ordinal: number;
  heading: string;
  summary: string;
  bodyHtml: string;
  concepts: string[];
  wordCount: number;
  codeBlocks: number;
  codeVerified: boolean;
  codeErrors: string[];
  editorScore: number;
  editorNotes: {
    scores?: Record<string, number>;
    fixes?: string[];
    suspect_claims?: string[];
  };
  revised: boolean;
  status: string;
  attempts: number;
  errorText: string;
  updatedAt: string | null;
};

export type AdminBook = Book & {
  tone: string;
  mustCover: string;
  avoid: string;
  targetChapters: number;
  targetWords: number;
  status: string;
  errorText: string;
  outline: {
    ordinal: number;
    heading: string;
    summary: string;
    sections: string[];
    concepts: string[];
    outcome: string;
    target_words: number;
  }[];
  kdpDescription: string;
  kdpKeywords: string[];
  kdpCategories: string[];
  isbn: string;
  pricePaise: number;
  createdAt: string | null;
  chapterDetail?: BookChapter[];
  flaggedChapters?: number;
};

type FetchOpts = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  revalidate?: number | false;
  timeoutMs?: number;
  /** Statuses whose JSON body IS the answer rather than a failure — a 409 from
   *  publish carries the flagged-chapter count the admin needs to read. */
  jsonStatuses?: number[];
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
    timeoutMs = method === "GET" ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS,
    jsonStatuses = [],
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

    // Read the body once — a stream cannot be consumed twice.
    const raw = await res.text().catch(() => "");

    if (!res.ok) {
      if (jsonStatuses.includes(res.status)) {
        try {
          return { status: res.status, data: JSON.parse(raw) as T };
        } catch {
          /* not the JSON we were promised — fall through and throw */
        }
      }
      let detail = raw.slice(0, 300);
      try {
        const parsed = JSON.parse(raw);
        detail = parsed?.detail || parsed?.error || detail;
      } catch {
        /* keep the raw text */
      }
      throw new Error(`Books API ${res.status}: ${detail}`);
    }

    return { status: res.status, data: (raw ? JSON.parse(raw) : {}) as T };
  } finally {
    clearTimeout(timer);
  }
}

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { data } = await apiFetchRaw<T>(path, opts);
  return data;
}


/* ── Public reads (degrade, never throw) ──────────────────────────────────── */

export async function listBooks(): Promise<Book[]> {
  try {
    const { books } = await apiFetch<{ books: Book[] }>("/books", { revalidate: 300 });
    return books ?? [];
  } catch (err) {
    console.error("[books] listBooks failed:", err);
    return [];
  }
}

export async function getBook(slug: string): Promise<Book | null> {
  try {
    return await apiFetch<Book>(`/books/${encodeURIComponent(slug)}`, { revalidate: 300 });
  } catch (err) {
    console.error(`[books] getBook(${slug}) failed:`, err);
    return null;
  }
}

export type ChapterPage = {
  book: Book;
  chapter: {
    ordinal: number;
    heading: string;
    summary: string;
    html: string;
    wordCount: number;
    concepts: string[];
  };
  prev: { ordinal: number; heading: string } | null;
  next: { ordinal: number; heading: string } | null;
};

/**
 * One chapter, ungated.
 *
 * These pages are the indexable surface the whole books strategy rests on — a
 * fifteen-chapter book is fifteen pages of on-topic prose rather than one
 * landing page. Degrades to null so a single missing chapter renders a 404
 * instead of taking the section down.
 */
export async function getChapter(
  slug: string,
  ordinal: number
): Promise<ChapterPage | null> {
  try {
    return await apiFetch<ChapterPage>(
      `/books/${encodeURIComponent(slug)}/chapters/${ordinal}`,
      { revalidate: 600 }
    );
  } catch (err) {
    console.error(`[books] getChapter(${slug}, ${ordinal}) failed:`, err);
    return null;
  }
}

/**
 * The whole book in one payload, for the printable copy.
 *
 * This is what the email gate protects — not reading, which is open. Throws
 * rather than degrading so the page can explain WHY access was refused
 * (unconfirmed address, unsubscribed) instead of rendering an empty book.
 */
export async function downloadBook(slug: string, token: string): Promise<Book> {
  return apiFetch<Book>(
    `/books/${encodeURIComponent(slug)}/download?token=${encodeURIComponent(token)}`,
    { revalidate: false }
  );
}

/* ── Public writes (surface their errors) ─────────────────────────────────── */

export async function subscribeToBook(
  slug: string,
  payload: { email: string; name?: string }
): Promise<{ ok: boolean; message: string; emailSent: boolean }> {
  return apiFetch(`/books/${encodeURIComponent(slug)}/subscribe`, {
    method: "POST",
    body: payload,
    // 422 carries the "that is not an email address" message the sender needs
    // to see; throwing on it turns a form hint into a server error.
    jsonStatuses: [422],
  });
}

export async function confirmSubscription(
  token: string
): Promise<{ ok: boolean; slug: string; title: string; readToken: string }> {
  return apiFetch(`/books/confirm?token=${encodeURIComponent(token)}`, {
    revalidate: false,
  });
}

export async function unsubscribeEmail(
  token: string
): Promise<{ ok: boolean; email: string }> {
  return apiFetch(`/books/unsubscribe?token=${encodeURIComponent(token)}`, {
    revalidate: false,
  });
}

/* ── Admin (X-Internal-Key) ───────────────────────────────────────────────── */

export async function adminListBooks(): Promise<{ books: AdminBook[]; total: number }> {
  return apiFetch("/books/admin/list", { auth: true });
}

export async function adminGetBook(id: number): Promise<AdminBook> {
  return apiFetch(`/books/admin/books/${id}`, { auth: true });
}

export async function adminCreateBook(brief: Record<string, unknown>): Promise<AdminBook> {
  return apiFetch("/books/admin/books", { method: "POST", body: brief, auth: true });
}

export async function adminUpdateBook(
  id: number,
  brief: Record<string, unknown>
): Promise<AdminBook> {
  return apiFetch(`/books/admin/books/${id}`, { method: "PUT", body: brief, auth: true });
}

export async function adminDeleteBook(id: number): Promise<{ ok: boolean }> {
  return apiFetch(`/books/admin/books/${id}`, { method: "DELETE", auth: true });
}

/** Stage 1. Fast (~10s) — the caller can await this and show the result. */
export async function adminBuildOutline(
  id: number
): Promise<{ ok: boolean; chapters: number }> {
  return apiFetch(`/books/admin/books/${id}/outline`, {
    method: "POST",
    auth: true,
    // The outline call itself is a model round-trip, so it needs more than the
    // default write ceiling.
    timeoutMs: 90000,
  });
}

/**
 * Stages 2-3. Returns as soon as the run is QUEUED — the run itself takes
 * minutes to tens of minutes.
 *
 * The UI must say "started", never "done". Poll adminGetBook and watch
 * `status` and `chapters`; the agent commits after every chapter, so the
 * progress shown is real rather than estimated.
 */
export async function adminGenerateBook(
  id: number,
  resume = true
): Promise<{ ok: boolean; triggered: boolean; note: string }> {
  return apiFetch(`/books/admin/books/${id}/generate?resume=${resume}`, {
    method: "POST",
    auth: true,
  });
}

export async function adminUpdateChapter(
  id: number,
  ordinal: number,
  patch: { heading?: string; summary?: string; body_html?: string; status?: string }
): Promise<BookChapter> {
  return apiFetch(`/books/admin/books/${id}/chapters/${ordinal}`, {
    method: "PUT",
    body: patch,
    auth: true,
  });
}

/**
 * Flip ready → published.
 *
 * A 409 means chapters are still flagged for review. That is returned as data,
 * not thrown, so the UI can show WHICH problem and offer the override —
 * turning it into a generic "502 upstream error" would hide the one check that
 * exists to stop a weak chapter going out under a real name.
 */
export async function adminPublishBook(
  id: number,
  publish = true,
  allowFlagged = false
): Promise<AdminBook & { detail?: string }> {
  const { status, data } = await apiFetchRaw<AdminBook & { detail?: string }>(
    `/books/admin/books/${id}/publish?publish=${publish}&allow_flagged=${allowFlagged}`,
    { method: "POST", auth: true, jsonStatuses: [409, 422] }
  );
  // 409 — chapters flagged for review. A judgement call, so it is overridable.
  if (status === 409) {
    const err: any = new Error(data.detail || "Chapters are flagged for review");
    err.needsAcknowledgement = true;
    throw err;
  }
  // 422 — the book is under the page floor. NOT overridable, and the message
  // carries the real page count, so it must not be flattened into a 502.
  if (status === 422) {
    const err: any = new Error(data.detail || "This book is too short to publish");
    err.tooShort = true;
    throw err;
  }
  return data;
}

export type Subscriber = {
  id: number;
  email: string;
  name: string;
  source: string;
  bookTitle: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string | null;
};

export async function adminListSubscribers(
  confirmedOnly = false
): Promise<{ subscribers: Subscriber[]; total: number }> {
  return apiFetch(`/books/admin/subscribers?confirmed_only=${confirmedOnly}`, {
    auth: true,
  });
}

export async function booksHealth(): Promise<Record<string, unknown>> {
  return apiFetch("/books/health", { auth: true });
}
