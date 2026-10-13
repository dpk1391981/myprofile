"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconClock, IconArrowRight } from "@tabler/icons-react";
import { MAX_QUERY_LENGTH } from "@/components/utils/blog-search";

/**
 * Mobile search — a floating button that opens a full-screen search sheet, the
 * way a search screen behaves in a native app: keyboard up on open, results
 * as you type, Cancel (or the Android back gesture) to dismiss.
 *
 * Phones only. The button is hidden by CSS above 720px, where the inline box
 * in the header is always within reach; it also stays hidden while that inline
 * box is on screen, so there are never two search controls in view.
 *
 * Results come from /api/blog/search — the same search /blog?q= runs, over the
 * same cached list. Each distinct query is fetched once per visit (`memo`), an
 * in-flight request is aborted when the reader types on, and the response is
 * CDN-cached, so the sheet adds nothing upstream.
 */

type Result = {
  slug: string; title: string; description: string;
  date: string; readTime: string; category: string;
};
type Response = { q: string; total: number; results: Result[] };

const DEBOUNCE_MS = 180;
const RECENT_KEY = "blog-search-recent";
const MAX_RECENT = 5;

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage blocked — recents are a convenience, not state.
  }
}

/** Wraps each query word's occurrences in <mark>. */
function highlight(text: string, q: string) {
  const terms = q.split(/\s+/).filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? <mark key={i}>{part}</mark> : part
  );
}

function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function BlogSearchSheet({
  anchor, suggestions = [],
}: {
  /** The inline search form; the button shows only while it is off screen. */
  anchor: React.RefObject<HTMLElement>;
  /** Topic names offered before anything is typed. */
  suggestions?: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [anchorVisible, setAnchorVisible] = useState(true);
  const [q, setQ] = useState("");
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const memo = useRef(new Map<string, Response>());
  const inflight = useRef<AbortController | null>(null);
  const pushedState = useRef(false);

  // ── Button visibility: only once the inline box has scrolled away ──────
  useEffect(() => {
    const el = anchor.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setAnchorVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [anchor]);

  // ── Open / close ───────────────────────────────────────────────────────
  // flushSync so the input is visible before focus(): iOS raises the keyboard
  // only for a focus() made synchronously inside the tap's own handler.
  const openSheet = () => {
    flushSync(() => setOpen(true));
    inputRef.current?.focus();
    setRecent(readRecent());
    // One history entry for the sheet, so Android's back gesture closes it
    // instead of leaving the page. Next's own state is carried over: the app
    // router hard-reloads on popstate to an entry it does not recognise.
    try {
      window.history.pushState({ ...window.history.state, blogSearchSheet: true }, "");
      pushedState.current = true;
    } catch { /* history unavailable — Cancel still works */ }
  };

  const closeSheet = useCallback(() => {
    if (pushedState.current) {
      // The popstate handler below does the actual closing.
      window.history.back();
    } else {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      if (pushedState.current) {
        pushedState.current = false;
        setOpen(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Freeze the page underneath while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSheet(); };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeSheet]);

  // ── Fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    const query = q.trim();
    setError("");
    if (!query) { setData(null); setLoading(false); return; }

    const key = query.toLowerCase();
    const hit = memo.current.get(key);
    if (hit) { setData(hit); setLoading(false); return; }

    setLoading(true);
    const t = setTimeout(async () => {
      inflight.current?.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;
      try {
        const res = await fetch(`/api/blog/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || "Search is unavailable right now.");
        memo.current.set(key, body);
        setData(body);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || "Search is unavailable right now.");
      } finally {
        if (inflight.current === ctrl) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  // Leaving for a result or the full list: drop the sheet's history entry by
  // replacing it, so Back from the article lands on /blog, not on the sheet.
  const go = (href: string) => {
    const query = q.trim();
    if (query) saveRecent(query);
    pushedState.current = false;
    setOpen(false);
    router.replace(href);
  };

  const allHref = `/blog?q=${encodeURIComponent(q.trim())}`;
  const showFab = !open && !anchorVisible;

  return (
    <>
      <button type="button" className="blog-search-fab" data-show={showFab || undefined}
        aria-label="Search articles" aria-hidden={!showFab} tabIndex={showFab ? 0 : -1}
        onClick={openSheet}>
        <IconSearch size={22} />
      </button>

      <div className="blog-sheet" data-open={open || undefined} role="dialog" aria-modal="true"
        aria-label="Search articles" aria-hidden={!open}>
        <form className="blog-sheet-bar" role="search"
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(allHref); }}>
          <div className="blog-sheet-field">
            <IconSearch size={17} aria-hidden="true" />
            <input ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles" maxLength={MAX_QUERY_LENGTH}
              autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
              enterKeyHint="search" tabIndex={open ? 0 : -1} aria-label="Search articles" />
            {q && (
              <button type="button" aria-label="Clear" className="blog-sheet-clear"
                onClick={() => { setQ(""); inputRef.current?.focus(); }}>
                <IconX size={14} />
              </button>
            )}
          </div>
          <button type="button" className="blog-sheet-cancel" onClick={closeSheet} tabIndex={open ? 0 : -1}>
            Cancel
          </button>
        </form>

        <div className="blog-sheet-body">
          {!q.trim() && (
            <>
              {recent.length > 0 && (
                <section>
                  <p className="bs-eyebrow">Recent</p>
                  <ul className="blog-sheet-recent">
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" onClick={() => setQ(r)}>
                          <IconClock size={15} aria-hidden="true" /> {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {suggestions.length > 0 && (
                <section style={{ marginTop: recent.length ? 22 : 0 }}>
                  <p className="bs-eyebrow">Popular topics</p>
                  <div className="blog-topics">
                    {suggestions.map((s) => (
                      <button key={s} type="button" className="blog-topic" onClick={() => setQ(s)}>{s}</button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {q.trim() && error && <p className="bs-quiet blog-sheet-note">{error}</p>}

          {q.trim() && !error && data && (
            <>
              <p className="bs-eyebrow blog-sheet-count" aria-live="polite">
                {data.total} result{data.total === 1 ? "" : "s"}
              </p>
              {data.total === 0 && (
                <p className="bs-quiet blog-sheet-note">No articles match &ldquo;{data.q}&rdquo;. Try a broader term.</p>
              )}
              <ul className="blog-sheet-results" data-stale={loading || undefined}>
                {data.results.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/blog/${r.slug}`} onClick={(e) => { e.preventDefault(); go(`/blog/${r.slug}`); }}>
                      <span className="blog-sheet-title">{highlight(r.title, data.q)}</span>
                      <span className="blog-sheet-meta">
                        {[r.category, formatDay(r.date), r.readTime].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {data.total > data.results.length && (
                <a href={allHref} className="bs-link blog-sheet-all"
                  onClick={(e) => { e.preventDefault(); go(allHref); }}>
                  See all {data.total} results <IconArrowRight size={15} />
                </a>
              )}
            </>
          )}

          {q.trim() && !error && !data && loading && (
            <p className="bs-quiet blog-sheet-note">Searching…</p>
          )}
        </div>
      </div>
    </>
  );
}
