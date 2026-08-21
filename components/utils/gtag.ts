/**
 * GA4 event helper.
 *
 * The gtag snippet itself lives in components/Analytics.tsx; this is the only
 * thing that should ever call it. One choke point matters here more than usual
 * because GA4 events are effectively write-once: a misspelled name or a param
 * that was a string on one page and a number on another cannot be corrected
 * retroactively, and the bad data stays in the property forever.
 *
 * ── WHY THESE EVENTS AND NOT MORE ────────────────────────────────────────────
 * GA4 already measures page_view, outbound clicks, file downloads and a single
 * 90% scroll automatically. Re-sending any of those as a custom event does not
 * add a metric, it adds a second, slightly-disagreeing copy of one. Everything
 * below is something enhanced measurement genuinely does not know:
 *
 *   share          — a recommended GA4 event, not an automatic one. The URL
 *                    it shares is UTM-tagged too, so the RETURN visit is
 *                    attributed as well as the outgoing click.
 *   outbound_social— clicks on the profile icons. Not tagged with UTM,
 *                    because those links point away from this site; see utm.ts.
 *   read_progress  — enhanced measurement fires scroll ONCE, at 90%, which
 *                    tells you who finished and nothing about where everyone
 *                    else stopped. Quarter milestones show the drop-off.
 *   article_read   — 30s active + 60% depth. The same definition the MySQL
 *                    counter uses, deliberately, so GA4 and the admin table
 *                    cannot tell you two different stories about one post.
 *   article_view   — fires only when the server accepted the view as a NEW
 *                    unique-per-day visitor. That is what makes it worth having
 *                    next to page_view rather than a duplicate of it: page_view
 *                    counts openings, this counts people.
 *
 * ── BEFORE THESE SHOW UP IN REPORTS ──────────────────────────────────────────
 * Custom parameters are collected immediately but are NOT queryable until they
 * are registered as custom dimensions/metrics in GA4 (Admin → Custom
 * definitions). Until then they are visible only in DebugView and the realtime
 * event card. That is a GA4 property setting, not something code can do.
 */

/** GA4 hard limits. Exceeding them makes GA silently drop the event. */
const MAX_EVENT_NAME = 40;
const MAX_PARAM_VALUE = 100;

type Primitive = string | number | boolean;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Send one GA4 event.
 *
 * Never throws and never warns in production. Analytics is the lowest-priority
 * thing on the page: an ad blocker, a consent tool, or an admin session with
 * `ga-disable-<ID>` set all legitimately mean "no gtag here", and none of them
 * is an error the reader should see or the app should react to.
 */
export function gaEvent(name: string, params: Record<string, Primitive | undefined> = {}): void {
  if (typeof window === "undefined") return;

  const eventName = name.slice(0, MAX_EVENT_NAME);

  // Drop undefined rather than sending it: GA4 stores the literal string
  // "undefined", which then shows up as a real value in every report.
  const payload: Record<string, Primitive> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    payload[k] = typeof v === "string" ? v.slice(0, MAX_PARAM_VALUE) : v;
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      return;
    }
    // gtag.js has not finished loading. Pushing the same shape onto dataLayer
    // queues the event; the library replays the queue on load, so an event
    // fired in the first moments of the page is recorded rather than lost.
    (window.dataLayer = window.dataLayer || []).push(["event", eventName, payload]);
  } catch {
    // Analytics must never break the page that reports to it.
  }
}

/**
 * GA4's recommended `share` event.
 *
 * Using the recommended name and its documented parameters — rather than a
 * home-grown `share_click` — is what lets GA4 populate its own reporting for
 * it instead of leaving it as an unattached custom event.
 */
export function gaShare(method: string, contentType: "article" | "book", itemId: string): void {
  gaEvent("share", { method, content_type: contentType, item_id: itemId });
}

/**
 * A click on a link that leaves the site.
 *
 * GA4's enhanced measurement already collects `click` for outbound links, so
 * this is deliberately NOT named `click` — a second event under that name would
 * double-count every outbound click on the site.
 *
 * It exists because UTM parameters cannot do this job. Tagging a link to
 * linkedin.com sends the parameters to LinkedIn's analytics, never to ours; the
 * only way to know a footer icon was clicked is to record it here, before the
 * reader leaves. See components/utils/utm.ts for the full argument.
 *
 * `location` is where on the site the link was (footer, nav, hero, author_bio)
 * — without it every profile click on every page collapses into one row and the
 * report cannot answer which placement actually earns clicks, which is the only
 * reason to measure them at all.
 */
export function gaOutbound(network: string, location: string, url: string): void {
  gaEvent("outbound_social", { network, link_location: location, link_url: url });
}
