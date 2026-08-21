"use client";

/**
 * The reading furniture around a whole book: progress, running head, contents.
 *
 * ── WHAT MAKES A WEB PAGE FEEL LIKE A BOOK ───────────────────────────────────
 * Not decoration. Three things a physical book gives you for free and a long
 * scroll does not:
 *
 *   1. YOU KNOW WHERE YOU ARE. A book is a thickness in your hand; the progress
 *      bar and the "chapter 4 of 11" running head are the screen equivalent.
 *   2. YOU CAN GET ANYWHERE. You riffle a book. The contents drawer is reachable
 *      from any point in the text, not only by scrolling back to the top — which
 *      is what a table of contents printed once at the front amounts to online.
 *   3. YOU KNOW WHICH CHAPTER YOU ARE IN. Physical books print it in the running
 *      head of every spread, because readers look up and lose their place.
 *
 * The chapter this is currently "in" is tracked with an IntersectionObserver
 * rather than a scroll handler: the browser computes it off the main thread and
 * reports only on change, where a scroll listener would run on every frame of
 * every scroll to recompute something that changes a dozen times per book.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconList, IconX, IconPrinter, IconArrowUp, IconArrowLeft } from "@tabler/icons-react";

export type TocEntry = { ordinal: number; heading: string };

type Props = {
  title: string;
  toc: TocEntry[];
  /** The book's own page. This reader replaces the site chrome, so without a
   *  link here the only way out is the browser's back button. */
  slug: string;
};

export default function ReaderChrome({ title, toc, slug }: Props) {
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // ── Progress ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function update() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(100, (doc.scrollTop / total) * 100) : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // ── Which chapter is on screen ────────────────────────────────────────────
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // The topmost section currently intersecting wins. Taking the LAST
        // entry instead would flip the running head to the next chapter the
        // moment its heading peeked over the bottom edge, while the reader was
        // still three paragraphs into the previous one.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          setCurrent(Number((visible[0].target as HTMLElement).dataset.chapter));
        }
      },
      // A band across the upper third: a chapter counts as "the one you are
      // reading" when its body occupies where your eyes actually are.
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // ── Drawer: escape to close, and do not scroll the book behind it ─────────
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    // Focus moves into the drawer so a keyboard reader is not left behind on
    // the toggle with the panel open in front of them.
    drawerRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentEntry = toc.find((t) => t.ordinal === current);

  return (
    <>
      {/* The bar is `no-print`: none of it belongs in the PDF. */}
      <div className="no-print bk-readerbar">
        <div className="bk-readerbar-inner">
          <button
            type="button"
            className="bk-readerbar-btn"
            onClick={() => setOpen(true)}
            aria-label="Open contents"
            aria-expanded={open}
          >
            <IconList size={17} />
            <span className="bk-readerbar-btn-label">Contents</span>
          </button>

          {/* The running head. Falls back to the book's title before the first
              chapter scrolls into view, so the bar is never empty. */}
          <p className="bk-runninghead" title={currentEntry?.heading || title}>
            {currentEntry ? (
              <>
                <span className="bk-runninghead-num">
                  {currentEntry.ordinal} / {toc.length}
                </span>
                <span className="bk-runninghead-sep" aria-hidden="true">·</span>
                <span className="bk-runninghead-title">{currentEntry.heading}</span>
              </>
            ) : (
              <span className="bk-runninghead-title">{title}</span>
            )}
          </p>

          <div className="bk-readerbar-actions">
            <button
              type="button"
              className="bk-readerbar-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to the start"
            >
              <IconArrowUp size={17} />
            </button>
            <button
              type="button"
              className="bk-readerbar-btn"
              onClick={() => window.print()}
              aria-label="Save as PDF"
            >
              <IconPrinter size={17} />
              <span className="bk-readerbar-btn-label">PDF</span>
            </button>
          </div>
        </div>

        {/* Transform, not width: it animates on the compositor and never
            triggers layout on a page this long. */}
        <div className="bk-readerbar-progress" role="progressbar"
             aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}
             aria-label="Reading progress">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>

      {/* ── Contents drawer ──────────────────────────────────────────────── */}
      <div
        className={`no-print bk-drawer-scrim${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        tabIndex={-1}
        className={`no-print bk-drawer${open ? " is-open" : ""}`}
        aria-label="Contents"
        aria-hidden={!open}
      >
        <div className="bk-drawer-head">
          <p className="bs-eyebrow" style={{ margin: 0 }}>Contents</p>
          <button
            type="button"
            className="bk-readerbar-btn"
            onClick={() => setOpen(false)}
            aria-label="Close contents"
          >
            <IconX size={17} />
          </button>
        </div>

        <ol className="bk-drawer-list">
          {toc.map((c) => (
            <li key={c.ordinal}>
              <a
                href={`#chapter-${c.ordinal}`}
                onClick={() => setOpen(false)}
                className={`bk-drawer-link${c.ordinal === current ? " is-current" : ""}`}
                aria-current={c.ordinal === current ? "true" : undefined}
              >
                <span className="bk-drawer-num">{c.ordinal}</span>
                <span>{c.heading}</span>
              </a>
            </li>
          ))}
        </ol>

        <div className="bk-drawer-foot">
          <Link href={`/books/${slug}`} className="bk-drawer-back">
            <IconArrowLeft size={15} /> Back to the book page
          </Link>
        </div>
      </aside>
    </>
  );
}
