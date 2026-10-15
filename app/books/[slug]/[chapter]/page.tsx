import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapter, listBooks, getBook } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd } from "@/components/utils/seo";
import { SITE_URL } from "@/components/utils/site-data";
import { chapterLd } from "@/components/books/book-seo";
import { prepareChapter } from "@/components/books/chapter-html";
import ReadingProgress from "@/components/books/ReadingProgress";
import ChapterTracker from "@/components/books/ChapterTracker";
import PriceTag from "@/components/books/PriceTag";
import BookOfferModal, { BookOfferButton } from "@/components/books/BookOfferModal";
import ReaderControls, { TimeLeft } from "@/components/books/ReaderControls";
import { READER_INIT_SCRIPT } from "@/components/books/reader-prefs";

/**
 * One chapter, one URL — the page that does the ranking.
 *
 * A fifteen-chapter book published this way is fifteen pages of ~2,500 words of
 * on-topic prose, each targeting the concept it actually teaches. That is the
 * entire reason the text is not behind the email gate: a gated book competes
 * for its own title, an open one competes for every question inside it.
 *
 * INTERNAL LINKING is deliberate, not decoration. Every chapter links to its
 * neighbours and back to the book, so a crawler that finds any one chapter
 * discovers the whole set, and link equity earned by a popular chapter flows to
 * the rest of the book instead of dead-ending.
 *
 * Statically generated per chapter and revalidated hourly (was 10 min; raised
 * 2026-10-14 to cut Vercel ISR writes — fetches in books-api.ts match).
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const books = await listBooks();
  const params: { slug: string; chapter: string }[] = [];
  // The listing carries chapter counts, but not the table of contents — one
  // extra fetch per book at build time is cheaper than shipping a TOC on every
  // listing response for the sake of this function.
  for (const b of books) {
    const full = await getBook(b.slug);
    for (const c of full?.toc || []) {
      params.push({ slug: b.slug, chapter: String(c.ordinal) });
    }
  }
  return params;
}

export async function generateMetadata(
  { params }: { params: { slug: string; chapter: string } }
): Promise<Metadata> {
  const data = await getChapter(params.slug, Number(params.chapter));
  if (!data) {
    return pageMeta({ title: "Chapter not found", description: "", path: "/books" });
  }
  const { book, chapter } = data;

  // The chapter's own heading leads: it is what the query matches. The book
  // title trails as context — the reverse buries the ranking term past the
  // truncation point in a SERP.
  const title = `${chapter.heading} — ${book.title}`;
  const description =
    chapter.summary ||
    `Chapter ${chapter.ordinal} of ${book.title}: ${chapter.heading}. Free to read online.`;

  return {
    ...pageMeta({
      title,
      description: description.slice(0, 300),
      path: `/books/${book.slug}/${chapter.ordinal}`,
      keywords: [chapter.heading, ...(chapter.concepts || []).slice(0, 6), book.title],
    }),
    openGraph: {
      type: "article",
      url: `${SITE_URL}/books/${book.slug}/${chapter.ordinal}`,
      title,
      description: description.slice(0, 300),
    },
  };
}

export default async function ChapterPage(
  { params }: { params: { slug: string; chapter: string } }
) {
  const ordinal = Number(params.chapter);
  if (!Number.isInteger(ordinal) || ordinal < 1) notFound();

  const data = await getChapter(params.slug, ordinal);
  if (!data) notFound();

  const { book, chapter, prev, next } = data;
  const toc = book.toc || [];

  // Heading ids + the visible ¶ affordance, so every section inside a chapter
  // is directly linkable and the contents rail below has somewhere to point.
  const { html, headings } = prepareChapter(chapter.html);
  const sections = headings.filter((h) => h.level === 2);

  const minutes = Math.max(1, Math.round(chapter.wordCount / 230));

  return (
    /*
      THE PAPER READER. The chapter sits on a sheet on a desk — the way a PDF
      viewer shows a page — because that one change does most of what "easy to
      read" means: a clear edge to the reading area, wide inner margins, and a
      measure of ~70 characters instead of a 38rem strip with empty space on
      both sides. Contents and reading settings live in the left rail on a
      desktop; below 1100px the sheet has the width to itself, and below 720px
      it goes edge to edge like an e-reader. See .bkp-* in broadsheet.css.

      #bk-desk carries the reader's settings (data-size, data-paper). The inline
      script applies the saved ones before paint; suppressHydrationWarning is
      for exactly those two attributes.
    */
    <div id="bk-desk" className="bkp-desk" data-size="2" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: READER_INIT_SCRIPT }} />
      <ReadingProgress />
      <ChapterTracker
        slug={book.slug}
        ordinal={chapter.ordinal}
        bookTitle={book.title}
        words={chapter.wordCount}
      />

      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterLd(book, chapter)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Books", path: "/books" },
            { name: book.title, path: `/books/${book.slug}` },
            { name: chapter.heading, path: `/books/${book.slug}/${chapter.ordinal}` },
          ])),
        }} />

      <div className="bkp-layout">
        {/* ── The rail (desktop) ──────────────────────────────────────────
            Everything here is also on the sheet below for the widths where
            the rail is not drawn, so nothing is lost when it is hidden. */}
        <aside className="bkp-rail" aria-label={`${book.title} — contents`}>
          <div className="bk-rail-book">
            <span className="bk-rail-emoji" aria-hidden="true">{book.coverEmoji || "📘"}</span>
            <div style={{ minWidth: 0 }}>
              <p className="bk-rail-title">
                <Link href={`/books/${book.slug}`} className="bs-link-plain">{book.title}</Link>
              </p>
              <p className="bk-rail-sub">
                {book.pages} pages · {toc.length} chapters · free
              </p>
            </div>
          </div>

          <TimeLeft words={chapter.wordCount} />

          {sections.length >= 2 && (
            <nav className="bk-rail-group" aria-label="Sections in this chapter">
              <p className="bs-eyebrow">In this chapter</p>
              <ul className="bk-rail-list">
                {sections.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="bk-rail-link" title={h.text}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav className="bk-rail-group bkp-rail-chapters" aria-label="All chapters">
            <p className="bs-eyebrow">All {toc.length} chapters</p>
            <ul className="bk-rail-list">
              {toc.map((c) => (
                <li key={c.ordinal}>
                  <Link
                    href={`/books/${book.slug}/${c.ordinal}`}
                    aria-current={c.ordinal === chapter.ordinal ? "page" : undefined}
                    title={c.heading}
                    className={`bk-rail-link${c.ordinal === chapter.ordinal ? " bk-rail-link--current" : ""}`}
                  >
                    <span className="bk-rail-num">{String(c.ordinal).padStart(2, "0")}</span>
                    {c.heading}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </aside>

        {/* ── The sheet ─────────────────────────────────────────────────── */}
        <main className="bkp-sheet">
          {/* The toolbar: running head + reading settings + Save as PDF. Pinned
              under the site header while the chapter scrolls, so the PDF and
              the settings are one click away from any paragraph. */}
          <div className="bkp-toolbar">
            <div className="bkp-runninghead" aria-hidden="true">
              <span className="bkp-runninghead-book">{book.title}</span>
              <span>Chapter {chapter.ordinal} / {toc.length}</span>
            </div>
            <ReaderControls />
          </div>

          <nav aria-label="Breadcrumb" className="bkp-crumbs">
            <Link href="/books" className="bs-link-plain">Books</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/books/${book.slug}`} className="bs-link-plain">{book.title}</Link>
          </nav>

          <header className="bkp-opener">
            <p className="bk-chapter-num">Chapter {chapter.ordinal}</p>
            <h1 className="bk-chapter-title">{chapter.heading}</h1>
            <div className="bkp-opener-rule" aria-hidden="true" />
            {chapter.summary && <p className="bk-chapter-standfirst">{chapter.summary}</p>}
            <p className="bk-chapter-meta">
              By {book.authorName || "Deepak Kumar"} · {minutes} min read ·{" "}
              {chapter.wordCount.toLocaleString()} words
            </p>
          </header>

          {/* In-flow contents, for the widths with no rail. */}
          {headings.length >= 3 && (
            <nav aria-label="In this chapter" className="bk-inline-toc bkp-inline-toc">
              <p className="bs-eyebrow" style={{ marginBottom: 10 }}>In this chapter</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {headings.map((h) => (
                  <li key={h.id} style={{ padding: "4px 0", paddingLeft: h.level === 3 ? 16 : 0 }}>
                    <a href={`#${h.id}`} className="bs-link-plain" style={{ fontSize: 15.5 }}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <article className="bk-prose" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Folio — the end of the page, where a book puts its number. */}
          <p className="bkp-folio" aria-hidden="true">— {chapter.ordinal} —</p>

          {/* ── Page turn ────────────────────────────────────────────────── */}
          <nav aria-label="Chapter navigation" className="bk-pager bkp-pager">
            {prev && (
              <Link href={`/books/${book.slug}/${prev.ordinal}`} className="bk-pager-link">
                <span className="bk-pager-kicker">← Chapter {prev.ordinal}</span>
                <p className="bk-pager-title">{prev.heading}</p>
              </Link>
            )}
            {next && (
              <Link href={`/books/${book.slug}/${next.ordinal}`} className="bk-pager-link bk-pager-link--next">
                <span className="bk-pager-kicker">Chapter {next.ordinal} →</span>
                <p className="bk-pager-title">{next.heading}</p>
              </Link>
            )}
          </nav>

          {/* ── The offer, at the end of the chapter ─────────────────────
              Asked for after the reader has been given something — a fair
              trade rather than a toll. */}
          <aside className="bkp-offer">
            <p className="bs-eyebrow">Free book</p>
            <p className="bs-h4" style={{ margin: "8px 0 6px", fontSize: 19 }}>
              Want all {toc.length} chapters as one PDF?
            </p>
            <p style={{ margin: "0 0 10px" }}>
              <PriceTag listPricePaise={book.listPricePaise} priceLabel={book.priceLabel}
                        currency={book.currency} size="md" />
            </p>
            <p className="bs-small bs-quiet" style={{ margin: "0 0 16px" }}>
              {book.pages} pages, printable and yours to keep. No payment.
            </p>
            <BookOfferButton>Get the full book</BookOfferButton>
          </aside>

          {/* ── All chapters ───────────────────────────────────────────────
              Flat internal linking for readers and crawlers; on a desktop the
              rail already shows this list, so it is drawn below 1100px only. */}
          <section aria-labelledby="contents" className="bkp-alltoc">
            <p className="bs-eyebrow" id="contents" style={{ marginBottom: 12 }}>All chapters</p>
            <ol className="bk-toc">
              {toc.map((c) => (
                <li key={c.ordinal}
                    className={`bk-toc-item${c.ordinal === chapter.ordinal ? " bk-toc-item--current" : ""}`}>
                  <span className="bk-toc-num">{c.ordinal}</span>
                  <div style={{ minWidth: 0 }}>
                    {c.ordinal === chapter.ordinal ? (
                      <span className="bk-toc-link">{c.heading}</span>
                    ) : (
                      <Link href={`/books/${book.slug}/${c.ordinal}`} className="bk-toc-link">
                        {c.heading}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>

      {/* The offer dialog. Never on arrival — see the component. Also opened
          by "Save as PDF" in the reading settings. */}
      <BookOfferModal
        slug={book.slug}
        bookTitle={book.title}
        pages={book.pages}
        chapters={toc.length || book.chapters}
      />
    </div>
  );
}
