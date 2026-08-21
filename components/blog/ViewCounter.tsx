"use client";

/**
 * Article view counter + engagement tracker.
 *
 * Renders the number and is also what produces it. Keeping both in one
 * component means the count the reader sees is the count this very visit just
 * wrote — there is no second round trip and no moment where the page shows a
 * stale figure it could have avoided.
 *
 * ── TWO DESTINATIONS, ONE DEFINITION ─────────────────────────────────────────
 * Every signal measured here goes to two places: the site's own MySQL counters
 * (via /api/blog/[slug]/view) and GA4. They use the SAME thresholds on purpose.
 * The failure mode worth designing against is not a missing number, it is two
 * dashboards that disagree about the same post and no way to tell which one is
 * lying — so `article_read` in GA4 and `read_count` in the admin table are the
 * same event, counted once, reported twice.
 *
 * ── WHY THE PAGE DOES NOT COUNT ITS OWN RENDER ───────────────────────────────
 * The article page is ISR-cached (revalidate = 300). A server-side counter
 * would therefore count cache fills rather than readers, and would count every
 * crawler that ever hit the URL. Crawlers do not run this file.
 *
 * ── WHAT IS DELIBERATELY *NOT* COUNTED ───────────────────────────────────────
 *   · the first few seconds        — kills prefetch, hover-preview and bounces
 *   · anything in a hidden tab     — background/prerendered opens are not reads
 *   · a repeat visit the same day  — sessionStorage skips the request, and the
 *                                    UNIQUE key upstream enforces it regardless
 *   · the author's own passes      — the proxy route drops any admin session,
 *                                    and Analytics.tsx sets ga-disable for GA4
 *
 * ── VIEWS VS READS ───────────────────────────────────────────────────────────
 * A view is arrival. A read is 30s of ACTIVE time (the clock stops when the tab
 * is hidden — a page left open in a background tab overnight is not a 9-hour
 * read) plus 60% scroll depth. The reader only ever sees views.
 */

import { useEffect, useRef, useState } from "react";
import { IconEye } from "@tabler/icons-react";
import { gaEvent } from "@/components/utils/gtag";

/**
 * Below this, no number is shown at all.
 *
 * "3 views" on a day-old post is worse than silence: it is the one piece of
 * social proof on the page and it is arguing against the article. Every
 * platform that shows counts hides them until they help. Tracking still runs —
 * this gates the display only.
 */
const MIN_PUBLIC_VIEWS = 50;

/** Delay before the view beacon. Long enough to exclude a bounce. */
const VIEW_DELAY_MS = 5000;

/** Read thresholds — must match VIEW_READ_MIN_* in api/portfolio_routes.py. */
const READ_MIN_SECONDS = 30;
const READ_MIN_SCROLL = 60;

/**
 * Scroll milestones reported to GA4.
 *
 * GA4's own enhanced measurement fires `scroll` exactly once, at 90%, which
 * identifies the readers who finished and says nothing about the ones who did
 * not. Quarters are what turn "most people leave" into "most people leave in
 * the second section", which is the version you can act on.
 */
const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

type Props = {
  slug: string;
  /** Server-rendered count, so the byline has its final width immediately and
   *  no layout shift happens when the live number lands. */
  initialViews?: number;
  /** GA4 dimensions. Passed down rather than re-derived so the events describe
   *  the post using the same values the rest of the site does. */
  category?: string;
  wordCount?: number;
};

