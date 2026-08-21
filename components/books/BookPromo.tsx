import Link from "next/link";
import { IconArrowRight, IconBook } from "@tabler/icons-react";
import { listBooks } from "@/components/utils/books-api";

/**
 * Books promo for the blog article rail.
 *
 * WHY THIS EXISTS AT ALL. The chapter pages carry the long-tail rankings, but
 * they start with no authority of their own. The blog is the part of this site
 * that already has crawl equity, so an editorial link from every article into
 * /books is the cheapest way to pass some of it down — and it is a genuinely
 * useful link, which is the only kind worth having.
 *
 * Links to the BOOK, not to a chapter: the book page links onward to all of
 * them, so one link here reaches the whole set without the article having to
 * guess which chapter is relevant.
 *
 * Renders NOTHING when there are no published books. A promo card for an empty
 * shelf is worse than no card, and it would put a dead-end link on every
 * article on the site.
 */
export default async function BookPromo() {
  const books = await listBooks();
  if (books.length === 0) return null;

  const book = books[0]; // newest published — listBooks orders by published_at

  return (
    <div className="blog-cta" style={{ background: "#f8fafc" }}>
      <p className="blog-cta-label">
        <IconBook size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
        Free book
      </p>
      <p className="blog-cta-title">{book.title}</p>
      <p className="blog-cta-body">
        {book.chapters} chapters, {book.pages} pages — free to read online, no signup.
      </p>
      <Link href={`/books/${book.slug}`} className="blog-cta-link">
        Read it free <IconArrowRight size={14} />
      </Link>
    </div>
  );
}
