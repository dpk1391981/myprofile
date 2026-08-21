import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import { listBooks, getBook, type Book, type BookToc } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd, faqLd } from "@/components/utils/seo";
import PriceTag from "@/components/books/PriceTag";
import { SITE_URL } from "@/components/utils/site-data";
import { PERSONAL_INFO } from "@/components/utils/portfolio-data";
import { ShelfFigure } from "@/components/bs/HeadFigure";
import ViewCountText from "@/components/shared/ViewCountText";

/**
 * The books index — the hub page.
 *
 * ═══ WHAT THIS PAGE IS FOR ═══
 * Two jobs, and they pull in the same direction:
 *
 *   1. RANK for the collection queries — "free programming books", "free
 *      react book", "read technical books online free". Those are head terms
 *      with commercial intent, and every competing result is a paid book or a
 *      list of links to paid books. Being genuinely free is the differentiator,
 *      so the page states it in the title, the H1, the answer block, the FAQ
 *      and the Offer node rather than mentioning it once.
 *
 *   2. PASS AUTHORITY DOWN. A fifteen-chapter book is fifteen indexable pages
 *      of on-topic prose, and they are otherwise three clicks from the front
 *      page. This index links the first chapters of every book DIRECTLY, so
 *      the pages that do the long-tail work are one hop from a page the whole
 *      site links to.
 *
 * ═══ WHY IT IS NOT SET IN THE BOOK MEASURE ═══
 * It used to render inside `.bk-shell` (38rem — the reading column). A listing
 * in a reading column is a narrow tower: every blurb ran nine lines deep, one
 * book filled the viewport, and two thirds of the page was empty paper. The
 * index is a shop window, not a reading surface, so it uses the broadsheet
 * shell (`.bs-wrap`) and the same head furniture as the blog index. The .bk-
 * reading styles are untouched; everything new here is scoped `.bkx-`.
 *
 * ═══ GEO / AEO ═══
 * An answer engine quotes self-contained passages, lists and tables — not
 * layout. So the page carries, in this order: a one-paragraph answer block
 * that makes sense with no surrounding context, per-book outcome lists, a
 * comparison table of every book, and a visible FAQ (visible, not an
 * accordion — text behind a click may never be read). The FAQPage JSON-LD
 * mirrors that copy exactly rather than restating it differently.
 *
 * ═══ STRUCTURED DATA ═══
 * One @graph: CollectionPage → ItemList → Book nodes (with the same @id the
 * book page mints, so the two describe one entity rather than two), plus
 * BreadcrumbList and FAQPage. Every type and property used here was checked
 * against scripts/schemaorg-vocab.json — see the note in
 * components/books/book-seo.ts. Do not add one from memory.
 *
 * RENDERING: statically regenerated every 10 minutes.
 */
export const revalidate = 600;

/** Chapters linked per book on the index. Enough to prove depth and to seed a
 *  crawl; the rest are one click away in the book's own contents. */
const CHAPTER_LINKS = 6;

/** Outcomes shown per book. Three is what a reader scans before deciding. */
const OUTCOME_LINES = 3;

/** Reading pace for the "N hours" figure. Deliberately conservative for
 *  technical prose with code — 250wpm is a novel, not a book with listings. */
const WORDS_PER_MINUTE = 200;

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

/** "34,200 words" → "about 3 hours". Rounded to the half hour: a "2h 51m"
 *  claim implies a precision that a word count does not have. */
