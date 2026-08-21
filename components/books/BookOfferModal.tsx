"use client";

/**
 * The printable-copy offer, as a modal.
 *
 * ═══ WHAT IT ASKS FOR, AND WHY THAT IS NOT A PAYWALL ═══
 * The book is free and stays free: every chapter is a public page and this
 * modal never covers one on arrival. What it offers is the thing the site
 * cannot give away silently — the whole book as one printable file — in
 * exchange for a confirmed email address. The reader who closes it loses
 * nothing, which is the only version of this pattern that does not cost more
 * trust than it earns.
 *
 * ═══ WHEN IT OPENS (and why not immediately) ═══
 * NOT on load. Two reasons, and the second is expensive:
 *
 *   1. A popup shown before the reader has read a sentence is asking for
 *      payment before delivering anything. Every measured version of this
 *      converts worse than the same offer shown after the reader is invested.
 *   2. Google's intrusive-interstitial guideline specifically targets a dialog
 *      that covers the content immediately after a searcher arrives from a
 *      search result on mobile. These chapter pages are the site's ranking
 *      surface; a demotion there would cost far more than a mailing list is
 *      worth.
 *
 * So the first open is on ENGAGEMENT — whichever comes first of a quarter of
 * the page scrolled, DWELL_MS of dwell, or (on a mouse) exit intent. A reader
 * who closes it gets it once more after RETRY_MS, and then not again for
 * SNOOZE_DAYS. Someone who has already confirmed an address never sees it at
 * all.
 *
 * ═══ ACCESSIBILITY ═══
 * role="dialog" + aria-modal, focus moved into the panel on open and returned
 * to where it was on close, Escape closes, the backdrop closes, focus is
 * trapped inside the panel while it is open, and the page behind it cannot
 * scroll. A modal that traps a keyboard user is worse than no modal.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconAlertTriangle, IconCheck, IconLoader2, IconMailCheck, IconX,
} from "@tabler/icons-react";
import { gaBookOffer } from "@/components/utils/gtag";

/* ── Timing ────────────────────────────────────────────────────────────────
   Every number the pacing depends on is here, named, because these are the
   dials that get tuned against the GA4 funnel later. */

/** Dwell before the first open, if nothing else triggers it sooner. */
const DWELL_MS = 45_000;

/** Scroll depth that counts as "reading", as a fraction of scrollable height. */
const SCROLL_TRIGGER = 0.25;

/** Second attempt, after the reader closed the first one. */
const RETRY_MS = 120_000;

/** Openings per page view. Two: the ask, and one reminder. A third is nagging. */
const MAX_SHOWS = 2;

/** After the last dismissal, stay gone this long — on every book page. */
const SNOOZE_DAYS = 7;

/** Where the snooze lives. Shared across books on purpose: someone who closed
 *  this twice on one book does not want it on the next one either. */
const SNOOZE_KEY = "books.offer.snoozeUntil";

/** Written by the confirmation page (see EmailGate). Its presence means this
 *  person is already on the list, so the offer is not shown at all. */
const TOKEN_KEY = "books.readToken";

/** How a button anywhere on the page opens this dialog on purpose.
 *
 *  A DOM event rather than context or a lifted state hook: the openers are
 *  server-rendered rails and asides that have no reason to become client
 *  components, and a page may carry several of them. One listener, any number
 *  of senders, no provider to thread through the tree. */
const OPEN_EVENT = "books:open-offer";

function snoozedUntil(): number {
  try {
    return Number(window.localStorage.getItem(SNOOZE_KEY) || 0);
  } catch {
    // Storage blocked (private window, cookie settings). Fail CLOSED: without
    // storage the snooze cannot be honoured, and a popup that cannot remember
    // being dismissed would reappear on every page of the book.
    return Number.POSITIVE_INFINITY;
  }
}

function snooze(days: number) {
  try {
    window.localStorage.setItem(
      SNOOZE_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000)
    );
  } catch {
    /* nothing to do — the in-memory guard still holds for this page view */
  }
}

