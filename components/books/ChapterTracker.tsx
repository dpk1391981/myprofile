"use client";

/**
 * Chapter engagement, measured but never displayed.
 *
 * A per-chapter view count on the page would be noise for the reader — they are
 * mid-book, not evaluating whether to start it. What the numbers are FOR is the
 * drop-off curve in the admin: chapters 1–3 read through, chapter 4 opened by
 * half as many, chapter 5 by a quarter. That curve is the only honest answer to
 * "is this book working", and it cannot be read off a landing-page view count.
 *
 * Same thresholds as every other surface — see useEngagement.
 */

import { useEngagement } from "@/components/utils/useEngagement";

type Props = {
  slug: string;
  ordinal: number;
  /** GA4 dimensions: which book, which chapter, how long it is. */
  bookTitle?: string;
  words?: number;
};

export default function ChapterTracker({ slug, ordinal, bookTitle = "", words = 0 }: Props) {
  useEngagement({
    endpoint: `/api/books/${encodeURIComponent(slug)}/view`,
    // The ordinal is part of the key: opening chapter 3 must not be deduped
    // against the chapter 2 the reader finished a minute earlier.
    storageKey: `chapter:${slug}:${ordinal}`,
    contentType: "chapter",
    itemId: `${slug}#${ordinal}`,
    extra: { chapter: ordinal },
    dimensions: { book_slug: slug, chapter_ordinal: ordinal, book_title: bookTitle, word_count: words },
  });

  return null;
}
