/**
 * The rendered count. NOT a client component — the blog index, the book page
 * and the books index all render it from the server, and only the article page
 * wraps it in something that live-updates.
 *
 * Below the floor it still renders, hidden by CSS, so `?view_show=true` can
 * reveal it without a re-render. See engagement-config for why that trade.
 */

import { IconEye } from "@tabler/icons-react";
import { belowFloorClass } from "@/components/utils/engagement-config";

type Props = {
  views: number;
  /** "views" on articles, "readers" on books — a book is not a web page. */
  label?: string;
  withIcon?: boolean;
  /** Emit a leading "·" so it drops into an existing meta line. Inside the same
   *  element, so the separator disappears along with the count. */
  withSeparator?: boolean;
  /**
   * Skip the hiding class on this element because an ancestor carries it.
   * The book page's facts strip needs the whole flex item gone, not the span.
   */
  noHide?: boolean;
  className?: string;
};

export default function ViewCountText({
  views, label = "views", withIcon = true, withSeparator = false,
  noHide = false, className = "",
}: Props) {
  const formatted = views.toLocaleString("en-IN");
  const cls = ["blog-viewcount", noHide ? "" : belowFloorClass(views), className]
    .filter(Boolean).join(" ");

  return (
    <span className={cls} title={`${formatted} unique readers`}>
      {withSeparator && <span className="sep" aria-hidden="true">·</span>}
      {withIcon && <IconEye size={14} aria-hidden="true" />}
      {formatted} {label}
    </span>
  );
}
