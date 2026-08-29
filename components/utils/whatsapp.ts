/**
 * The floating WhatsApp CTA — number, routing rules, and the prefilled message.
 *
 * ── WHY THE MESSAGE IS PER-PAGE ──────────────────────────────────────────────
 * A generic prefill ("Hi, I got you from your profile") costs the reader the
 * one thing a WhatsApp CTA is supposed to save them: having to explain who they
 * are before anything useful can happen. It also arrives with no context on the
 * receiving end, so the first reply is always "sure — what is this about?".
 *
 * The message is written in the VISITOR'S voice, says which page they were on,
 * and ends on a question they can send without editing. That last part matters
 * more than it looks: a prefill people have to rewrite is a prefill people
 * abandon. Two sentences is the ceiling — anything longer reads as a script
 * someone else wrote, which is exactly what it is.
 *
 * ── WHY THE ROUTE TABLE AND NOT ONE STRING ───────────────────────────────────
 * The pages differ in what the visitor is likely to want. Somebody on
 * /experience is probably hiring; somebody on /projects wants something built;
 * somebody on a "React developer in India" landing page arrived from a search
 * for that exact phrase. Naming it back to them is the whole value of the
 * prefill. Anything not in the table gets DEFAULT_MESSAGE, which assumes
 * nothing.
 */

import { PERSONAL_INFO } from "./portfolio-data";
import { LANDING_PAGES } from "./site-data";

/**
 * wa.me wants digits only, country code included and no "+". PERSONAL_INFO
 * stores the human-readable "+91-8285257636", so the number lives in exactly
 * one place and this strips it down rather than restating it.
 *
 * NEXT_PUBLIC_MOBILE_NUMBER is deliberately NOT used: it holds the local
 * 10-digit form with no country code, and a wa.me link without one silently
 * resolves to the wrong country instead of failing.
 */
export const WHATSAPP_NUMBER = PERSONAL_INFO.phone.replace(/\D/g, "");

/**
 * Icon says WHICH channel, label says WHAT happens — and neither repeats the
 * other. "WhatsApp me" spends the only two words of copy this control gets on
 * restating the green disc beside it; the action is the part the disc cannot
 * carry. It also matches the site's other buttons, which all name an action —
 * "Download resume", "Start a conversation" — rather than a medium.
 *
 * The label exists at all because a bare green circle in the bottom-right is
 * the exact shape of a live-chat widget, and a portfolio's WhatsApp is the
 * opposite of a support desk: it rings a real phone. One word of text is what
 * separates those two readings. It is dropped below 560px, where the pill would
 * cover a third of the line it floats over — see the aria-label below, which is
 * what carries the control there and for anyone who cannot see the icon.
 */
export const WHATSAPP_LABEL = "Message me";
export const WHATSAPP_ARIA = `Message ${PERSONAL_INFO.firstName} on WhatsApp`;

const SITE = "officialdeepak.in";

const DEFAULT_MESSAGE =
  `Hi ${PERSONAL_INFO.firstName} — I came across your portfolio on ${SITE} and I'd like to talk about some work. ` +
  `Do you have a few minutes this week?`;

/** Exact pathname → message. Trailing slashes are normalised before lookup. */
const MESSAGES: Record<string, string> = {
  "/":
    `Hi ${PERSONAL_INFO.firstName} — I found you through ${SITE} and I have a project in mind. ` +
    `Are you free for a quick call this week?`,

  "/about":
    `Hi ${PERSONAL_INFO.firstName} — I've just been reading your story on ${SITE}. ` +
    `I'd like to talk about working together — do you have a few minutes this week?`,

  "/experience":
    `Hi ${PERSONAL_INFO.firstName} — I went through your experience on ${SITE} and I have a role I think fits. ` +
    `Would you be open to a short chat?`,

  "/projects":
    `Hi ${PERSONAL_INFO.firstName} — I was looking through the projects on ${SITE} and I'd like something similar built. ` +
    `Can we talk this week?`,

  "/skills":
    `Hi ${PERSONAL_INFO.firstName} — your stack on ${SITE} lines up almost exactly with what we need. ` +
    `Do you have time for a short call?`,

  "/reviews":
    `Hi ${PERSONAL_INFO.firstName} — I read the recommendations on ${SITE} and I'd like to discuss a project with you. ` +
    `When are you free for a quick call?`,

  // The contact page and the post-submit page both leave the sentence open on
  // purpose. The visitor is already in "I am about to explain myself" mode, so
  // the useful prefill is the one that hands them the cursor.
  "/contact":
    `Hi ${PERSONAL_INFO.firstName} — I'm on your contact page and thought WhatsApp would be quicker than the form. ` +
    `Here's what I'm working on:`,

  "/success":
    `Hi ${PERSONAL_INFO.firstName} — I just sent a message through ${SITE} and wanted to follow it up here too. ` +
    `The short version:`,

  "/blog":
    `Hi ${PERSONAL_INFO.firstName} — I've been reading your writing on ${SITE} and I'd like to talk about some work. ` +
    `Do you have a few minutes this week?`,

  "/books":
    `Hi ${PERSONAL_INFO.firstName} — I was going through your books on ${SITE} and I have a question. ` +
    `Are you free for a short chat?`,
};

