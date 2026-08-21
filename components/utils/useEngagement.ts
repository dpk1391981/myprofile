"use client";

/**
 * View + engagement tracking, shared by every long-form surface on the site:
 * blog articles, book landing pages and book chapters.
 *
 * ── WHY THIS IS A HOOK AND NOT THREE COPIES ──────────────────────────────────
 * The measurement rules ARE the metric. If an article counts a read at 30s/60%
 * and a chapter counts one at 20s/50%, the two numbers are not comparable and
 * nobody can tell, because the difference lives in two files nobody reads side
 * by side. One definition, imported everywhere, is what makes "reads" mean the
 * same thing across the site — and what stops the unload path, the visibility
 * clock and the dedupe keys from drifting apart the way duplicated beacon code
 * always eventually does.
 *
 * ── TWO DESTINATIONS, ONE DEFINITION ─────────────────────────────────────────
 * Every signal goes to the site's own MySQL counters (via the proxy route) and
 * to GA4, from the same threshold check. The failure mode worth designing
 * against is not a missing number — it is two dashboards disagreeing about one
 * page with no way to tell which is lying.
 *
 * ── WHAT IS DELIBERATELY NOT COUNTED ─────────────────────────────────────────
 *   · the first few seconds        — kills prefetch, hover-preview and bounces
 *   · anything in a hidden tab     — background/prerendered opens are not reads
 *   · a repeat visit the same day  — sessionStorage skips the request, and the
 *                                    UNIQUE key upstream enforces it regardless
 *   · the author's own passes      — the proxy route drops any admin session,
 *                                    and Analytics.tsx sets ga-disable for GA4
 */

import { useEffect, useRef, useState } from "react";
import { gaEvent } from "@/components/utils/gtag";

/** Delay before the view beacon. Long enough to exclude a bounce. */
const VIEW_DELAY_MS = 5000;

/**
 * Read thresholds. These are the canonical values for the whole site and MUST
 * match VIEW_READ_MIN_* in the agent service's api/portfolio_routes.py and
 * api/book_routes.py — the server re-checks them, because a client-decided
 * metric is a client-editable one.
 */
export const READ_MIN_SECONDS = 30;
export const READ_MIN_SCROLL = 60;

/**
 * Scroll milestones reported to GA4.
 *
 * GA4's enhanced measurement fires `scroll` exactly once, at 90%, which
 * identifies the readers who finished and says nothing about everyone else.
 * Quarters turn "most people leave" into "most people leave in the second
 * section", which is the version you can act on.
 */
const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

export type ContentType = "article" | "book" | "chapter";

export type EngagementOptions = {
  /** Proxy route that forwards the beacon. */
  endpoint: string;
  /** Distinguishes this page in sessionStorage. One key per tracked thing —
   *  a book and its chapter three must not share a dedupe slot. */
  storageKey: string;
  /** Merged into every beacon body. Chapter pages pass their ordinal here. */
  extra?: Record<string, unknown>;
  /** GA4 dimensions. `content_type` and `item_id` are added automatically. */
  contentType: ContentType;
  itemId: string;
  dimensions?: Record<string, string | number>;
  /** Server-rendered starting count, so a byline has its final width before the
   *  beacon answers and nothing shifts when the live number lands. */
  initialViews?: number;
};

/**
 * Returns the live view count for display. Tracking runs regardless of whether
 * the caller renders the number.
 */
export function useEngagement({
  endpoint, storageKey, extra, contentType, itemId, dimensions, initialViews = 0,
}: EngagementOptions): { views: number } {
  const [views, setViews] = useState(initialViews);

  // Refs, not state: these change many times a second during a scroll and not
  // one of those changes should cost a re-render.
  const activeSeconds = useRef(0);
  const maxScroll = useRef(0);
  const readSent = useRef(false);
  const milestonesSent = useRef<Set<number>>(new Set());

  // Serialised so the effect's dependency list compares by value. Passing the
  // objects directly would re-run the whole effect — and restart the clock —
  // on every parent render, because a fresh object literal is never ===.
  const extraJson = JSON.stringify(extra ?? {});
  const dimsJson = JSON.stringify(dimensions ?? {});

  useEffect(() => {
    // Headless automation announces itself here. Cheap to honour, and it keeps
    // the site's own end-to-end runs out of both destinations.
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    const body = JSON.parse(extraJson) as Record<string, unknown>;
    const dims = {
      content_type: contentType,
      item_id: itemId,
      ...(JSON.parse(dimsJson) as Record<string, string | number>),
    };

    const viewKey = `v:${storageKey}`;
    const readKey = `r:${storageKey}`;

    // sessionStorage can throw outright in a locked-down browser; a failed
    // analytics read must not take the page's JS down with it.
    const store = {
      has(k: string) { try { return sessionStorage.getItem(k) === "1"; } catch { return false; } },
      set(k: string) { try { sessionStorage.setItem(k, "1"); } catch { /* ignore */ } },
    };

    let cancelled = false;
    let viewTimer: ReturnType<typeof setTimeout> | null = null;
    let ticker: ReturnType<typeof setInterval> | null = null;

    async function send(payload: Record<string, unknown>) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, ...payload }),
          keepalive: true,
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    }

    async function sendView() {
      if (cancelled || store.has(viewKey)) return;
      store.set(viewKey);
      const data = await send({ event: "view", referrer: document.referrer || "" });
      if (cancelled || !data) return;

      // GA4 hears about the view only when the server accepted it as a NEW
      // unique-per-day visitor. That is what makes this event worth having
      // beside GA4's automatic page_view rather than being a duplicate of it:
      // page_view counts openings, content_view counts people.
      if (data.counted) gaEvent("content_view", dims);

      // Only ever replace the server-rendered number with a real one: a failed
      // or zero response must not blank out a genuine count.
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
      if (total <= 0) return 100;  // page shorter than the viewport: fully seen
      return Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100);
    }

    function onScroll() {
      const d = Math.min(100, scrollDepth());
      if (d <= maxScroll.current) return;
      maxScroll.current = d;

      // Every milestone at or below the new depth is marked sent: a reader who
      // jumps to the end via the contents rail passed 25/50/75 in the sense
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
     * `viaBeacon` is the unload path: a reader who closes the tab at 40 seconds
     * and 80% has read the piece, and without it their session records as a
     * bare view — the exact case that makes engagement numbers look worse than
     * the reality.
     */
    function sendRead(viaBeacon: boolean) {
      if (readSent.current || store.has(readKey)) return;
      if (activeSeconds.current < READ_MIN_SECONDS) return;
      if (maxScroll.current < READ_MIN_SCROLL) return;
      readSent.current = true;
      store.set(readKey);

      const dwell = Math.round(activeSeconds.current);
      const payload = {
        ...body,
        event: "read",
        dwellSeconds: dwell,
        scrollPct: maxScroll.current,
        referrer: document.referrer || "",
      };

      gaEvent("content_read", {
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
    // is the whole difference between "time on page" and the time the page
    // spent sitting in a tab nobody was looking at.
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
  }, [endpoint, storageKey, contentType, itemId, extraJson, dimsJson]);

  return { views };
}