function alreadySubscribed(): boolean {
  try {
    return Boolean(window.localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

export default function BookOfferModal({
  slug,
  bookTitle,
  pages,
  chapters,
}: {
  slug: string;
  bookTitle: string;
  pages: number;
  chapters: number;
}) {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const shows = useRef(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const show = useCallback((why: string) => {
    if (shows.current >= MAX_SHOWS) return;
    shows.current += 1;
    setTrigger(why);
    setOpen(true);
    gaBookOffer("shown", slug, why);
  }, [slug]);

  /* Asked for, rather than offered. A reader who clicks "get the printable
     copy" is opting in, so this path ignores the show budget and the snooze
     entirely — refusing to open a dialog someone just requested because they
     closed an unrelated one last week would be a bug, not restraint. */
  useEffect(() => {
    const onRequest = () => {
      setTrigger("requested");
      setOpen(true);
      gaBookOffer("shown", slug, "requested");
    };
    window.addEventListener(OPEN_EVENT, onRequest);
    return () => window.removeEventListener(OPEN_EVENT, onRequest);
  }, [slug]);

  const close = useCallback(() => {
    setOpen(false);
    // A reader who subscribed is not dismissing an offer, so only a real
    // dismissal counts against the budget or starts the snooze.
    if (state !== "sent") {
      gaBookOffer("dismissed", slug, trigger);
      if (shows.current >= MAX_SHOWS) snooze(SNOOZE_DAYS);
    }
  }, [slug, trigger, state]);

  /* ── Openers ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    // Everything below reads localStorage and the viewport, so it must run
    // after mount — never during render, where the server has neither.
    if (alreadySubscribed() || Date.now() < snoozedUntil()) return;

    let done = false;
    const fire = (why: string) => {
      if (done) return;
      done = true;
      cleanup();
      show(why);
    };

    const dwell = window.setTimeout(() => fire("dwell"), DWELL_MS);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_TRIGGER) fire("scroll");
    };

    /* Exit intent, pointer devices only. The cursor leaving through the top of
       the window is the one moment a reader has finished with the page and has
       not yet left it — the highest-converting trigger there is, and the least
       intrusive, because nothing is interrupted. matchMedia rather than a
       touch check: a hover-capable device is exactly the set where this gesture
       means anything. */
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) fire("exit_intent");
    };
    const fine = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

    window.addEventListener("scroll", onScroll, { passive: true });
    if (fine) document.addEventListener("mouseout", onLeave);

    function cleanup() {
      window.clearTimeout(dwell);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    }
    return cleanup;
  }, [show]);

  /* The second attempt. Starts when the first one is closed unsubscribed, and
     is cancelled if the reader signs up in the meantime — asking twice for
     something already given is the fastest way to look like a machine. */
  useEffect(() => {
    if (open || state === "sent") return;
    if (shows.current === 0 || shows.current >= MAX_SHOWS) return;
    const t = window.setTimeout(() => show("retry"), RETRY_MS);
    return () => window.clearTimeout(t);
  }, [open, state, show]);

  /* ── Modal behaviour: focus, Escape, scroll lock, focus trap ─────────── */
  useEffect(() => {
    if (!open) return;

    returnFocusTo.current = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Focus the panel, not the input: on a phone, focusing a text field opens
    // the keyboard over the offer the reader has not read yet.
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      window.scrollTo({ top: scrollY });
      returnFocusTo.current?.focus?.();
    };
  }, [open, close]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const res = await fetch(`/api/books/${encodeURIComponent(slug)}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || data?.detail || "Something went wrong.");
      }
      setState("sent");
      setMessage(data.message || "Check your inbox and confirm to get the book.");
      gaBookOffer("submitted", slug, trigger);
      // Do not ask this browser again for a long while. The address is not
      // confirmed yet — that happens from the email — but the ask has been
      // answered, and re-asking is the thing that makes people unsubscribe.
      snooze(SNOOZE_DAYS * 4);
    } catch (err: any) {
      setState("error");
      setMessage(err?.message || "Could not sign you up. Try again in a moment.");
    }
  }

  if (!open) return null;

  return (
    <div className="bkm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div
        ref={panelRef}
        className="bkm-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bkm-title"
        aria-describedby="bkm-desc"
        tabIndex={-1}
      >
        <button type="button" className="bkm-close" onClick={close} aria-label="Close">
          <IconX size={18} />
        </button>

        {state === "sent" ? (
          <div style={{ textAlign: "center", padding: "14px 0 6px" }}>
            <IconMailCheck size={34} style={{ color: "var(--spot)" }} />
            <h2 id="bkm-title" className="bkm-title" style={{ marginTop: 12 }}>Check your inbox</h2>
            <p id="bkm-desc" className="bkm-sub">{message}</p>
            <p className="bkm-fine" style={{ marginTop: 16 }}>
              Nothing arrives until you click the link in that email. If it is not there in a
              few minutes, look in spam — and mark it “not spam” so the book itself lands
              properly.
            </p>
            <button type="button" onClick={close} className="bs-btn bs-btn--outline" style={{ marginTop: 20 }}>
              Back to reading
            </button>
          </div>
        ) : (
          <>
            <p className="bs-kicker">Free book · Printable copy</p>
            <h2 id="bkm-title" className="bkm-title">
              Keep a copy of all {pages} pages
            </h2>
            <p id="bkm-desc" className="bkm-sub">
              {bookTitle} stays free to read here — every one of the {chapters} chapters.
              This is the whole book as a single printable file, yours to keep, read
              offline and mark up.
            </p>

            <ul className="bkm-list">
              {[
                `All ${chapters} chapters in one file — print it or read it offline`,
                "No payment, no account — one confirmed email address",
                "One-click unsubscribe, and the address is never sold or shared",
              ].map((line) => (
                <li key={line}>
                  <IconCheck size={15} aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={submit} className="bkm-form">
              <label htmlFor="bkm-name" className="sr-only">Your name</label>
              <input
                id="bkm-name" type="text" value={name} autoComplete="name"
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Your name (optional)" className="bkm-input"
              />
              <label htmlFor="bkm-email" className="sr-only">Email address</label>
              <input
                id="bkm-email" type="email" required value={email} autoComplete="email"
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="you@example.com" className="bkm-input"
              />

              {state === "error" && (
                <p className="bs-small" style={{ display: "flex", gap: 8, color: "var(--mag)" }}>
                  <IconAlertTriangle size={16} className="shrink-0" />
                  {message}
                </p>
              )}

              <button type="submit" disabled={state === "sending"}
                      className="bs-btn bs-btn--solid" style={{ justifyContent: "center" }}>
                {state === "sending" && <IconLoader2 size={16} className="animate-spin" />}
                {state === "sending" ? "Sending…" : `Send me the ${pages}-page copy`}
              </button>
            </form>

            {/* The escape hatch, stated in words rather than left to the ✕.
                A reader who cannot see an obvious way out reads the dialog as
                a paywall, which is the exact impression this page cannot
                afford to give. */}
            <button type="button" onClick={close} className="bkm-decline">
              No thanks — I’ll keep reading online
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * A button that opens the offer dialog on demand.
 *
 * Its own tiny client component so the rails and asides that carry it can stay
 * server-rendered. Renders nothing but a button — if the modal is not mounted
 * on the page, the click is simply a no-op rather than an error.
 */
export function BookOfferButton({
  children,
  className = "bs-btn bs-btn--solid bs-btn--sm",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      {children}
    </button>
  );
}
