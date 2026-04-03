"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  /** Your AdSense data-ad-slot value from the AdSense dashboard */
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  layout?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: boolean;
}

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

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
  const pushed = useRef(false);

  useEffect(() => {
    if (!PUB_ID || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {}
  }, []);

  // Dev / no pub-ID: render visible placeholder so layout is visible
  if (!PUB_ID) {
    return (
      <div className={`blog-ad-slot blog-ad-slot--placeholder ${className}`} style={style}>
        {label && <p className="blog-ad-label">Advertisement</p>}
        <div className="blog-ad-placeholder-inner">
          <span>Ad · {format}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`blog-ad-slot ${className}`} style={style}>
      {label && <p className="blog-ad-label">Advertisement</p>}
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}