/**
 * Prefix → message, for the two sections whose pages are generated.
 *
 * These cannot go in MESSAGES: there is one entry per article and one per
 * chapter, and both are written by the agent. The prefill therefore says WHAT
 * the visitor was reading — an article, a chapter of a book — without quoting a
 * title it would have to derive from a slug. "javascript-core-engineer"
 * un-slugified is "Javascript Core Engineer", and a prefill that gets the
 * reader's own book title wrong is worse than one that does not attempt it.
 *
 * Longest prefix wins, so /books/x/3 takes the chapter line rather than the
 * section line above it.
 */
const PREFIX_MESSAGES: [RegExp, string][] = [
  [
    /^\/blog\/[^/]+$/,
    `Hi ${PERSONAL_INFO.firstName} — I've just read one of your articles on ${SITE} and had a question about it. ` +
      `Is this a good place to ask?`,
  ],
  [
    /^\/books\/[^/]+\/\d+$/,
    `Hi ${PERSONAL_INFO.firstName} — I'm partway through a chapter of one of your books on ${SITE} and had a question about it. ` +
      `Can I ask it here?`,
  ],
  [
    /^\/books\/[^/]+$/,
    `Hi ${PERSONAL_INFO.firstName} — I'm looking at one of your books on ${SITE} and I'd like to talk about some work. ` +
      `Do you have a few minutes this week?`,
  ],
];

/**
 * Routes the CTA stays off.
 *
 * Blog and books USED to be listed here, on the argument that a reading surface
 * should not carry a floating ask. They are back on: those two sections are
 * where the site's traffic actually lands, and a reader who has just been given
 * 30,000 words for free is the most likely person on the site to want a
 * conversation — which is precisely the reader the old rule sent away with no
 * way to start one. The reading-tax objection is answered by the button's own
 * behaviour rather than by hiding it: it stays out of the first paint, reveals
 * on the first real scroll, and nudges once per session, never again.
 *
 * What stays off is the transactional pair. Someone confirming an address or
 * unsubscribing is mid-flow on a page with exactly one thing to do, and a
 * second, louder call to action there is an interruption, not an offer.
 *
 * /admin and the whole-book reader are not listed because they never mount it:
 * the CTA is rendered inside the public branch of SiteChrome, which drops both.
 * The reader is the one reading surface that genuinely has no room for this —
 * it is a book, not a page of the site.
 */
const OFF_ROUTES = [/^\/books\/(confirm|unsubscribe)$/];

/** Strip the trailing slash so "/about" and "/about/" resolve to one entry. */
const normalise = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

export function showWhatsAppCta(pathname: string): boolean {
  const path = normalise(pathname);
  return !OFF_ROUTES.some((re) => re.test(path));
}

export function whatsAppMessage(pathname: string): string {
  const path = normalise(pathname);

  const exact = MESSAGES[path];
  if (exact) return exact;

  const prefixed = PREFIX_MESSAGES.find(([re]) => re.test(path));
  if (prefixed) return prefixed[1];

  // Keyword landing pages. The label is read off the page's own h1 rather than
  // restated here, so a headline edit cannot leave the prefill quoting a page
  // title that no longer exists. The h1 is "<phrase> — Deepak Kumar"; only the
  // phrase is the thing the visitor searched for.
  const landing = LANDING_PAGES.find((p) => path === `/${p.slug}`);
  if (landing) {
    const phrase = landing.h1.split("—")[0].trim();
    return (
      `Hi ${PERSONAL_INFO.firstName} — I landed on your "${phrase}" page on ${SITE}, ` +
      `and that's exactly what I'm looking for. Can we talk this week?`
    );
  }

  return DEFAULT_MESSAGE;
}

export function whatsAppHref(pathname: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsAppMessage(pathname))}`;
}
