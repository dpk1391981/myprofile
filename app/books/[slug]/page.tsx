import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBook, listBooks } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd, faqLd } from "@/components/utils/seo";
import { SITE_URL } from "@/components/utils/site-data";
import EmailGate from "@/components/books/EmailGate";
import PriceTag from "@/components/books/PriceTag";
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
    <main className="bk-shell" style={{ paddingTop: 44, paddingBottom: 80 }}>
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

      <nav aria-label="Breadcrumb" className="bs-small bs-quiet" style={{ marginBottom: 30 }}>
        <Link href="/" className="bs-link-plain">Home</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href="/books" className="bs-link-plain">Books</Link>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header>
        <div style={{ fontSize: 52, lineHeight: 1 }}>{book.coverEmoji || "📘"}</div>
        <h1 className="bk-chapter-title" style={{ marginTop: 20 }}>
          {book.title}
        </h1>
        {book.subtitle && (
          <p className="bk-chapter-standfirst">{book.subtitle}</p>
        )}

        <dl className="bs-small bs-quiet" style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", marginTop: 22 }}>
          <div><dt className="sr-only">Length</dt><dd>{book.pages} pages</dd></div>
          <div><dt className="sr-only">Chapters</dt><dd>{book.chapters} chapters</dd></div>
          <div><dt className="sr-only">Words</dt><dd>{book.wordCount.toLocaleString()} words</dd></div>
          {book.level && <div><dt className="sr-only">Level</dt><dd className="capitalize">{book.level}</dd></div>}
          <div>
            <dt className="sr-only">Price</dt>
            <dd>
              <PriceTag listPricePaise={book.listPricePaise} priceLabel={book.priceLabel}
                        currency={book.currency} size="sm" />
            </dd>
          </div>
        </dl>
      </header>

      {/* ── The answer block ─────────────────────────────────────────────
          First substantive passage on the page, self-contained, and phrased as
          a direct answer. This is the chunk an answer engine lifts when someone
          asks "what is the best book on X" — it has to make sense with no
          surrounding context, because that is how it will be quoted. */}
      {book.description && (
        <section style={{ marginTop: 34, paddingLeft: 20, borderLeft: "2px solid var(--spot)" }}>
          <p className="bs-lede" style={{ margin: 0 }}>{book.description}</p>
        </section>
      )}

      {/* ── Outcomes — the highest-value extractable list ────────────────── */}
      {book.outcomes?.length > 0 && (
        <section style={{ marginTop: 44 }} aria-labelledby="outcomes">
          <h2 id="outcomes" className="bs-h3" style={{ fontSize: 22 }}>
            What you will be able to do after reading it
          </h2>
          <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
            {book.outcomes.map((o, i) => (
              <li key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <span aria-hidden style={{ marginTop: 9, width: 5, height: 5, flex: "0 0 5px", borderRadius: "50%", background: "var(--spot)" }} />
                <span className="bs-body-text">{o}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Who it is for ───────────────────────────────────────────────── */}
      {(book.audience || book.prerequisites) && (
        <section style={{ marginTop: 44 }} aria-labelledby="who">
          <h2 id="who" className="bs-h3" style={{ fontSize: 22 }}>Who this book is for</h2>
          {book.audience && <p className="bs-body-text" style={{ marginTop: 14 }}>{book.audience}</p>}
          {book.prerequisites && (
            <p className="bs-body-text bs-quiet" style={{ marginTop: 10 }}>
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Assumed knowledge:</strong>{" "}
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
      <section style={{ marginTop: 48 }} aria-labelledby="get">
        <h2 id="get" className="bs-h3" style={{ fontSize: 22 }}>
          Read it now — free, no signup
        </h2>
        <p className="bs-body-text" style={{ marginTop: 12 }}>
          The whole book is on this site. Start at chapter one, or jump to whichever
          chapter you came for.
        </p>

        {/* The anchor. Renders as a plain "Free" until a real list price is set
            — see components/books/PriceTag.tsx. */}
        <div style={{
          marginTop: 22, padding: "18px 20px", borderRadius: 2,
          background: "var(--spot-tint)", border: "1px solid var(--rule)",
        }}>
          <PriceTag listPricePaise={book.listPricePaise} priceLabel={book.priceLabel}
                    currency={book.currency} size="lg" />
          <p className="bs-small bs-quiet" style={{ margin: "8px 0 0" }}>
            {book.pages} pages · {book.chapters} chapters · no paywall, no signup to read
          </p>
        </div>
        {toc.length > 0 && (
          <Link href={`/books/${book.slug}/${toc[0].ordinal}`}
                className="bs-btn bs-btn--solid" style={{ marginTop: 18 }}>
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
        <section style={{ marginTop: 56 }} aria-labelledby="sample">
          <h2 id="sample" className="bs-h3" style={{ fontSize: 22 }}>
            Read the opening
          </h2>
          <div
            className="bk-prose" style={{ marginTop: 20 }}
            dangerouslySetInnerHTML={{ __html: (book.prefaceHtml || "") + (book.introHtml || "") }}
          />
        </section>
      )}

      {/* ── Table of contents — the substance signal ─────────────────────
          Headings alone are a list of strings. Headings WITH summaries are
          on-topic prose that tells a crawler, and a reader, that the book
          actually covers what the title claims. */}
      {toc.length > 0 && (
        <section style={{ marginTop: 56 }} aria-labelledby="contents">
          <h2 id="contents" className="bs-h3" style={{ fontSize: 22 }}>
            What is inside — all {toc.length} chapters
          </h2>
          <ol className="bk-toc" style={{ marginTop: 18 }}>
            {toc.map((c) => (
              <li key={c.ordinal} className="bk-toc-item">
                <Link href={`/books/${book.slug}/${c.ordinal}`} className="bk-toc-num bs-link-plain">
                  {c.ordinal}
                </Link>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontWeight: 400 }}>
                    <Link href={`/books/${book.slug}/${c.ordinal}`} className="bk-toc-link">
                      {c.heading}
                    </Link>
                  </h3>
                  {c.summary && <p className="bk-toc-summary">{c.summary}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section style={{ marginTop: 56 }} aria-labelledby="faq">
        <h2 id="faq" className="bs-h3" style={{ fontSize: 22 }}>Questions</h2>
        <dl style={{ marginTop: 20 }}>
          {faq.map((f, i) => (
            <div key={i}>
              <dt className="bs-body-text" style={{ fontWeight: 600 }}>{f.question}</dt>
              <dd className="bs-body-text bs-quiet" style={{ margin: "6px 0 22px" }}>{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer style={{ marginTop: 56, paddingTop: 26, borderTop: "1px solid var(--hair)" }}>
        <p className="bs-small bs-quiet">
          Written by{" "}
          <Link href="/about" className="bs-link">
            {book.authorName || "Deepak Kumar"}
          </Link>
          .{" "}
          <Link href="/books" className="bs-link">See the other books</Link>.
        </p>
      </footer>
    </main>
  );
}
