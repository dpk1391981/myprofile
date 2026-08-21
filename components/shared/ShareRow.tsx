"use client";

/**
 * Share row — X, LinkedIn, Facebook, WhatsApp, copy link.
 *
 * A client component because "copy link" is the one action here that cannot be
 * an <a href>: it needs the clipboard API and a confirmation state, and a link
 * that silently does nothing when clicked is worse than no link at all. The
 * network shares stay real anchors inside it so they still work with JS off and
 * so middle-click / open-in-new-tab behave the way readers expect.
 *
 * Used by both the article page and the book page — the two share rows had
 * drifted apart once already, and one component is what stops that recurring.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconBrandX, IconBrandLinkedin, IconBrandFacebook, IconBrandWhatsapp,
  IconLink, IconCheck,
} from "@tabler/icons-react";
import { gaShare } from "@/components/utils/gtag";
import { addUtm, SHARE_SOURCES, shareCampaign, type ShareMethod as ShareMethodKey } from "@/components/utils/utm";

type Props = {
  /** Absolute URL. Relative would break every one of these — the networks
   *  fetch the URL server-side to build their preview card. */
  url: string;
  title: string;
  /** Optional label rendered before the icons, e.g. "Share". */
  label?: string;
  className?: string;
  /** GA4 `share` event parameters. Defaults suit an article; the book page
   *  passes "book" so the two surfaces stay separable in reporting. */
  contentType?: "article" | "book";
  /** Slug — the `item_id` on the GA4 event. Without it every share on the site
   *  collapses into one undifferentiated row and the report answers nothing. */
  itemId?: string;
};

export default function ShareRow({
  url, title, label, className = "",
  contentType = "article", itemId,
}: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(async () => {
    try {
      // navigator.clipboard is undefined on insecure origins and in a few
      // in-app browsers; the textarea path is the fallback that still works.
      // The copied link is tagged as well. People paste these into Slack,
      // WhatsApp and email, and without a source that traffic lands in GA4 as
      // "direct" — which is where attribution goes to die.
      const copyUrl = addUtm(url, {
        source: SHARE_SOURCES["Copy link"],
        campaign: shareCampaign(contentType),
        content: itemId,
      });
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = copyUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      // Reported here and not in the click handler: the event has to mean "a
      // link reached the clipboard", and the paths above can both throw.
      gaShare("Copy link", contentType, itemId || url);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard denied by permissions policy — leave the button unchanged
      // rather than claiming a copy that did not happen.
    }
  }, [url, contentType, itemId]);

  const t = encodeURIComponent(title);

  /**
   * The URL as tagged for one network.
   *
   * Each target gets its own utm_source, so a visit arriving later is
   * attributed to the network the link was actually posted on — not merely
   * marked "shared from somewhere". `utm_content` carries the slug, which is
   * what lets one campaign be broken down per article.
   */
  const tagged = (method: ShareMethodKey) =>
    addUtm(url, {
      source: SHARE_SOURCES[method],
      campaign: shareCampaign(contentType),
      content: itemId,
    });

  const links = [
    { method: "X" as const,        href: (v: string) => `https://twitter.com/intent/tweet?text=${t}&url=${encodeURIComponent(v)}`, label: "Share on X", Icon: IconBrandX },
    { method: "LinkedIn" as const, href: (v: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(v)}`, label: "Share on LinkedIn", Icon: IconBrandLinkedin },
    { method: "Facebook" as const, href: (v: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(v)}`, label: "Share on Facebook", Icon: IconBrandFacebook },
    { method: "WhatsApp" as const, href: (v: string) => `https://wa.me/?text=${encodeURIComponent(`${title} ${v}`)}`, label: "Share on WhatsApp", Icon: IconBrandWhatsapp },
  ];

  return (
    <div className={`blog-share-row ${className}`.trim()} aria-label="Share this page">
      {label && <span className="blog-share-label">{label}</span>}

      {links.map(({ method, href, label: l, Icon }) => (
        <a
          key={l}
          href={href(tagged(method))}
          target="_blank"
          rel="noopener noreferrer"
          className="blog-share-btn"
          aria-label={l}
          title={l}
          // Not preventDefault + manual window.open: these open in a new tab, so
          // the current document is never torn down and the event has time to
          // send on its own. Hijacking the navigation to "make sure" the beacon
          // lands would break middle-click and modifier-click for no gain.
          onClick={() => gaShare(method, contentType, itemId || url)}
        >
          <Icon size={16} />
        </a>
      ))}

      <button
        type="button"
        onClick={copy}
        className={`blog-share-btn${copied ? " is-copied" : ""}`}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
      >
        {copied ? <IconCheck size={16} /> : <IconLink size={16} />}
      </button>

      {/* Announced to screen readers only — the tick is the sighted feedback. */}
      <span aria-live="polite" className="sr-only">{copied ? "Link copied to clipboard" : ""}</span>
    </div>
  );
}
