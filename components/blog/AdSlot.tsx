"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  /** Your AdSense data-ad-slot value from the AdSense dashboard */
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid" | "autorelaxed";
  layout?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: boolean;
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

/**
 * MASTER SWITCH — ads are OFF unless this is explicitly turned on.
 *
 *   NEXT_PUBLIC_ADS_ENABLED=true
 *
 * Every call site, its placement and the AdSense compliance reasoning behind
 * each slot are left intact in app/blog/*; this gate is the one thing that
 * decides whether any of it renders. Turning ads back on is setting one
 * variable, not re-deriving where the units are allowed to sit.
 *
 * While it is off, AdSlot renders NOTHING — not an empty wrapper and not the
 * dev placeholder. An empty labelled box with a border is worse than no ad: it
 * takes 250px of the reading column and tells the reader the page is monetised
 * without showing them anything.
 */
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";

// CLS prevention: pre-reserve space before the ad script fires.
// Heights match the minimum rendered size for each format so the
// page does not reflow when the ad slot fills in.
const FORMAT_MIN_HEIGHT: Record<string, number> = {
  horizontal:  90,   // leaderboard / banner
  rectangle:   250,  // medium rectangle
  vertical:    600,  // skyscraper
  fluid:       120,  // in-feed / native
  autorelaxed: 120,  // responsive relaxed
  auto:        90,   // fallback
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({
  slot,
  format = "auto",
  layout,
  className = "",
  style,
  label = true,
}: AdSlotProps) {
  // One push per mounted instance — guards against double-push in StrictMode
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADS_ENABLED || !PUB_ID || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // silently ignore if adsbygoogle script not yet loaded
    }
  }, []);

  const reservedMinHeight = FORMAT_MIN_HEIGHT[format] ?? 90;

  // Switched off, or no publisher ID configured — render nothing at all.
  if (!ADS_ENABLED || !PUB_ID) return null;

  return (
    <div className={`blog-ad-slot ${className}`} style={style}>
      {label && <p className="blog-ad-label">Advertisement</p>}
      {/*
        min-height on the ins element pre-reserves the slot height so the
        browser does not reflow the page when Google fills the ad (CLS fix).
        data-full-width-responsive="true" ensures the unit scales to container
        width on all viewports without triggering horizontal scroll.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: reservedMinHeight, width: "100%", ...style }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}
