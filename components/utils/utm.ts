/**
 * Campaign tagging for links.
 *
 * ── THE DISTINCTION THAT DECIDES EVERYTHING HERE ─────────────────────────────
 * There are two kinds of "social link" on this site and they need opposite
 * treatment, because UTM parameters are read by the analytics of the site the
 * link POINTS AT — never by the site the link sits on.
 *
 *   1. SHARE links carry a URL back to officialdeepak.in. Tagging those works:
 *      the reader lands on this site with the parameters attached, GA4 reads
 *      them, and the return visit is attributed to the network it came from.
 *      This is real, and it is what addUtm is for.
 *
 *   2. PROFILE links (the GitHub/LinkedIn/X icons in the footer, nav and hero)
 *      point AWAY, at linkedin.com and github.com. Parameters added there are
 *      delivered to LinkedIn's analytics, not ours; we can never read them, and
 *      they would be a permanent piece of noise on a URL people copy and paste.
 *      Those clicks are measured with a GA4 outbound-click event instead — see
 *      gaOutbound in gtag.ts. Do NOT tag them with this.
 *
 * ── WHY THE CANONICAL MATTERS ────────────────────────────────────────────────
 * A tagged URL is a distinct URL to a crawler. Every article and book page
 * already emits a canonical without query parameters (see generateMetadata in
 * app/blog/[slug]/page.tsx), so the tagged copies consolidate onto the clean
 * one rather than competing with it in the index. Tagging a page that lacked a
 * canonical would be an SEO problem, not just an analytics choice.
 */

/** GA4's conventional medium for a link shared by a person on a network. */
const SOCIAL_MEDIUM = "social";

export type UtmParams = {
  source: string;
  medium?: string;
  campaign?: string;
  /** Which item was shared — the slug. Lets one campaign be broken down by post. */
  content?: string;
};

/**
 * Append UTM parameters to a URL.
 *
 * Existing parameters are preserved and existing UTM keys are NOT overwritten:
 * if a URL already carries campaign tags, whoever put them there was more
 * specific than this default, and clobbering them would silently rewrite their
 * attribution.
 */
export function addUtm(url: string, { source, medium = SOCIAL_MEDIUM, campaign, content }: UtmParams): string {
  try {
    // A base is required for relative URLs. It is discarded unless the input was
    // relative, in which case the caller had a bug — share URLs must be absolute
    // or the networks cannot fetch them to build a preview card.
    const u = new URL(url, "https://officialdeepak.in");
    const set = (k: string, v?: string) => {
      if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
    };
    set("utm_source", source);
    set("utm_medium", medium);
    set("utm_campaign", campaign);
    set("utm_content", content);
    return u.toString();
  } catch {
    // Never break a share link over a tagging failure — an untagged share that
    // works beats a tagged one that 404s.
    return url;
  }
}

/**
 * The `utm_source` for each share target.
 *
 * Lowercase and stable, because GA4 treats `LinkedIn` and `linkedin` as two
 * separate sources and there is no way to merge them after the fact. These
 * values also match the source names GA4 already uses for organic social
 * referrals, so tagged and untagged traffic from one network land in the same
 * row instead of splitting the report in half.
 */
export const SHARE_SOURCES = {
  X: "twitter",
  LinkedIn: "linkedin",
  Facebook: "facebook",
  WhatsApp: "whatsapp",
  "Copy link": "copy_link",
} as const;

export type ShareMethod = keyof typeof SHARE_SOURCES;

/** Campaign name per content type — keeps blog and book shares separable. */
export function shareCampaign(contentType: "article" | "book"): string {
  return contentType === "book" ? "book_share" : "blog_share";
}
