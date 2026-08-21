"use client";

/**
 * A link to one of the site owner's own profiles, with click tracking.
 *
 * ── WHY THIS IS NOT UTM-TAGGED ───────────────────────────────────────────────
 * UTM parameters are read by the analytics of the site a link POINTS AT. These
 * point at linkedin.com, github.com and x.com, so tags added here would be
 * delivered to those companies and never to us — while permanently polluting a
 * URL that people copy, paste and bookmark. The click is measured with a GA4
 * event fired before the reader leaves instead. Share links are the opposite
 * case and ARE tagged; see components/utils/utm.ts.
 *
 * Client-only because it needs an onClick. Footer and Hero are server
 * components, and this is deliberately the smallest possible island inside
 * them — the icon and its anchor, nothing more.
 */

import type { ReactNode } from "react";
import { gaOutbound } from "@/components/utils/gtag";

type Props = {
  href: string;
  /** "GitHub", "LinkedIn", "X" — becomes the `network` dimension. */
  network: string;
  /**
   * Where on the site this link sits: "footer", "nav", "hero", "author_bio".
   * Without it every profile click collapses into one row and the report cannot
   * say which placement earns clicks, which is the only reason to measure them.
   */
  location: string;
  children: ReactNode;
  className?: string;
  /** Defaults to "Network profile"; pass one when the surrounding text differs. */
  label?: string;
  /** Runs in addition to the tracking call — the mobile drawer closes itself
   *  this way. Tracking fires first, so a handler that throws cannot swallow
   *  the event. */
  onClick?: () => void;
};

export default function SocialIconLink({
  href, network, location, children, className, label, onClick,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      // `me` states this profile is the same person as the page's author — it
      // is the relationship the JSON-LD `sameAs` block already asserts, and the
      // existing markup carried it. Dropping it here would quietly weaken that.
      rel="noopener noreferrer me"
      aria-label={label ?? `${network} profile`}
      className={className}
      onClick={() => { gaOutbound(network, location, href); onClick?.(); }}
    >
      {children}
    </a>
  );
}
