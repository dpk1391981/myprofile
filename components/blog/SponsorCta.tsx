import Link from "next/link";
import { IconSpeakerphone } from "@tabler/icons-react";
import { SPONSOR_PRICE_FROM } from "@/components/utils/site-data";

/**
 * "Sponsor a post" call-to-action for the blog — the same card the contact
 * page carries, so the offer reads as one thing wherever a reader meets it.
 *
 * `card`   — stacked, for the article rail (which flows under the article
 *            below 1024px, so phones see it after the author box).
 * `banner` — one row on desktop for the blog index, stacking on phones.
 *
 * A plain internal link to /sponsor, not a paid link, so no rel="sponsored".
 */
export default function SponsorCta({ variant = "card" }: { variant?: "card" | "banner" }) {
  return (
    <Link
      href="/sponsor"
      className={`bs-sponsor-card${variant === "banner" ? " bs-sponsor-card--banner" : ""}`}
    >
      <span className="bs-sponsor-card__head">
        <IconSpeakerphone size={18} />
        <span className="bs-eyebrow" style={{ color: "var(--spot-deep)" }}>Sponsored posts</span>
        <span className="bs-new-badge">New</span>
      </span>
      <span className="bs-sponsor-card__body">
        <span className="bs-sponsor-card__title">Have a dev or AI product? Sponsor a post on this blog.</span>
        <span className="bs-sponsor-card__price">Starts at only <strong>₹{SPONSOR_PRICE_FROM}</strong> per post</span>
      </span>
      <span className="bs-sponsor-card__cta">See how it works →</span>
    </Link>
  );
}
