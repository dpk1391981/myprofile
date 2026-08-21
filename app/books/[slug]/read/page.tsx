import type { Metadata } from "next";
import Link from "next/link";
import { downloadBook, type Book } from "@/components/utils/books-api";
import PrintButton from "@/components/books/PrintButton";

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

  return (
    <main id="top" className="bk-shell" style={{ paddingTop: 40, paddingBottom: 80 }}>
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

      {/* ── Screen-only toolbar ─────────────────────────────────────────── */}
      <div className="no-print" style={{
        display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
        justifyContent: "space-between", padding: "16px 18px",
        background: "var(--surface)", borderRadius: 2, marginBottom: 44,
      }}>
        <div style={{ minWidth: 0 }}>
          <p className="bs-small" style={{ margin: 0, fontWeight: 600 }}>
            Your copy of {book.title}
          </p>
          <p className="bs-small bs-quiet" style={{ margin: "2px 0 0" }}>
            Bookmark this page — the link is how you get back to it.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* ── Title page ──────────────────────────────────────────────────── */}
      <header style={{ textAlign: "center", paddingBottom: 40 }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>{book.coverEmoji || "📘"}</div>
        <h1 className="bk-chapter-title" style={{ marginTop: 24 }}>{book.title}</h1>
        {book.subtitle && <p className="bk-chapter-standfirst">{book.subtitle}</p>}
        <p className="bs-small bs-quiet" style={{ marginTop: 26 }}>
          {book.authorName || "Deepak Kumar"}
        </p>
        <p className="bs-small bs-quiet" style={{ marginTop: 4 }}>
          {book.chapters} chapters · {book.pages} pages
        </p>
      </header>

      <div className="bs-rail-thin" />

      {/* ── Contents ────────────────────────────────────────────────────
          EVERY ENTRY IS A LINK. It was plain text, which made a twelve-chapter
          table of contents purely decorative — you could see chapter 9 existed
          and had no way to reach it without scrolling the whole book. Anchors
          jump within this page; the ordinal also carries a link out to the
          chapter's own URL for anyone who wants to share just that one. */}
      {book.toc?.length ? (
        <nav aria-label="Table of contents" style={{ margin: "40px 0" }}>
          <p className="bs-eyebrow" style={{ marginBottom: 14 }}>Contents</p>
          <ol className="bk-toc">
            {book.toc.map((c) => (
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
      ) : null}

      {/* ── Front matter ────────────────────────────────────────────────── */}
      {(book.prefaceHtml || book.introHtml) && (
        <section className="bk-chapter-break bk-prose" style={{ marginTop: 48 }}
                 dangerouslySetInnerHTML={{
                   __html: (book.prefaceHtml || "") + (book.introHtml || ""),
                 }} />
      )}

      {/* ── Chapters ────────────────────────────────────────────────────── */}
      {(book.body || []).map((c) => (
        <section key={c.ordinal} id={`chapter-${c.ordinal}`}
                 className="bk-chapter-break"
                 style={{ marginTop: 72, scrollMarginTop: 90 }}>
          <p className="bk-chapter-num">Chapter {c.ordinal}</p>
          <h2 className="bk-chapter-title" style={{ fontSize: "clamp(26px, 5vw, 34px)" }}>
            {c.heading}
          </h2>
          <div className="bk-prose" style={{ marginTop: 26 }}
               dangerouslySetInnerHTML={{ __html: c.html }} />
          <p className="no-print bs-small bs-quiet" style={{ marginTop: 18 }}>
            <a href="#top" className="bs-link">Back to contents</a>
            {" · "}
            <Link href={`/books/${book.slug}/${c.ordinal}`} className="bs-link">
              Open this chapter on its own page
            </Link>
          </p>
        </section>
      ))}

      {/* ── Back matter ─────────────────────────────────────────────────── */}
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
    </main>
  );
}

function Locked({ slug, reason }: { slug: string; reason: "no-token" | "unconfirmed" | "error" }) {
  const copy = {
    "no-token": "This link needs the token from your confirmation email.",
    unconfirmed: "Confirm your email address first — the link is in the message we sent.",
    error: "We could not open your copy just now. Try the link from your email again.",
  }[reason];

  return (
    <main className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Not unlocked yet</h1>
      <p className="mt-4 leading-relaxed text-slate-600">{copy}</p>
      <p className="mt-6 text-slate-600">
        The book is free to read either way —{" "}
        <Link href={`/books/${slug}`} className="font-medium text-slate-900 underline">
          every chapter is a public page
        </Link>
        .
      </p>
    </main>
  );
}
