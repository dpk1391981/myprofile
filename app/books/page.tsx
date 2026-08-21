import type { Metadata } from "next";
import Link from "next/link";
import { listBooks } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd } from "@/components/utils/seo";
import PriceTag from "@/components/books/PriceTag";
import { SITE_URL } from "@/components/utils/site-data";
import ViewCountText from "@/components/shared/ViewCountText";

/**
 * The books index.
 *
 * A hub page: its job is to describe the collection well enough to rank for
 * "free <topic> books" style queries, and to pass authority down to the chapter
 * pages that do the long-tail work. Every book links out; every book links back.
 *
 * ItemList JSON-LD rather than a bare CollectionPage — the list tells a search
 * engine what the page enumerates and in what order, which is what produces a
 * multi-result listing rather than a single blue link.
 */
export const revalidate = 600;

const meta = pageMeta({
  title: "Free Books for Developers — Deepak Kumar",
  description:
    "Free, full-length technical books you can read online with no signup and no paywall. " +
    "Every chapter is open; download the printable copy if you want to keep it.",
  path: "/books",
  keywords: [
    "free programming books",
    "free javascript book",
    "read technical books online free",
    "developer ebooks free",
  ],
});

export const metadata: Metadata = {
  ...meta,
  openGraph: {
    ...meta.openGraph,
    // Point at the generated card EXPLICITLY.
    //
    // Next's file convention (./opengraph-image.tsx) only fills in when a page
    // does not define openGraph itself. pageMeta always does — it spreads
    // NEXT_SEO_DEFAULT.openGraph, which carries the site portrait — so the
    // convention never applied here, and clearing `images` produced a page with
    // no og:image at all rather than the generated one. Naming the URL is
    // deterministic and does not depend on merge order.
    images: [{
      url: `${SITE_URL}/books/opengraph-image`,
      width: 1200, height: 630,
      alt: "Free technical books by Deepak Kumar",
    }],
  },
  twitter: { ...meta.twitter, images: [`${SITE_URL}/books/opengraph-image`] },
};

export default async function BooksIndex() {
  const books = await listBooks();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free books for developers",
    numberOfItems: books.length,
    itemListElement: books.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.title,
      url: `${SITE_URL}/books/${b.slug}`,
    })),
  };

  return (
    <main className="bk-shell" style={{ paddingTop: 44, paddingBottom: 80 }}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Books", path: "/books" },
          ])),
        }} />

      <header>
        <h1 className="bk-chapter-title">Books</h1>
        <p className="bk-chapter-standfirst">
          Full-length technical books, free to read online. No paywall, no signup to read —
          every chapter is a public page. If you want a copy to keep, there is a printable
          version behind a single confirmed email.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="bs-quiet" style={{ marginTop: 48, padding: "56px 20px", textAlign: "center", border: "1px dashed var(--rule)", borderRadius: 2 }}>
          The first book is being written. Check back shortly.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: "44px 0 0", padding: 0 }}>
          {books.map((b) => (
            <li key={b.id}>
              <article className="bk-pager-link" style={{ padding: "24px 26px", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                  <span aria-hidden style={{ fontSize: 38, lineHeight: 1 }}>{b.coverEmoji || "📘"}</span>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 23, fontWeight: 600, lineHeight: 1.25 }}>
                      <Link href={`/books/${b.slug}`} className="bs-link-plain">
                        {b.title}
                      </Link>
                    </h2>
                    {b.subtitle && <p className="bs-quiet" style={{ margin: "6px 0 0", fontFamily: "var(--serif)", fontSize: 17 }}>{b.subtitle}</p>}
                    {b.description && (
                      <p className="bs-body-text bs-quiet" style={{ marginTop: 14 }}>{b.description}</p>
                    )}
                    <p className="bs-small bs-quiet" style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", marginTop: 16 }}>
                      <span>{b.chapters} chapters</span>
                      <span>{b.pages} pages</span>
                      {b.level && <span style={{ textTransform: "capitalize" }}>{b.level}</span>}
                      {/* Same floor the book page and the blog use. */}
                      <ViewCountText views={b.views ?? 0} label="readers" withIcon={false} />
                      <PriceTag listPricePaise={b.listPricePaise} priceLabel={b.priceLabel}
                        currency={b.currency} size="sm" />
                    </p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
