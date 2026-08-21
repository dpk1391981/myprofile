import type { Metadata } from "next";
import Link from "next/link";
import { downloadBook, type Book } from "@/components/utils/books-api";
import ReaderChrome from "@/components/books/ReaderChrome";

/**
 * The printable copy — every chapter in one document.
 *
 * This is what a confirmed email address buys. The chapters themselves are free
 * and public at /books/{slug}/{n}; what is behind the gate is the convenience
 * of one file you can print, annotate, or keep offline.
 *
 * NOINDEX, deliberately. This page duplicates every chapter's text, and letting
 * a search engine index both would put the book in competition with itself —
 * the chapter pages are the ones built to rank, and a duplicate-content split
 * would weaken exactly the URLs the strategy depends on.
 *
 * PDF GENERATION is the browser's. `window.print()` against a stylesheet tuned
 * for paper produces a correct, selectable, accessible PDF on every platform,
 * with no Chromium on the VPS and no 20 MB binary in the bundle. The print
 * rules live in the <style> block below rather than globals.css so nothing here
 * can affect another page's printing.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // The one page on the site that must not be indexed — see above.
  robots: { index: false, follow: false },
};

export default async function ReadBookPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { token?: string };
}) {
  const token = searchParams?.token || "";

  if (!token) return <Locked slug={params.slug} reason="no-token" />;

  let book: Book;
  try {
    book = await downloadBook(params.slug, token);
  } catch (err: any) {
    const forbidden = String(err?.message || "").includes("403");
    return <Locked slug={params.slug} reason={forbidden ? "unconfirmed" : "error"} />;
  }

  // Narrowed once here rather than at each use: `toc` is optional on Book, and
  // the printed contents, the drawer and the running head all read it.
  const tocEntries = book.toc || [];

  return (
    <div className="bk-reader">
      <style>{`
        @media print {
          pre, blockquote, table, figure { break-inside: avoid; }
          h1, h2, h3 { break-after: avoid; }
          .bk-chapter-break { break-before: page; }
          .no-print { display: none !important; }
          a[href^="http"]::after { content: " (" attr(href) ")"; font-size: .75em; }
          @page { margin: 18mm 16mm; }
        }
      `}</style>

      {/* Progress, running head and the contents drawer. A client island —
          the book's markup stays server-rendered around it. */}
      <ReaderChrome title={book.title} toc={tocEntries} slug={book.slug} />

      {/* The sheet. See the .bk-page notes in broadsheet.css for why the page
          is bounded and shadowed rather than running edge to edge. */}
      <article id="top" className="bk-page">

        {/* ── Title page ────────────────────────────────────────────────── */}
        <header className="bk-titlepage">
          <div className="bk-titlepage-mark">{book.coverEmoji || "📘"}</div>
          <h1 className="bk-chapter-title" style={{ marginTop: 22 }}>{book.title}</h1>
          {book.subtitle && <p className="bk-chapter-standfirst">{book.subtitle}</p>}
          <div className="bk-titlepage-rule" aria-hidden="true" />
          <p className="bk-titlepage-author">{book.authorName || "Deepak Kumar"}</p>
          <p className="bk-titlepage-facts">
            {book.chapters} chapters · {book.pages} pages
            {book.wordCount ? ` · ${book.wordCount.toLocaleString("en-IN")} words` : ""}
          </p>
        </header>

        {/* ── Contents ──────────────────────────────────────────────────
            Printed once at the front, as a book does. The drawer in the reader
            bar is the copy you can reach from anywhere; this one exists so the
            PDF has a table of contents at all. */}
        {tocEntries.length > 0 && (
          <nav aria-label="Table of contents" style={{ margin: "clamp(40px, 7vh, 64px) 0 0" }}>
            <p className="bs-eyebrow" style={{ marginBottom: 14 }}>Contents</p>
            <ol className="bk-toc">
              {tocEntries.map((c) => (
                <li key={c.ordinal} className="bk-toc-item">
                  <a href={`#chapter-${c.ordinal}`} className="bk-toc-num bs-link-plain">
                    {c.ordinal}
                  </a>
                  <div style={{ minWidth: 0 }}>
                    <a href={`#chapter-${c.ordinal}`} className="bk-toc-link">{c.heading}</a>
                    {c.summary && <p className="bk-toc-summary">{c.summary}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* ── Front matter ──────────────────────────────────────────────── */}
        {(book.prefaceHtml || book.introHtml) && (
          <section className="bk-chapter-break bk-prose" style={{ marginTop: 48 }}
                   dangerouslySetInnerHTML={{
                     __html: (book.prefaceHtml || "") + (book.introHtml || ""),
                   }} />
        )}

        {/* ── Chapters ──────────────────────────────────────────────────
            `data-chapter` is what ReaderChrome's IntersectionObserver watches
            to drive the running head and the drawer's current-chapter mark. */}
        {(book.body || []).map((c) => (
          <section key={c.ordinal} id={`chapter-${c.ordinal}`}
                   data-chapter={c.ordinal}
                   className="bk-chapter-break"
                   style={{ scrollMarginTop: 64 }}>
            <div className="bk-chapter-open">
              <p className="bk-chapter-num">Chapter {c.ordinal}</p>
              <h2 className="bk-chapter-open-title">{c.heading}</h2>
            </div>
            <div className="bk-prose bk-chapter-body" style={{ marginTop: 34 }}
                 dangerouslySetInnerHTML={{ __html: c.html }} />
            <p className="no-print bs-small bs-quiet" style={{ marginTop: 26, textAlign: "center" }}>
              <Link href={`/books/${book.slug}/${c.ordinal}`} className="bs-link">
                Open this chapter on its own page
              </Link>
            </p>
          </section>
        ))}

        {/* ── Back matter ───────────────────────────────────────────────── */}
        {book.conclusionHtml && (
          <section className="bk-chapter-break bk-prose" style={{ marginTop: 72 }}
                   dangerouslySetInnerHTML={{ __html: book.conclusionHtml }} />
        )}
        {book.aboutAuthorHtml && (
          <section style={{ marginTop: 64 }}>
            <div className="bs-rail-thin" style={{ marginBottom: 24 }} />
            <p className="bs-eyebrow" style={{ marginBottom: 10 }}>About the author</p>
            <div className="bk-prose" dangerouslySetInnerHTML={{ __html: book.aboutAuthorHtml }} />
          </section>
        )}

        {/* Disclosed in the book itself, not only on the landing page — someone
            who prints this and reads it a month later should still be told. */}
        {book.aiDisclosure === "ai-generated" && (
          <p className="bs-small bs-quiet" style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--hair)" }}>
            This book was drafted with an AI writing pipeline and reviewed and edited by{" "}
            {book.authorName || "Deepak Kumar"} before publication. Code examples are
            automatically verified.
          </p>
        )}
      </article>
    </div>
  );
}

function Locked({ slug, reason }: { slug: string; reason: "no-token" | "unconfirmed" | "error" }) {
  const copy = {
    "no-token": "This link needs the token from your confirmation email.",
    unconfirmed: "Confirm your email address first — the link is in the message we sent.",
    error: "We could not open your copy just now. Try the link from your email again.",
  }[reason];

  return (
    <main className="bk-shell" style={{ paddingTop: 80, paddingBottom: 100 }}>
      <h1 className="bk-chapter-title">Not unlocked yet</h1>
      <p className="bs-body-text bs-quiet" style={{ marginTop: 18 }}>{copy}</p>
      <p className="bs-body-text" style={{ marginTop: 26 }}>
        The book is free to read either way —{" "}
        <Link href={`/books/${slug}`} className="bs-link">
          every chapter is a public page
        </Link>
        .
      </p>
    </main>
  );
}
