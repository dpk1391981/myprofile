import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBook, listBooks } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd, faqLd } from "@/components/utils/seo";
import { SITE_URL } from "@/components/utils/site-data";
import EmailGate from "@/components/books/EmailGate";
import { bookLd, bookFaq } from "@/components/books/book-seo";

/**
 * The book landing page — the one that has to rank.
 *
 * ═══ WHY THE PAGE IS NOT THIN, EVEN THOUGH THE BOOK IS GATED ═══
 * The instinct with an email gate is to put a headline and a form on the page
 * and hide everything else. That page ranks for nothing: there is no text to
 * match a query against, no passage to quote, and nothing for an answer engine
 * to lift. So the gate is on the CHAPTERS, not on the page. Public and indexed:
 *
 *   - the preface and the introduction, in full (the sample)
 *   - every chapter heading WITH its summary (the substance signal)
 *   - the learning outcomes, as a list (what an answer engine extracts)
 *   - a FAQ answering what a person actually asks before downloading
 *
 * That is 1,500+ words of real, on-topic prose. The 35,000 behind the gate are
 * the reason to convert, not the reason to rank.
 *
 * ═══ STRUCTURED DATA ═══
 * Book + hasPart Chapter[], BreadcrumbList, FAQPage. Every type and property
 * used here was checked against scripts/schemaorg-vocab.json — see the note in
 * components/books/book-seo.ts. Do not add one from memory.
 *
 * RENDERING: statically regenerated every 10 minutes. A book changes when it is
 * republished, which is rare, and Core Web Vitals are measured on this page.
 */
export const revalidate = 600;

