"use client";

/**
 * Measures, renders nothing.
 *
 * The counterpart to ViewCounter, for surfaces where the number is displayed by
 * the server rather than by the tracker. A book's landing page is one: its
 * facts strip is a <dl> of flex items, so a component that returns null still
 * leaves an empty <div> behind and the row gains a phantom 24px gap. Splitting
 * measurement from display keeps the markup honest — and tracking must run
 * whether or not the count is shown, which is exactly what a conditionally
 * rendered display component could not do.
 */

import { useEngagement, type ContentType } from "@/components/utils/useEngagement";

type Props = {
  contentType: ContentType;
  itemId: string;
  endpoint: string;
  dimensions?: Record<string, string | number>;
  extra?: Record<string, unknown>;
  /** Overrides the default `${contentType}:${itemId}` dedupe key. */
  storageKey?: string;
};

export default function ViewTracker({
  contentType, itemId, endpoint, dimensions, extra, storageKey,
}: Props) {
  useEngagement({
    endpoint,
    storageKey: storageKey ?? `${contentType}:${itemId}`,
    contentType,
    itemId,
    dimensions,
    extra,
  });
  return null;
}