function readingTime(words: number): string {
  if (!words) return "";
  const hours = words / WORDS_PER_MINUTE / 60;
  if (hours < 1) return `${Math.max(10, Math.round((words / WORDS_PER_MINUTE) / 5) * 5)} min read`;
  const rounded = Math.round(hours * 2) / 2;
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} hr read`;
}

/* ── Data ──────────────────────────────────────────────────────────────────
   The list endpoint does not carry the table of contents (see _book_public in
   the agent service), and the chapter links are the highest-value thing on
   this page. So each book is fetched once more for its TOC.

   That is N+1 requests, and it is the right trade here: N is the number of
   PUBLISHED books — single digits, and it changes about once a month — every
   call is cached upstream for 300s, and the page itself only re-renders every
   600s. The sitemap already does exactly this for the same reason. getBook
   degrades to null, so a book whose detail call fails still renders from the
   list payload, just without its chapter rail. */
type ShelfBook = Book & { toc: BookToc[] };

async function getShelf(): Promise<ShelfBook[]> {
  const books = await listBooks();
  const full = await Promise.all(books.map((b) => getBook(b.slug)));
  return books.map((b, i) => ({
    ...b,
    ...(full[i] ?? {}),
    toc: full[i]?.toc ?? [],
  }));
}

/* ── Metadata ──────────────────────────────────────────────────────────────
   The title leads with the query, not with the section name. "Books" ranks for
   nothing; "Free Programming Books" is what a person types, and "No Signup" is
   the objection they are carrying when they type it — answering it in the SERP
   line is what earns the click over a list of gated PDFs. */
const INDEX_TITLE = "Free Programming Books — Read Online, No Signup | Deepak Kumar";
const INDEX_DESC =
  "Free full-length technical books for developers. Every chapter is a public page — " +
  "no paywall, no account, no trial. Read online or get a printable copy by email.";

export async function generateMetadata(): Promise<Metadata> {
  const books = await listBooks();
  const pages = books.reduce((n, b) => n + (b.pages || 0), 0);

  /* The description states the real size of the shelf. A page that says "free
     books" is a claim; one that says "3 books, 412 pages, free" is evidence,
     and evidence is what gets quoted by an answer engine. Falls back to the
     static line before the first book publishes. */
  const description = books.length
    ? `${books.length} free full-length technical book${books.length === 1 ? "" : "s"} — ` +
      `${pages} pages on ${books.map((b) => b.topic || b.title).slice(0, 3).join(", ")}. ` +
      "Every chapter is a public page: no paywall, no signup, no trial."
    : INDEX_DESC;

  const meta = pageMeta({
    title: INDEX_TITLE,
    description: description.slice(0, 300),
    path: "/books",
    keywords: [
      // Head terms — the collection queries this page is written to win.
      "free programming books",
      "free books for developers",
      "read technical books online free",
      "free software engineering books",
      "free coding books online",
      "developer ebooks free",
      "free programming books India",
      // Long tail, from the shelf itself, so the list grows with the books
      // rather than going stale the day a new one publishes.
      ...books.flatMap((b) => [
        `free ${b.topic || b.title} book`,
        `${b.title} book`,
        `${b.title} pdf`,
      ]),
      `${PERSONAL_INFO.fullName} books`,
    ].filter(Boolean),
  });

  return {
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
    // Large image previews and untruncated snippets. This page WANTS to be
    // quoted at length — the answer block and the FAQ are written for it.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

/* ── The FAQ ───────────────────────────────────────────────────────────────
   Collection-level questions, not book-level ones — the book pages carry their
   own (see bookFaq in components/books/book-seo.ts) and duplicating them here
   would put the same FAQPage answers on two competing URLs.

   Built from the shelf so no answer can drift away from what is actually
   published. The AI-disclosure question is here ON PURPOSE: someone will ask
   it, and the page that answers it plainly keeps the reader. */
function indexFaq(books: ShelfBook[]): { question: string; answer: string }[] {
  const pages = books.reduce((n, b) => n + (b.pages || 0), 0);
  // Counted from the tables of contents, so the FAQ can never advertise a
  // chapter that does not exist — see the note on chapterCount below.
  const chapters = books.reduce((n, b) => n + (b.toc.length || b.chapters || 0), 0);
  const topics = books.map((b) => b.topic || b.title).filter(Boolean);
  const aiWritten = books.some((b) => b.aiDisclosure === "ai-generated");

  const faq = [
    {
      question: "Are these programming books really free?",
      answer:
        `Yes. All ${books.length} book${books.length === 1 ? "" : "s"} — ${chapters} chapters, ` +
        `about ${pages} printed pages — are free to read in full on this site. There is no paywall, ` +
        "no trial, no metered limit and nothing to buy. Every chapter is an ordinary public web page.",
    },
    {
      question: "Do I need to sign up or create an account to read them?",
      answer:
        "No. Reading requires no account, no email address and no login. An email address is only " +
        "asked for if you want the whole book as one printable file to keep, and that is optional — " +
        "the same text is on the site either way.",
    },
    {
      question: "Can I download a PDF of these books?",
      answer:
        "Yes. Confirm an email address on any book's page and you get a single printable copy of " +
        "that book. One confirmation email, one-click unsubscribe on everything after it, and the " +
        "address is never sold or shared.",
    },
  ];

  if (topics.length) {
    faq.push({
      question: "What topics do the books cover?",
      answer:
        `${topics.join(", ")}. Each book is a full-length treatment of one subject rather than a ` +
        "collection of tutorials — architecture and trade-offs first, with working code examples " +
        "throughout.",
    });
  }

  faq.push({
    question: `Who writes these books?`,
    answer:
      `${PERSONAL_INFO.fullName}, ${PERSONAL_INFO.title} — writing from production experience ` +
      "building web and AI systems at scale, not from documentation summaries.",
  });

  if (aiWritten) {
    faq.push({
      question: "Were these books written with AI?",
      answer:
        `Drafted by an AI writing pipeline and then reviewed and edited by ${PERSONAL_INFO.fullName} ` +
        "before publication. Every code example is checked by a parser before it ships, and chapters " +
        "that did not meet the editorial bar were rewritten or held back. We say so plainly rather " +
        "than leaving you to work it out.",
    });
  }

  faq.push({
    question: "Can I use these books to teach, or share them with my team?",
    answer:
      "Yes — send anyone the link. Every chapter is a public URL, so nobody you share it with hits " +
      "a signup wall, and the pages read the same on a phone as on a desktop.",
  });

  return faq;
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function BooksIndex() {
  const books = await getShelf();

  const totalPages = books.reduce((n, b) => n + (b.pages || 0), 0);
  const totalWords = books.reduce((n, b) => n + (b.wordCount || 0), 0);
  const totalChapters = books.reduce((n, b) => n + (b.toc.length || b.chapters || 0), 0);
  const faq = indexFaq(books);

  /* The most recent publication or revision on the shelf. Emitted as
     `dateModified` so a crawler can see the collection is alive — a hub page
     with no freshness signal is treated as an archive. */
  const lastUpdated = books
    .map((b) => b.updatedAt || b.publishedAt || "")
    .filter(Boolean)
    .sort()
    .pop();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/books`,
        url: `${SITE_URL}/books`,
        name: "Free programming books for developers",
        description: INDEX_DESC,
        inLanguage: "en",
        isAccessibleForFree: true,
        // Reference the Person node the root layout already ships rather than
        // restating it — two Person nodes with the same name and no shared
        // @id read as two different people.
        author: { "@id": `${SITE_URL}/#person` },
        publisher: { "@id": `${SITE_URL}/#person` },
        ...(lastUpdated ? { dateModified: lastUpdated } : {}),
        ...(books.length ? { mainEntity: { "@id": `${SITE_URL}/books#list` } } : {}),
      },
      ...(books.length
        ? [{
            "@type": "ItemList",
            "@id": `${SITE_URL}/books#list`,
            name: "Free books for developers",
            numberOfItems: books.length,
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            itemListElement: books.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/books/${b.slug}`,
              /* The Book node inline, under the SAME @id the book's own page
                 mints (see bookLd). Two nodes describing one book must share
                 an identifier or they are read as two different works — and
                 the listing is far more likely to produce a rich result when
                 each entry carries its own price, length and free-access
                 signal rather than a bare URL. */
              item: {
                "@type": "Book",
                "@id": `${SITE_URL}/books/${b.slug}#book`,
                url: `${SITE_URL}/books/${b.slug}`,
                name: b.title,
                ...(b.subtitle ? { alternateName: b.subtitle } : {}),
                description: b.description || b.seoDescription || "",
                author: { "@id": `${SITE_URL}/#person` },
                inLanguage: b.language || "en",
                ...(b.pages ? { numberOfPages: b.pages } : {}),
                bookFormat: "https://schema.org/EBook",
                isAccessibleForFree: true,
                ...(b.topic ? { about: b.topic } : {}),
                ...(b.level ? { educationalLevel: b.level } : {}),
                ...(b.coverImage ? { image: b.coverImage } : {}),
                ...(b.publishedAt ? { datePublished: b.publishedAt } : {}),
                /* price 0, stated. Google shows a price on book results, and
                   an absent one renders as "unknown" next to paid competitors
                   rather than as "free". The struck-through list price is NOT
                   modelled — `price` means what the buyer pays, and that is
                   zero; putting the anchor figure here would be a false price
                   claim. */
                offers: {
                  "@type": "Offer",
                  price: 0,
                  priceCurrency: b.currency || "INR",
                  availability: "https://schema.org/InStock",
                  url: `${SITE_URL}/books/${b.slug}`,
                },
              },
            })),
          }]
        : []),
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Books", path: "/books" },
      ]),
      faqLd(faq),
    ],
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* ── Head ──────────────────────────────────────────────────────── */}
      <header className="bs-wrap bs-head-top">
        <nav className="bs-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">·</span>
          <span>Books</span>
        </nav>

        <div className="bs-rail-thick" style={{ marginTop: 16 }} />
        <div className="bs-dateline">
          <span>Free technical books</span>
          <span>Read online · No signup</span>
          <span className="bs-live">
            {books.length} book{books.length === 1 ? "" : "s"}
            {totalPages ? ` · ${totalPages} pages` : ""}
          </span>
        </div>
        <div className="bs-rail-thin" />

        <div className="bs-head-body">
          <div className="bs-split bs-split--head">
            <div>
              <p className="bs-kicker">Free books · No paywall</p>
              {/*
                The H1 carries the query, not the section name. "Books" is a
                label; "Free programming books you can read online" is the
                sentence a person searches for, and it is the same claim the
                <title> and the CollectionPage `name` make — when those three
                drift apart the page tells Google three different things about
                itself.
              */}
              <h1 className="bs-h1 bs-mt-2" style={{ maxWidth: "17ch" }}>
                Free programming books, read online.
              </h1>
              <p className="bs-lede bs-mt-4" style={{ maxWidth: "58ch" }}>
                Full-length technical books for developers — written from production
                experience, not documentation summaries. Every chapter is a public
                page: no paywall, no account, no trial. Want a copy to keep? One
                confirmed email gets you the printable edition.
              </p>
              <div className="bs-tags bs-mt-4" style={{ gap: 8 }}>
                <span className="bs-tag bs-tag--spot">100% free to read</span>
                <span className="bs-tag bs-tag--outline">No signup</span>
                <span className="bs-tag bs-tag--outline">Printable copy by email</span>
              </div>
            </div>
            <div>
              {books.length > 0 && (
                <ShelfFigure
                  books={books.map((b) => ({
                    title: b.title, pages: b.pages || 0, chapters: b.chapters || 0,
                  }))}
                  totalPages={totalPages}
                  totalWords={totalWords}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── The answer block ─────────────────────────────────────────────
          First substantive passage on the page and deliberately self-contained:
          this is the chunk an answer engine lifts when someone asks "where can
          I read free programming books", so it has to make sense with no
          surrounding context, because that is how it will be quoted. */}
      {books.length > 0 && (
        <section className="bs-wrap" style={{ paddingTop: 46 }}>
          <div style={{ paddingLeft: 20, borderLeft: "2px solid var(--spot)", maxWidth: "74ch" }}>
            <p className="bs-lede" style={{ margin: 0 }}>
              {PERSONAL_INFO.fullName} publishes {books.length} free technical book
              {books.length === 1 ? "" : "s"} — {totalChapters} chapters and roughly{" "}
              {totalPages} printed pages on{" "}
              {books.map((b) => b.topic || b.title).join(", ")} — readable in full at
              officialdeepak.in/books with no paywall, no account and no trial. Each
              chapter is an ordinary public web page; a printable single-file copy of
              any book is available after confirming an email address.
            </p>
          </div>
        </section>
      )}

      {/* ── The shelf ─────────────────────────────────────────────────── */}
      <section className="bs-wrap bs-section--tight" id="all-books" style={{ paddingTop: 54 }}>
        <p className="bs-list-head">
          {books.length === 1 ? "The book" : "All books"}
        </p>

        {books.length === 0 ? (
          <p className="bs-quiet bs-mt-5" style={{ fontSize: 16 }}>
            The first book is being written. In the meantime, the{" "}
            <Link href="/blog" className="bs-link-plain" style={{ textDecoration: "underline" }}>
              engineering blog
            </Link>{" "}
            has the same material in article form.
          </p>
        ) : (
          <ul className="bkx-shelf bs-mt-4">
            {books.map((b, i) => {
              const href = `/books/${b.slug}`;
              const first = b.toc[0];
              /* The row's own chapter count comes from the table of contents when
                 there is one. `chapters` is a rollup column and it can sit one
                 ahead of the chapters that actually exist after a resumed run —
                 see migrations/books_chapter_drift_backfill.sql. Claiming a
                 chapter the reader cannot open is the worse error. */
              const chapterCount = b.toc.length || b.chapters;
              const hours = readingTime(b.wordCount || 0);

              return (
                <li key={b.id} className="bkx-item">
                  <article className="bkx-card">
                    {/* The cover links too. It is the largest target on the row,
                        and a reader who scans covers should not have to travel
                        back to the title to act on one. aria-hidden because the
                        title link beside it says the same thing — two links to
                        one destination read as two items to a screen reader. */}
                    <Link href={href} className="bkx-cover" tabIndex={-1} aria-hidden="true">
                      <span className="bkx-cover-emoji">{b.coverEmoji || "📘"}</span>
                      {b.level && <span className="bkx-cover-tag">{b.level}</span>}
                    </Link>

                    <div style={{ minWidth: 0 }}>
                      <p className="bs-eyebrow">
                        {[b.topic || "Technical", b.codeLanguage, cap(b.level)]
                          .filter(Boolean).join(" · ")}
                      </p>

                      <h2 className="bkx-title">
                        <Link href={href} className="bs-link-plain">{b.title}</Link>
                      </h2>
                      {b.subtitle && <p className="bkx-subtitle">{b.subtitle}</p>}
                      {/* Some books carry only a seoDescription — the admin form
                          treats the two as interchangeable, so the card must too, or
                          a perfectly good blurb goes unrendered. */}
                      {(b.description || b.seoDescription) && (
                        <p className="bkx-desc">{b.description || b.seoDescription}</p>
                      )}

                      {b.outcomes?.length > 0 && (
                        <>
                          <p className="bs-eyebrow" style={{ marginTop: 18 }}>What you will learn</p>
                          <ul className="bkx-outcomes">
                            {b.outcomes.slice(0, OUTCOME_LINES).map((o, k) => (
                              <li key={k} className="bkx-outcome"><span>{o}</span></li>
                            ))}
                          </ul>
                        </>
                      )}

                      {/* The facts strip. Each fact its own element so the row
                          reflows on a phone instead of truncating. */}
                      <p className="bkx-meta">
                        <span><strong>{chapterCount}</strong> chapters</span>
                        <span><strong>{b.pages}</strong> pages</span>
                        {b.wordCount > 0 && <span><strong>{b.wordCount.toLocaleString("en-IN")}</strong> words</span>}
                        {hours && <span>{hours}</span>}
                        <ViewCountText views={b.views ?? 0} label="readers" withIcon={false} />
                        <PriceTag listPricePaise={b.listPricePaise} priceLabel={b.priceLabel}
                                  currency={b.currency} size="sm" />
                      </p>

                      <div className="bkx-actions">
                        {first ? (
                          <Link href={`${href}/${first.ordinal}`} className="bs-btn bs-btn--solid">
                            Start reading — free
                          </Link>
                        ) : (
                          <Link href={href} className="bs-btn bs-btn--solid">Open the book</Link>
                        )}
                        <Link href={href} className="bs-link">
                          Contents &amp; sample <IconArrowRight size={15} />
                        </Link>
                      </div>

                      {/* The chapter rail — the reason this page exists. Each
                          link is an indexable page of prose that is otherwise
                          three clicks deep, and a reader who came for one
                          specific subject can jump straight to it. */}
                      {b.toc.length > 0 && (
                        <nav className="bkx-chapters" aria-label={`Chapters of ${b.title}`}>
                          <p className="bs-eyebrow">Jump into a chapter</p>
                          <ul className="bkx-chapter-list">
                            {b.toc.slice(0, CHAPTER_LINKS).map((c) => (
                              <li key={c.ordinal}>
                                <Link href={`${href}/${c.ordinal}`} className="bkx-chapter">
                                  <span className="bkx-chapter-num">{String(c.ordinal).padStart(2, "0")}</span>
                                  <span>{c.heading}</span>
                                </Link>
                              </li>
                            ))}
                            {b.toc.length > CHAPTER_LINKS && (
                              <li>
                                <Link href={href} className="bkx-chapter">
                                  + {b.toc.length - CHAPTER_LINKS} more chapters
                                </Link>
                              </li>
                            )}
                          </ul>
                        </nav>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Comparison table ────────────────────────────────────────────
          Two books or more only: a one-row comparison compares nothing. An
          answer engine will quote a table long before it quotes three
          paragraphs carrying the same numbers, and a reader deciding between
          books wants exactly these five columns side by side. */}
      {books.length > 1 && (
        <section className="bs-wrap bs-section--tight" style={{ paddingTop: 56 }} aria-labelledby="compare">
          <p className="bs-list-head" id="compare">Every book at a glance</p>
          <div className="bkx-table-scroll">
            <table className="bkx-table">
              <caption className="sr-only">
                Free technical books by {PERSONAL_INFO.fullName}, with length, level and price.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Book</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Level</th>
                  <th scope="col">Chapters</th>
                  <th scope="col">Pages</th>
                  <th scope="col">Reading time</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id}>
                    <th scope="row">
                      <Link href={`/books/${b.slug}`} className="bs-link-plain">{b.title}</Link>
                    </th>
                    <td>{b.topic || "—"}</td>
                    <td>{cap(b.level) || "All levels"}</td>
                    <td>{b.toc.length || b.chapters}</td>
                    <td>{b.pages}</td>
                    <td>{readingTime(b.wordCount || 0) || "—"}</td>
                    <td>
                      <PriceTag listPricePaise={b.listPricePaise} priceLabel=""
                                currency={b.currency} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────
          Visible, never an accordion. The FAQPage JSON-LD above mirrors this
          copy word for word — markup that says something the page does not is
          the fastest way to lose the rich result entirely. */}
      <section className="bs-wrap bs-section--tight" style={{ paddingTop: 56 }} aria-labelledby="faq">
        <p className="bs-list-head" id="faq">Questions about these books</p>
        <div className="bkx-faq bs-mt-4">
          {faq.map((f, i) => (
            <div key={i} className="bkx-faq-item">
              <h2 className="bkx-faq-q">{f.question}</h2>
              <p className="bkx-faq-a">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Author + onward links ───────────────────────────────────────
          A hub page that links nowhere else leaks the authority it collects.
          Same closing shape as the blog index. */}
      <section className="bs-wrap bs-section">
        <div className="bs-rail-thick" />
        <div className="bs-rail-thin" style={{ marginTop: 4 }} />
        <div style={{ paddingTop: 34, display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 340px" }}>
            <p className="bs-eyebrow">About the author</p>
            <p className="bs-h4 bs-mt-2">{PERSONAL_INFO.fullName}</p>
            <p className="bs-small bs-quiet bs-mt-1">
              {PERSONAL_INFO.title} at {PERSONAL_INFO.currentWork.company}
            </p>
            <p className="bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: "58ch" }}>
              These books come out of production work — the architectures that held up,
              the ones that did not, and the reasoning behind both. They are free
              because the reach is worth more than the cover price.
            </p>
            <Link href="/about" className="bs-link bs-mt-3">
              More about me <IconArrowRight size={15} />
            </Link>
          </div>

          <div style={{ flex: "0 1 280px" }}>
            <p className="bs-eyebrow">Shorter form</p>
            <p className="bs-mt-2" style={{ fontSize: 15, lineHeight: 1.7 }}>
              The blog covers the same ground in article length — React, Node.js, AI
              systems and architecture.
            </p>
            <Link href="/blog" className="bs-link bs-mt-3">
              Read the blog <IconArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
