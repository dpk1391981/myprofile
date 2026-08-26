"use client";

/**
 * The floating WhatsApp button.
 *
 * A pill, not a bare green circle. The circle is the recognisable part, so the
 * brand mark is kept exactly as people expect it — WhatsApp green, white glyph
 * — and everything around it is newsprint: paper ground, hairline rule, the
 * site serif. A saturated 56px green disc dropped onto a broadsheet page is the
 * one element on the site that would look bought rather than built.
 *
 * WHY IT IS NOT VISIBLE AT FIRST PAINT. Two reasons, and only the second is
 * about taste. It sits on top of the hero on a phone, where the first thing a
 * visitor should see is the headline, not an ask. And a fixed element that
 * paints in the first frame is a fixed element competing with LCP for the
 * reader's eye at the exact moment the page is still assembling itself.
 *
 * It reveals on the first meaningful scroll, or after 1.5s if the visitor is
 * still reading the top of the page — whichever comes first, so a short page
 * that never scrolls still gets the button.
 *
 * The message it carries is per-page; see components/utils/whatsapp.ts for why.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { gaWhatsApp } from "@/components/utils/gtag";
import {
  WHATSAPP_ARIA,
  WHATSAPP_LABEL,
  showWhatsAppCta,
  whatsAppHref,
} from "@/components/utils/whatsapp";

/** Enough scroll to mean "reading", not enough to mean a stray trackpad nudge. */
const SCROLL_TRIGGER = 120;
const FALLBACK_DELAY = 1500;

/**
 * THE NUDGE — two ring pulses, and on a phone the pill opens far enough to say
 * "Message me" before closing again.
 *
 * WHY IT IS FINITE. The default for this control everywhere on the web is a
 * halo that pulses until the tab is closed, and it is the single thing that
 * makes a floating button read as an advertisement instead of a way to reach a
 * person. A permanent animation in the corner of the eye cannot be attended to
 * and cannot be ignored, so the only thing a reader can do with it is resent
 * it. Two pulses are noticed; the third is nagging.
 *
 * WHY IT WAITS FOR STILLNESS. Firing while someone is mid-scroll interrupts the
 * thing they are actually doing, and a moving button on a moving page is not
 * even visible. NUDGE_IDLE waits for the scroll to stop — the moment a visitor
 * has finished a section and is deciding what to do next, which is the only
 * moment this button has anything to offer.
 *
 * WHY IT IS ONCE PER SESSION. Someone reading four pages should not be nudged
 * four times; by the second one it stops being an offer and starts being a
 * pester. sessionStorage rather than localStorage because a visitor coming back
 * next week is a new conversation and has genuinely forgotten the button.
 *
 * The phone case earns its half of this on information, not decoration: the
 * label is hidden below 560px, so until the pill opens once, a mobile visitor
 * has a green circle and no statement of what pressing it does.
 */
const NUDGE_IDLE = 4000;
const NUDGE_DURATION = 3200;
const NUDGE_KEY = "wa-cta-nudged";

export default function WhatsAppCta() {
  const pathname = usePathname() ?? "/";
  const [revealed, setRevealed] = useState(false);
  const [nudging, setNudging] = useState(false);

  useEffect(() => {
    if (revealed) return;

    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      cancelled = true;
      setRevealed(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (window.scrollY > SCROLL_TRIGGER) reveal();
    };

    const timer = setTimeout(reveal, FALLBACK_DELAY);
    window.addEventListener("scroll", onScroll, { passive: true });
    // A restored scroll position (back button, or an in-page anchor) means the
    // visitor is already mid-page and the delay would be a pointless wait.
    onScroll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [revealed]);

  useEffect(() => {
    if (!revealed) return;

    // Anyone who has asked the OS to stop moving things has asked for this too.
    // Guarded here and not only in CSS so the class never lands at all — the
    // mobile pill opening is a layout change, not just an animation, and a
    // reduced-motion reader should not get a button that resizes itself.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    try {
      if (sessionStorage.getItem(NUDGE_KEY) === "1") return;
    } catch {
      // Private mode and blocked storage throw on read. Losing the once-only
      // guarantee is a far smaller failure than losing the nudge, so fall
      // through and nudge anyway.
    }

    let idle: ReturnType<typeof setTimeout> | undefined;
    let off: ReturnType<typeof setTimeout> | undefined;

    const fire = () => {
      try { sessionStorage.setItem(NUDGE_KEY, "1"); } catch { /* see above */ }
      window.removeEventListener("scroll", arm);
      setNudging(true);
      off = setTimeout(() => setNudging(false), NUDGE_DURATION);
    };

    /** Restart the idle countdown — every scroll pushes the nudge back. */
    const arm = () => {
      clearTimeout(idle);
      idle = setTimeout(fire, NUDGE_IDLE);
    };

    window.addEventListener("scroll", arm, { passive: true });
    arm();

    return () => {
      clearTimeout(idle);
      clearTimeout(off);
      window.removeEventListener("scroll", arm);
    };
  }, [revealed]);

  // After the hooks, never before — the route can change under a mounted
  // component and an early return above would change the hook order.
  if (!showWhatsAppCta(pathname)) return null;

  return (
    <a
      className={`wa-cta${revealed ? " is-in" : ""}${nudging ? " is-nudging" : ""}`}
      href={whatsAppHref(pathname)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={WHATSAPP_ARIA}
      onClick={() => gaWhatsApp("floating_cta", pathname)}
    >
      <span className="wa-cta__mark" aria-hidden="true">
        <IconBrandWhatsapp size={21} stroke={2} />
      </span>
      {/* Collapsed to zero width below 560px, where the open pill would cover
          a third of the line it floats over — it opens once during the nudge to
          state what the button does, then closes. Never `display: none`: the
          width has to be animatable, and the label has to stay in the document
          for the aria-label beside it to have something to agree with. */}
      <span className="wa-cta__label">{WHATSAPP_LABEL}</span>
    </a>
  );
}
