"use client";

import { useEffect, useRef } from "react";

/**
 * Poll `fn` every `intervalMs` while `enabled` — and only while the tab is
 * actually being looked at.
 *
 * THE VISIBILITY CHECK IS THE POINT. A plain setInterval keeps firing in a
 * background tab, so someone with the admin open in several tabs multiplies the
 * request rate by the number of tabs for information nobody is reading. A book
 * run takes ~30 minutes; left alone that is hundreds of pointless round trips
 * per tab to the agent service, which is the same process serving vtechx and
 * PlanToday.
 *
 * On becoming visible it fires immediately rather than waiting out the
 * interval, so switching back to the tab shows current state at once — which is
 * the behaviour that makes the slower interval unnoticeable.
 *
 * `fn` is held in a ref so a caller does not have to memoise it to avoid
 * resubscribing on every render.
 */
export function usePolling(fn: () => void, enabled: boolean, intervalMs = 8000) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (timer) return;
      timer = setInterval(() => saved.current(), intervalMs);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        saved.current();   // catch up immediately, then resume
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs]);
}
