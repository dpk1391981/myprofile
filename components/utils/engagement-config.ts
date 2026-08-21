/**
 * Measurement constants, in a plain module on purpose.
 *
 * NOT marked "use client". Next.js turns every export of a `"use client"` file
 * into a client reference proxy, so a server component that imported these from
 * the tracker would read a proxy rather than the number — silently, with no
 * type error. The blog index is a server component and applies the same display
 * floor as the article page, so these have to be importable from both sides.
 *
 * The read thresholds must ALSO match VIEW_READ_MIN_* in the agent service's
 * api/analytics_common.py. The client measures — only it can — but the server
 * re-checks, because a client-decided metric is a client-editable one.
 */

/** Active seconds and scroll depth that together constitute "a read". */
export const READ_MIN_SECONDS = 30;
export const READ_MIN_SCROLL = 60;

/** Delay before the view beacon. Long enough to exclude a bounce. */
export const VIEW_DELAY_MS = 5000;

/**
 * Scroll milestones reported to GA4.
 *
 * GA4's enhanced measurement fires `scroll` exactly once, at 90%, which
 * identifies the readers who finished and says nothing about everyone else.
 * Quarters turn "most people leave" into "most people leave in the second
 * section", which is the version you can act on.
 */
export const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

/**
 * Below this, no count is displayed anywhere — article byline, index cards,
 * book header.
 *
 * "3 views" on a day-old post is worse than silence: it is the only piece of
 * social proof on the page and it is arguing against the thing it sits on.
 * Every platform that shows counts hides them until they help.
 *
 * Tracking is unaffected. This gates DISPLAY only, so the number is already
 * accumulating long before it first appears — a post does not start counting
 * on the day it crosses the floor.
 */
export const MIN_PUBLIC_VIEWS = 50;

/**
 * Query-string escape hatch for checking how the count LOOKS.
 *
 *   /blog/some-post?view_show=true
 *
 * Reveals counts that are below MIN_PUBLIC_VIEWS, on that page load only, for
 * whoever typed it. Nothing else changes: the floor, the tracking and what a
 * normal visitor sees are all untouched.
 *
 * It works by CSS visibility rather than by re-rendering. Reading a query
 * parameter during the server render would mean calling searchParams, and that
 * opts the article and book pages out of static rendering — trading the ISR
 * cache on the site's most-visited pages for a debug flag would be a very bad
 * exchange. So the markup is always emitted, hidden by a stylesheet rule, and a
 * tiny client component lifts the rule when the parameter is present.
 *
 * THE TRADE: sub-floor counts are present in the HTML source even when not
 * displayed. For a public view count on a personal blog that is not worth
 * another mechanism — but it is the reason this is a visibility gate and not
 * something you would build for data that actually needed hiding.
 */
export const VIEW_PREVIEW_PARAM = "view_show";

/** Truthy spellings accepted for the parameter. */
export function isViewPreview(search: string): boolean {
  try {
    const v = new URLSearchParams(search).get(VIEW_PREVIEW_PARAM);
    return v !== null && v !== "0" && v.toLowerCase() !== "false";
  } catch {
    return false;
  }
}

/**
 * The class that hides a count below the floor.
 *
 * Applied to whichever element must disappear — which is not always the count
 * itself. In the book page's facts strip the count sits inside a flex item, and
 * hiding only the inner span would leave the item collecting the row gap either
 * side of it; `display: none` on the wrapper removes it from the flex layout
 * entirely, gaps included.
 */
export function belowFloorClass(views: number): string {
  return views < MIN_PUBLIC_VIEWS ? "vc-sub" : "";
}
