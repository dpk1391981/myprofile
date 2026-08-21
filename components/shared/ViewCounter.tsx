"use client";

/**
 * Renders "N views" and is also what produces the number.
 *
 * Display and measurement live together on purpose: the count the reader sees
 * is the count this very visit just wrote, so there is no second round trip and
 * no moment where the page shows a stale figure it could have avoided. The
 * measurement itself is in useEngagement, shared with every other tracked
 * surface.
 *
 * Used by article pages and book landing pages. Chapters track without
 * displaying — see components/books/ChapterTracker.
 */

import { IconEye } from "@tabler/icons-react";
import { useEngagement, type ContentType } from "@/components/utils/useEngagement";
import { MIN_PUBLIC_VIEWS } from "@/components/utils/engagement-config";

type Props = {
  contentType: ContentType;
  /** Slug. Identifies the item in GA4 and namespaces the sessionStorage keys. */
  itemId: string;
  endpoint: string;
  initialViews?: number;
  /** Extra GA4 dimensions — category, word count, and so on. */
  dimensions?: Record<string, string | number>;
  /** Extra beacon body fields. */
  extra?: Record<string, unknown>;
  minViews?: number;
  /** Emit a leading "·" so the counter drops into an existing meta line. */
  withSeparator?: boolean;
  className?: string;
};

export default function ViewCounter({
  contentType, itemId, endpoint, initialViews = 0,
  dimensions, extra, minViews = MIN_PUBLIC_VIEWS,
  withSeparator = false, className = "",
}: Props) {
  const { views } = useEngagement({
    endpoint,
    storageKey: `${contentType}:${itemId}`,
    contentType,
    itemId,
    dimensions,
    extra,
    initialViews,
  });

  if (views < minViews) return null;

  const formatted = views.toLocaleString("en-IN");

  return (
    <>
      {withSeparator && <span className="sep" aria-hidden="true">·</span>}
      <span
        className={`blog-viewcount ${className}`.trim()}
        title={`${formatted} unique readers`}
      >
        <IconEye size={14} aria-hidden="true" />
        {formatted} views
      </span>
    </>
  );
}
