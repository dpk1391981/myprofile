import type { Metadata } from "next";
import Link from "next/link";
import { downloadBook } from "@/components/utils/books-api";
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

  let book;
  try {
    book = await downloadBook(params.slug, token);
  } catch (err: any) {
    const forbidden = String(err?.message || "").includes("403");
    return <Locked slug={params.slug} reason={forbidden ? "unconfirmed" : "error"} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 print:max-w-none print:px-0 print:py-0">
      <style>{`
        @media print {
          /* Chrome and Safari both honour this; it is what stops a code block
             or a heading being split across a page break. */
          pre, blockquote, table, figure { break-inside: avoid; }
          h1, h2, h3 { break-after: avoid; }
          .chapter { break-before: page; }
          .no-print { display: none !important; }
          a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.75em; }
          @page { margin: 18mm 16mm; }
        }
      `}</style>

      {/* ── Screen-only toolbar ─────────────────────────────────────────── */}
      <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Your copy of {book.title}</p>
          <p className="text-xs text-slate-500">
            Bookmark this page — the link in it is how you get back here.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* ── Title page ──────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 pb-10 text-center">
        <div className="text-6xl">{book.coverEmoji || "📘"}</div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900">{book.title}</h1>
        {book.subtitle && <p className="mt-3 text-xl text-slate-600">{book.subtitle}</p>}
        <p className="mt-6 text-slate-500">{book.authorName || "Deepak Kumar"}</p>
        <p className="mt-1 text-sm text-slate-400">
          {book.chapters} chapters · {book.pages} pages
        </p>
      </header>

      {/* ── Contents ────────────────────────────────────────────────────── */}
      {book.toc?.length ? (
        <nav className="mt-10" aria-label="Table of contents">
          <h2 className="text-lg font-semibold text-slate-900">Contents</h2>
          <ol className="mt-4 space-y-1.5 text-sm">
            {book.toc.map((c) => (
              <li key={c.ordinal} className="flex gap-3">
                <span className="w-5 shrink-0 tabular-nums text-slate-400">{c.ordinal}</span>
                <span className="text-slate-700">{c.heading}</span>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {/* ── Front matter ────────────────────────────────────────────────── */}
      {(book.prefaceHtml || book.introHtml) && (
        <section className="chapter prose prose-slate mt-12 max-w-none"
                 dangerouslySetInnerHTML={{
                   __html: (book.prefaceHtml || "") + (book.introHtml || ""),
                 }} />
      )}

      {/* ── Chapters ────────────────────────────────────────────────────── */}
      {(book.body || []).map((c) => (
        <section key={c.ordinal} className="chapter mt-16">
          <p className="text-sm font-medium text-slate-400">Chapter {c.ordinal}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{c.heading}</h2>
          <div className="prose prose-slate mt-6 max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100"
               dangerouslySetInnerHTML={{ __html: c.html }} />
        </section>
      ))}

      {/* ── Back matter ─────────────────────────────────────────────────── */}
      {book.conclusionHtml && (
        <section className="chapter prose prose-slate mt-16 max-w-none"
                 dangerouslySetInnerHTML={{ __html: book.conclusionHtml }} />
      )}
      {book.aboutAuthorHtml && (
        <section className="mt-16 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">About the author</h2>
          <div className="prose prose-slate mt-3 max-w-none"
               dangerouslySetInnerHTML={{ __html: book.aboutAuthorHtml }} />
        </section>
      )}

      {/* Disclosed in the book itself, not only on the landing page — someone
          who prints this and reads it a month later should still be told. */}
      {book.aiDisclosure === "ai-generated" && (
        <p className="mt-12 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-400">
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
