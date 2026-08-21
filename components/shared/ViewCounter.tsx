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

import { useEngagement, type ContentType } from "@/components/utils/useEngagement";
import ViewCountText from "@/components/shared/ViewCountText";

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
  /** "views" on articles, "readers" on books — a book is not a web page. */
  label?: string;
  /** Emit a leading "·" so the counter drops into an existing meta line. */
  withSeparator?: boolean;
  className?: string;
};

export default function ViewCounter({
  contentType, itemId, endpoint, initialViews = 0,
  dimensions, extra, label,
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

  // Always rendered — ViewCountText applies the floor as a CSS class rather
  // than by returning null, so `?view_show=true` can reveal a sub-floor count
  // without this component (or the page around it) re-rendering.
  return (
    <ViewCountText
      views={views}
      label={label}
      withSeparator={withSeparator}
      className={className}
    />
  );
}