export default function ViewCounter({
  slug, initialViews = 0, category = "", wordCount = 0,
}: Props) {
  const [views, setViews] = useState(initialViews);

  // Refs, not state: these change many times a second during a scroll and not
  // one of those changes should cost a re-render.
  const activeSeconds = useRef(0);
  const maxScroll = useRef(0);
  const readSent = useRef(false);
  const milestonesSent = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Headless automation announces itself here. Cheap to honour, and it keeps
    // the site's own end-to-end runs out of both destinations.
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    const viewKey = `bv:${slug}`;
    const readKey = `br:${slug}`;
    const endpoint = `/api/blog/${encodeURIComponent(slug)}/view`;

    // sessionStorage can throw outright in a locked-down browser; a failed
    // analytics read must not take the article's JS down with it.
    const store = {
      has(k: string) { try { return sessionStorage.getItem(k) === "1"; } catch { return false; } },
      set(k: string) { try { sessionStorage.setItem(k, "1"); } catch { /* ignore */ } },
    };

    /** Dimensions attached to every event from this article. */
    const dims = { slug, category: category || "(none)", word_count: wordCount || 0 };

    let cancelled = false;
    let viewTimer: ReturnType<typeof setTimeout> | null = null;
    let ticker: ReturnType<typeof setInterval> | null = null;

    async function send(payload: Record<string, unknown>) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    }

    async function sendView() {
      if (cancelled) return;
      if (store.has(viewKey)) return;   // already counted this tab, this session
      store.set(viewKey);
      const data = await send({ event: "view", referrer: document.referrer || "" });
      if (cancelled || !data) return;

      // GA4 hears about the view only when the server accepted it as a new
      // unique-per-day visitor. That is the whole reason this event is worth
      // having beside GA4's automatic page_view instead of duplicating it:
      // page_view counts openings, article_view counts people.
      if (data.counted) gaEvent("article_view", dims);

      // Only ever move the number upward from what the server rendered: the
      // upstream's answer is authoritative, but a failed beacon must not blank
      // out a real count.
      if (typeof data.views === "number" && data.views > 0) setViews(data.views);
    }

    /** Fire the view once the tab has actually been looked at for long enough. */
    function armViewTimer() {
      if (viewTimer || document.visibilityState !== "visible") return;
      viewTimer = setTimeout(sendView, VIEW_DELAY_MS);
    }

    function scrollDepth() {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) return 100;  // article shorter than the viewport: fully seen
      return Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100);
    }

    function onScroll() {
      const d = Math.min(100, scrollDepth());
      if (d <= maxScroll.current) return;
      maxScroll.current = d;

      // Deepest milestone first, and mark every shallower one as sent: a reader
      // who jumps to the end via the contents rail passed 25/50/75 in the sense
      // that matters, and firing four events on one jump would inflate the
      // shallow milestones for everyone who used the table of contents.
      for (const m of PROGRESS_MILESTONES) {
        if (d >= m && !milestonesSent.current.has(m)) {
          milestonesSent.current.add(m);
          gaEvent("read_progress", { ...dims, percent_scrolled: m });
        }
      }
    }

    /**
     * Report the read, once, to both destinations.
     *
     * `viaBeacon` is for the unload path: a reader who closes the tab at 40
     * seconds and 80% has read the piece, and without that path their session
     * records as a bare view — the exact case that makes engagement numbers
     * look worse than the reality.
     */
    function sendRead(viaBeacon: boolean) {
      if (readSent.current || store.has(readKey)) return;
      if (activeSeconds.current < READ_MIN_SECONDS) return;
      if (maxScroll.current < READ_MIN_SCROLL) return;
      readSent.current = true;
      store.set(readKey);

      const dwell = Math.round(activeSeconds.current);
      const payload = {
        event: "read",
        dwellSeconds: dwell,
        scrollPct: maxScroll.current,
        referrer: document.referrer || "",
      };

      gaEvent("article_read", {
        ...dims,
        dwell_seconds: dwell,
        percent_scrolled: maxScroll.current,
      });

      if (viaBeacon) {
        try {
          // sendBeacon survives the page unloading; fetch generally does not.
          // It returns false when the payload is refused — fall through then
          // rather than assuming it was delivered.
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          if (navigator.sendBeacon?.(endpoint, blob)) return;
        } catch { /* fall through to fetch */ }
      }
      send(payload);
    }

    // The active-time clock. It only advances while the tab is visible, which
    // is the whole difference between "time on page" and time the page spent
    // sitting in a tab nobody was looking at.
    ticker = setInterval(() => {
      if (document.visibilityState === "visible") {
        activeSeconds.current += 1;
        sendRead(false);
      }
    }, 1000);

    function onVisibility() {
      if (document.visibilityState === "visible") armViewTimer();
      else sendRead(true);   // a hidden tab may never come back
    }

    function onPageHide() { sendRead(true); }

    onScroll();
    armViewTimer();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      cancelled = true;
      if (viewTimer) clearTimeout(viewTimer);
      if (ticker) clearInterval(ticker);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [slug, category, wordCount]);

  if (views < MIN_PUBLIC_VIEWS) return null;

  return (
    <>
      <span className="sep" aria-hidden="true">·</span>
      <span className="blog-viewcount" title={`${views.toLocaleString("en-IN")} unique readers`}>
        <IconEye size={14} aria-hidden="true" />
        {views.toLocaleString("en-IN")} views
      </span>
    </>
  );
}
