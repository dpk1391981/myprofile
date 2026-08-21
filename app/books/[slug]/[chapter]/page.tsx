import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapter, listBooks, getBook } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd } from "@/components/utils/seo";
import { SITE_URL } from "@/components/utils/site-data";
import { chapterLd } from "@/components/books/book-seo";
import { prepareChapter } from "@/components/books/chapter-html";
import ReadingProgress from "@/components/books/ReadingProgress";

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
 * Statically generated per chapter and revalidated every 10 minutes.
 */
export const revalidate = 600;

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

  return (
    <main className="bk-shell" style={{ paddingTop: 44, paddingBottom: 80 }}>
      <ReadingProgress />

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

      <nav aria-label="Breadcrumb" className="bs-small bs-quiet" style={{ marginBottom: 30 }}>
        <Link href="/books" className="bs-link-plain">Books</Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <Link href={`/books/${book.slug}`} className="bs-link-plain">{book.title}</Link>
      </nav>

      {/* ── Chapter opener ────────────────────────────────────────────────── */}
      <header>
        <p className="bk-chapter-num">
          Chapter {chapter.ordinal} of {toc.length}
        </p>
        <h1 className="bk-chapter-title">{chapter.heading}</h1>
        {chapter.summary && <p className="bk-chapter-standfirst">{chapter.summary}</p>}
        <p className="bk-chapter-meta">
          From{" "}
          <Link href={`/books/${book.slug}`} className="bs-link">{book.title}</Link>
          {" "}by {book.authorName || "Deepak Kumar"} · {chapter.wordCount.toLocaleString()} words · free to read
        </p>
      </header>

      <div className="bs-rail-thin" style={{ margin: "30px 0 38px" }} />

      {/* ── In this chapter ───────────────────────────────────────────────
          Only when there is enough structure for it to help. A rail listing two
          headings is furniture, not navigation. */}
      {headings.length >= 3 && (
        <nav aria-label="In this chapter"
             style={{ marginBottom: 40, padding: "18px 20px", background: "var(--surface)", borderRadius: 2 }}>
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

      {/* ── Previous / next ───────────────────────────────────────────────── */}
      <nav aria-label="Chapter navigation" className="bk-pager" style={{ marginTop: 56 }}>
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

      {/* ── The gate, at the end of the chapter ───────────────────────────
          Placed here because this is the moment the reader has just been given
          something. An email asked for before that is a toll; asked for after,
          it is a fair trade. */}
      <aside style={{ marginTop: 48, padding: "24px 26px", border: "1px solid var(--rule)", borderRadius: 2 }}>
        <p className="bs-eyebrow">Free book</p>
        <p className="bs-h4" style={{ margin: "8px 0 6px", fontSize: 19 }}>
          Want all {toc.length} chapters in one file?
        </p>
        <p className="bs-small bs-quiet" style={{ margin: "0 0 16px" }}>
          {book.pages} pages, printable and yours to keep. One confirmed email, no payment.
        </p>
        <Link href={`/books/${book.slug}#get`} className="bs-btn bs-btn--solid bs-btn--sm">
          Get the full book
        </Link>
      </aside>

      {/* ── All chapters ──────────────────────────────────────────────────
          Flat internal linking: any chapter a crawler or a reader lands on
          exposes the whole book in one hop. */}
      <section aria-labelledby="contents" style={{ marginTop: 56 }}>
        <div className="bs-rail-thin" style={{ marginBottom: 20 }} />
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
  );
}
