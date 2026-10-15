import Image from "next/image";

/**
 * A book's cover wherever a book is drawn — or its emoji when no cover has
 * been uploaded yet, so every call site can use this unconditionally.
 *
 * Uploaded covers are store-sized (1600x2560 JPEG), far too heavy for a 44px
 * thumbnail on a phone, so they go through next/image and are resized to the
 * slot. The upload route stores an absolute officialdeepak.in/book-media URL;
 * it is turned back into the same-origin path, which the default image loader
 * can optimise without any remotePatterns config. Anything else is drawn
 * as-is (unoptimised) rather than failing.
 */
export default function BookCover({
  src,
  emoji,
  title,
  width,
  className = "",
  priority = false,
  sizes,
}: {
  src?: string | null;
  emoji?: string | null;
  title: string;
  /** Rendered width in CSS px; height follows the 1:1.6 store ratio. */
  width: number;
  className?: string;
  /** Above the fold (book page header) — skip lazy loading. */
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <span className={`bk-cover-emoji ${className}`} aria-hidden="true">
        {emoji || "📘"}
      </span>
    );
  }
  const local = src.replace(/^https?:\/\/(www\.)?officialdeepak\.in(?=\/book-media\/)/, "");
  return (
    <Image
      src={local}
      alt={`Cover of ${title}`}
      width={width}
      height={Math.round(width * 1.6)}
      sizes={sizes || `${width}px`}
      priority={priority}
      unoptimized={!local.startsWith("/")}
      className={`bk-cover-img ${className}`}
    />
  );
}
