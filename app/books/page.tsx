import type { Metadata } from "next";
import Link from "next/link";
import { listBooks } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd } from "@/components/utils/seo";
import { SITE_URL } from "@/components/utils/site-data";

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

export const metadata: Metadata = pageMeta({
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
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Books</h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          Full-length technical books, free to read online. No paywall, no signup to read —
          every chapter is a public page. If you want a copy to keep, there is a printable
          version behind a single confirmed email.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          The first book is being written. Check back shortly.
        </p>
      ) : (
        <ul className="mt-12 space-y-6">
          {books.map((b) => (
            <li key={b.id}>
              <article className="group rounded-2xl border border-slate-200 p-6 transition-colors hover:border-slate-400">
                <div className="flex items-start gap-5">
                  <span className="text-4xl" aria-hidden>{b.coverEmoji || "📘"}</span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">
                      <Link href={`/books/${b.slug}`} className="hover:underline">
                        {b.title}
                      </Link>
                    </h2>
                    {b.subtitle && <p className="mt-1 text-slate-600">{b.subtitle}</p>}
                    {b.description && (
                      <p className="mt-3 leading-relaxed text-slate-600">{b.description}</p>
                    )}
                    <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{b.chapters} chapters</span>
                      <span>{b.pages} pages</span>
                      {b.level && <span className="capitalize">{b.level}</span>}
                      <span className="font-medium text-emerald-700">Free to read</span>
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