export async function generateStaticParams() {
  const books = await listBooks();
  return books.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const book = await getBook(params.slug);
  if (!book) return pageMeta({ title: "Book not found", description: "", path: `/books/${params.slug}` });

  const title = book.seoTitle || `${book.title}${book.subtitle ? ` — ${book.subtitle}` : ""}`;
  const description =
    book.seoDescription ||
    book.description ||
    `A free ${book.pages}-page book on ${book.topic || book.title} for ${book.audience || "developers"}.`;

  return {
    ...pageMeta({
      title,
      description: description.slice(0, 300),
      path: `/books/${book.slug}`,
      keywords: [
        book.title,
        `${book.title} book`,
        `${book.title} pdf`,
        `free ${book.topic || book.title} book`,
        ...(book.outcomes || []).slice(0, 4),
      ].filter(Boolean),
    }),
    openGraph: {
      type: "book",
      url: `${SITE_URL}/books/${book.slug}`,
      title,
      description: description.slice(0, 300),
      ...(book.coverImage ? { images: [{ url: book.coverImage }] } : {}),
    },
  };
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book) notFound();

  const faq = bookFaq(book);
  const toc = book.toc || [];

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      {/* Structured data. Three separate blocks rather than one @graph so a
          single malformed node cannot cost the page all three. */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookLd(book)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd(faq)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Books", path: "/books" },
            { name: book.title, path: `/books/${book.slug}` },
          ])),
        }} />

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/books" className="hover:text-slate-900">Books</Link>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header>
        <div className="text-5xl">{book.coverEmoji || "📘"}</div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {book.title}
        </h1>
        {book.subtitle && (
          <p className="mt-2 text-lg text-slate-600">{book.subtitle}</p>
        )}

        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          <div><dt className="sr-only">Length</dt><dd>{book.pages} pages</dd></div>
          <div><dt className="sr-only">Chapters</dt><dd>{book.chapters} chapters</dd></div>
          <div><dt className="sr-only">Words</dt><dd>{book.wordCount.toLocaleString()} words</dd></div>
          {book.level && <div><dt className="sr-only">Level</dt><dd className="capitalize">{book.level}</dd></div>}
          <div><dt className="sr-only">Price</dt><dd className="font-medium text-emerald-700">Free to read</dd></div>
        </dl>
      </header>

      {/* ── The answer block ─────────────────────────────────────────────
          First substantive passage on the page, self-contained, and phrased as
          a direct answer. This is the chunk an answer engine lifts when someone
          asks "what is the best book on X" — it has to make sense with no
          surrounding context, because that is how it will be quoted. */}
      {book.description && (
        <section className="mt-8 border-l-2 border-slate-900 pl-5">
          <p className="text-lg leading-relaxed text-slate-800">{book.description}</p>
        </section>
      )}

      {/* ── Outcomes — the highest-value extractable list ────────────────── */}
      {book.outcomes?.length > 0 && (
        <section className="mt-10" aria-labelledby="outcomes">
          <h2 id="outcomes" className="text-xl font-semibold text-slate-900">
            What you will be able to do after reading it
          </h2>
          <ul className="mt-4 space-y-2.5">
            {book.outcomes.map((o, i) => (
              <li key={i} className="flex gap-3 text-slate-700">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Who it is for ───────────────────────────────────────────────── */}
      {(book.audience || book.prerequisites) && (
        <section className="mt-10" aria-labelledby="who">
          <h2 id="who" className="text-xl font-semibold text-slate-900">Who this book is for</h2>
          {book.audience && <p className="mt-3 text-slate-700">{book.audience}</p>}
          {book.prerequisites && (
            <p className="mt-2 text-slate-600">
              <strong className="font-medium text-slate-900">Assumed knowledge:</strong>{" "}
              {book.prerequisites}
            </p>
          )}
        </section>
      )}

      {/* ── Read now, free, no signup ───────────────────────────────────
          The primary action is READING, not subscribing. Every chapter is a
          public URL, so asking for an address before the first page would cost
          the ranking those pages exist to earn — and cost the reader a reason
          to trust the book. */}
      <section className="mt-12" aria-labelledby="get">
        <h2 id="get" className="text-xl font-semibold text-slate-900">
          Read it now — free, no signup
        </h2>
        <p className="mt-2 text-slate-600">
          The whole book is on this site. Start at chapter one, or jump to whichever
          chapter you came for.
        </p>
        {toc.length > 0 && (
          <Link href={`/books/${book.slug}/${toc[0].ordinal}`}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-800">
            Start reading: {toc[0].heading}
          </Link>
        )}

        {/* The gate, secondary — an address buys the printable copy, not the
            text. Asked for AFTER the reader can see the book is real. */}
        {book.access !== "public" && (
          <div className="mt-8">
            <EmailGate slug={book.slug} bookTitle={book.title} pages={book.pages} />
          </div>
        )}
      </section>

      {/* ── The sample ──────────────────────────────────────────────────── */}
      {(book.prefaceHtml || book.introHtml) && (
        <section className="mt-14" aria-labelledby="sample">
          <h2 id="sample" className="text-xl font-semibold text-slate-900">
            Read the opening
          </h2>
          <div
            className="prose prose-slate mt-4 max-w-none prose-headings:font-semibold prose-a:text-slate-900"
            dangerouslySetInnerHTML={{ __html: (book.prefaceHtml || "") + (book.introHtml || "") }}
          />
        </section>
      )}

      {/* ── Table of contents — the substance signal ─────────────────────
          Headings alone are a list of strings. Headings WITH summaries are
          on-topic prose that tells a crawler, and a reader, that the book
          actually covers what the title claims. */}
      {toc.length > 0 && (
        <section className="mt-14" aria-labelledby="contents">
          <h2 id="contents" className="text-xl font-semibold text-slate-900">
            What is inside — all {toc.length} chapters
          </h2>
          <ol className="mt-5 space-y-5">
            {toc.map((c) => (
              <li key={c.ordinal} className="flex gap-4">
                <span className="w-6 shrink-0 pt-0.5 text-sm font-medium tabular-nums text-slate-400">
                  {c.ordinal}
                </span>
                <div className="min-w-0">
                  <h3 className="font-medium">
                    <Link href={`/books/${book.slug}/${c.ordinal}`}
                          className="text-slate-900 hover:underline">
                      {c.heading}
                    </Link>
                  </h3>
                  {c.summary && <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.summary}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mt-14" aria-labelledby="faq">
        <h2 id="faq" className="text-xl font-semibold text-slate-900">Questions</h2>
        <dl className="mt-5 space-y-6">
          {faq.map((f, i) => (
            <div key={i}>
              <dt className="font-medium text-slate-900">{f.question}</dt>
              <dd className="mt-1.5 leading-relaxed text-slate-600">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mt-14 border-t border-slate-200 pt-8">
        <p className="text-sm text-slate-500">
          Written by{" "}
          <Link href="/about" className="font-medium text-slate-900 hover:underline">
            {book.authorName || "Deepak Kumar"}
          </Link>
          .{" "}
          <Link href="/books" className="hover:underline">See the other books</Link>.
        </p>
      </footer>
    </main>
  );
}
