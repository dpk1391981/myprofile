import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapter, listBooks, getBook } from "@/components/utils/books-api";
import { pageMeta, breadcrumbLd } from "@/components/utils/seo";
import { SITE_URL } from "@/components/utils/site-data";
import { chapterLd } from "@/components/books/book-seo";

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

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
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

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
        <Link href="/books" className="hover:text-slate-900">Books</Link>
        <span className="mx-2">/</span>
        <Link href={`/books/${book.slug}`} className="hover:text-slate-900">{book.title}</Link>
      </nav>

      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-slate-500">
          Chapter {chapter.ordinal} of {toc.length}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {chapter.heading}
        </h1>
        {chapter.summary && (
          <p className="mt-3 text-lg leading-relaxed text-slate-600">{chapter.summary}</p>
        )}
        <p className="mt-4 text-sm text-slate-500">
          From{" "}
          <Link href={`/books/${book.slug}`} className="font-medium text-slate-900 hover:underline">
            {book.title}
          </Link>{" "}
          by {book.authorName || "Deepak Kumar"} · {chapter.wordCount.toLocaleString()} words · free to read
        </p>
      </header>

      <article
        className="prose prose-slate mt-8 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-100"
        dangerouslySetInnerHTML={{ __html: chapter.html }}
      />

      {/* ── Neighbour links ─────────────────────────────────────────────── */}
      <nav aria-label="Chapter navigation"
           className="mt-12 grid gap-3 border-t border-slate-200 pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/books/${book.slug}/${prev.ordinal}`}
                className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-400">
            <span className="text-xs text-slate-500">← Chapter {prev.ordinal}</span>
            <span className="mt-1 block font-medium text-slate-900">{prev.heading}</span>
          </Link>
        ) : <div />}
        {next && (
          <Link href={`/books/${book.slug}/${next.ordinal}`}
                className="rounded-xl border border-slate-200 p-4 text-right transition-colors hover:border-slate-400 sm:col-start-2">
            <span className="text-xs text-slate-500">Chapter {next.ordinal} →</span>
            <span className="mt-1 block font-medium text-slate-900">{next.heading}</span>
          </Link>
        )}
      </nav>

      {/* ── Download CTA — the gate, placed where intent is highest ──────
          At the END of a chapter the reader has just got value, which is the
          only moment an email request is a fair trade rather than a toll. */}
      <aside className="mt-10 rounded-2xl border border-slate-300 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Want the whole book in one file?
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          All {toc.length} chapters, {book.pages} pages, printable and yours to keep.
          Confirm an email address and it is free.
        </p>
        <Link href={`/books/${book.slug}#get`}
              className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          Get the full book
        </Link>
      </aside>

      {/* ── Full contents — every chapter links to every other ───────────
          Flat internal linking: any chapter a crawler lands on exposes the
          whole book in one hop. */}
      <section className="mt-12 border-t border-slate-200 pt-8" aria-labelledby="contents">
        <h2 id="contents" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          All chapters
        </h2>
        <ol className="mt-4 space-y-1.5">
          {toc.map((c) => (
            <li key={c.ordinal} className="flex gap-3 text-sm">
              <span className="w-5 shrink-0 tabular-nums text-slate-400">{c.ordinal}</span>
              {c.ordinal === chapter.ordinal ? (
                <span className="font-medium text-slate-900">{c.heading}</span>
              ) : (
                <Link href={`/books/${book.slug}/${c.ordinal}`}
                      className="text-slate-600 hover:text-slate-900 hover:underline">
                  {c.heading}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
