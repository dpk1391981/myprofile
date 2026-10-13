"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch, IconX, IconClock, IconArrowRight, IconArrowUpRight, IconHash, IconSparkles } from "@tabler/icons-react";
import { MAX_QUERY_LENGTH, highlightWords } from "@/components/utils/blog-search";

/**
 * Mobile search — a floating button that opens a full-screen search sheet, the
 * way a search screen behaves in a native app: keyboard up on open, results
 * as you type, Cancel (or the Android back gesture) to dismiss.
 *
 * Phones get a round button and a full-screen sheet; wider screens get a
 * "Search" pill and the same panel as a centred dialog. Either way the button
 * stays hidden while the inline box in the header is on screen, so there are
 * never two search controls in view. "/" and Ctrl/⌘K open it from anywhere.
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
type Response = {
  q: string;
  /** Set when typos were fixed — the query actually searched. */
  corrected: string | null;
  /** True when nothing matched every word and these are the closest. */
  partial: boolean;
  topics: { label: string; count: number }[];
  completions: string[];
  total: number;
  results: Result[];
};

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

/** Wraps each meaningful query word's occurrences in <mark>. */
function highlight(text: string, q: string) {
  const terms = highlightWords(q).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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
  /** Result under the keyboard cursor; -1 is the input itself. */
  const [active, setActive] = useState(-1);

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
  const sheetRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  const openSheet = () => {
    if (openRef.current) { inputRef.current?.focus({ preventScroll: true }); return; }
    flushSync(() => setOpen(true));
    // preventScroll matters on phones: without it the browser scrolls the page
    // to "reveal" the input, and the fixed sheet ends up half under the
    // toolbar once the keyboard is up.
    inputRef.current?.focus({ preventScroll: true });
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

  // ── Keyboard shortcuts ─────────────────────────────────────────────────
  // "/" goes to the inline box while it is on screen (no reason to cover the
  // page), otherwise opens the panel. Ctrl/⌘K always opens the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing;
      if (!cmdK && !slash) return;
      e.preventDefault();
      const inline = anchor.current?.querySelector("input");
      if (slash && anchorVisible && inline) inline.focus();
      else openSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorVisible, anchor]);

  // ── Fit the sheet to what is actually visible ──────────────────────────
  // With the keyboard up, a phone's visible area is shorter than the layout
  // viewport and may be panned. Pinning the sheet to visualViewport keeps the
  // search bar at the top of the screen and the results above the keyboard,
  // the way a native search screen sits.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = sheetRef.current;
    if (!open || !vv || !el) return;
    const fit = () => {
      el.style.setProperty("--vv-top", `${vv.offsetTop}px`);
      el.style.setProperty("--vv-h", `${vv.height}px`);
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
    };
  }, [open]);

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

  useEffect(() => { setActive(-1); }, [data]);

  // Keep the keyboard cursor's row in view.
  useEffect(() => {
    if (active < 0) return;
    sheetRef.current?.querySelector(`#blog-sheet-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

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
        <span className="blog-search-fab-label">Search</span>
        <kbd className="blog-search-fab-kbd">/</kbd>
      </button>

      {/* Desktop only (CSS): dims the page and closes the dialog on click. */}
      <div className="blog-sheet-backdrop" data-open={open || undefined} aria-hidden="true"
        onClick={closeSheet} />

      <div ref={sheetRef} className="blog-sheet" data-open={open || undefined} role="dialog" aria-modal="true"
        aria-label="Search articles" aria-hidden={!open}>
        <form className="blog-sheet-bar" role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const row = data?.results[active];
            if (row) go(`/blog/${row.slug}`);
            else if (q.trim()) go(allHref);
          }}>
          <div className="blog-sheet-field">
            <IconSearch size={17} aria-hidden="true" />
            <input ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                const n = data?.results.length ?? 0;
                if (!n) return;
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % n); }
                if (e.key === "ArrowUp")   { e.preventDefault(); setActive((i) => (i <= 0 ? n - 1 : i - 1)); }
              }}
              role="combobox" aria-expanded={Boolean(data?.results.length)} aria-controls="blog-sheet-list"
              aria-activedescendant={active >= 0 ? `blog-sheet-opt-${active}` : undefined}
              placeholder="Search articles, topics, ideas…" maxLength={MAX_QUERY_LENGTH}
              autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
              enterKeyHint="search" tabIndex={open ? 0 : -1} aria-label="Search articles" />
            {q && (
              <button type="button" aria-label="Clear" className="blog-sheet-clear"
                onClick={() => { setQ(""); inputRef.current?.focus({ preventScroll: true }); }}>
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
              {/* Finishing the word being typed — tap to fill the box. */}
              {data.completions.length > 0 && (
                <ul className="blog-sheet-suggest">
                  {data.completions.map((c) => (
                    <li key={c}>
                      <button type="button" onClick={() => { setQ(c); inputRef.current?.focus({ preventScroll: true }); }}>
                        <IconSearch size={15} aria-hidden="true" />
                        <span>{highlight(c, data.q)}</span>
                        <IconArrowUpRight size={15} aria-hidden="true" className="blog-sheet-suggest-fill" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {data.topics.length > 0 && (
                <div className="blog-topics blog-sheet-topics">
                  {data.topics.map((t) => (
                    <a key={t.label} href={`/blog?topic=${encodeURIComponent(t.label)}`} className="blog-topic"
                      onClick={(e) => { e.preventDefault(); go(`/blog?topic=${encodeURIComponent(t.label)}`); }}>
                      <IconHash size={12} aria-hidden="true" />{t.label}
                      <span className="blog-topic-count">{t.count}</span>
                    </a>
                  ))}
                </div>
              )}

              <p className="blog-sheet-summary" aria-live="polite">
                <IconSparkles size={14} aria-hidden="true" />
                <span>
                  {data.corrected ? (
                    <>Showing results for <strong>{data.corrected}</strong>. </>
                  ) : null}
                  {data.partial
                    ? <>Nothing matches every word — here are the {data.total} closest.</>
                    : data.total
                      ? <>{data.total} article{data.total === 1 ? "" : "s"} found</>
                      : <>No articles match &ldquo;{data.q}&rdquo;. Try a broader term or a topic below.</>}
                </span>
              </p>

              {data.total === 0 && suggestions.length > 0 && (
                <div className="blog-topics">
                  {suggestions.map((s) => (
                    <button key={s} type="button" className="blog-topic" onClick={() => setQ(s)}>{s}</button>
                  ))}
                </div>
              )}

              <ul id="blog-sheet-list" role="listbox" className="blog-sheet-results" data-stale={loading || undefined}>
                {data.results.map((r, i) => (
                  <li key={r.slug} id={`blog-sheet-opt-${i}`} role="option" aria-selected={i === active}>
                    <Link href={`/blog/${r.slug}`} data-active={i === active || undefined}
                      onMouseEnter={() => setActive(i)}
                      onClick={(e) => { e.preventDefault(); go(`/blog/${r.slug}`); }}>
                      {i === 0 && !data.partial && data.total > 1 && (
                        <span className="blog-sheet-best">Best match</span>
                      )}
                      <span className="blog-sheet-title">{highlight(r.title, data.corrected ?? data.q)}</span>
                      <span className="blog-sheet-desc">{highlight(r.description, data.corrected ?? data.q)}</span>
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
              <p className="blog-sheet-keys" aria-hidden="true">
                <kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close
              </p>
            </>
          )}

          {q.trim() && !error && !data && loading && (
            <ul className="blog-sheet-skeleton" aria-label="Searching">
              {[0, 1, 2].map((i) => <li key={i}><span /><span /></li>)}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
