"use client";

/**
 * The reader's own settings on a chapter page: text size, paper colour, and
 * "Save as PDF". All three are per reader and stored in this browser only.
 *
 * Settings live as data attributes on #bk-desk (data-size, data-paper), which
 * the stylesheet reads. An inline script in the page applies the saved values
 * BEFORE first paint (READER_INIT_SCRIPT in reader-prefs.ts), so a reader who chose sepia never
 * sees a flash of white on every chapter; this component only changes them.
 *
 * SAVE AS PDF is the email ask, not a print button. The whole book is free to
 * read here; the printable copy is what the signup is for. So a reader who has
 * not confirmed an email gets the signup dialog (name, email, mobile), and one
 * who has gets the browser's print dialog straight away. Ctrl+P still works for
 * anyone — this is an offer, not DRM.
 */

import { useEffect, useRef, useState } from "react";
import { IconMinus, IconPlus, IconPrinter } from "@tabler/icons-react";
import { hasBookAccess, openBookOffer } from "@/components/books/BookOfferModal";
import { READER_KEY, READER_SIZES } from "@/components/books/reader-prefs";

const SIZES = READER_SIZES;
const PAPERS = [
  { id: "", label: "Auto", title: "Follow the site's light/dark setting" },
  { id: "paper", label: "Paper", title: "White paper" },
  { id: "sepia", label: "Sepia", title: "Warm paper, easier for long reading" },
  { id: "dark", label: "Dark", title: "Light text on dark" },
] as const;

type Prefs = { size: number; paper: string };

function readPrefs(): Prefs {
  try {
    const p = JSON.parse(window.localStorage.getItem(READER_KEY) || "{}");
    return {
      size: Number.isInteger(p.size) && p.size >= 0 && p.size < SIZES ? p.size : 2,
      paper: typeof p.paper === "string" ? p.paper : "",
    };
  } catch {
    return { size: 2, paper: "" };
  }
}

function apply(p: Prefs) {
  const desk = document.getElementById("bk-desk");
  if (desk) {
    desk.dataset.size = String(p.size);
    if (p.paper) desk.dataset.paper = p.paper;
    else delete desk.dataset.paper;
  }
  try {
    window.localStorage.setItem(READER_KEY, JSON.stringify(p));
  } catch {
    /* private mode — the setting still applies to this page */
  }
}

export default function ReaderControls() {
  const [prefs, setPrefs] = useState<Prefs>({ size: 2, paper: "" });
  // Phones only: the settings live behind one "Aa" button so the pinned bar is
  // a single row. On wider screens the panel is always shown inline (CSS).
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => setPrefs(readPrefs()), []);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape"
          : !wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Scrolling on means reading on — get out of the way.
    const onScroll = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  function update(next: Partial<Prefs>) {
    const p = { ...prefs, ...next };
    setPrefs(p);
    apply(p);
  }

  function savePdf() {
    if (hasBookAccess()) window.print();
    else openBookOffer("pdf");
  }

  return (
    <div className="bkp-tools" ref={wrapRef}>
      <button type="button" className="bkp-tool bkp-tools-toggle"
              aria-expanded={open} aria-controls="bkp-tools-panel"
              onClick={() => setOpen((v) => !v)}>
        <span aria-hidden="true" className="bkp-tools-toggle-aa">Aa</span>
        <span>Text &amp; colour</span>
      </button>

      <div id="bkp-tools-panel" role="group" aria-label="Reading settings"
           className={`bkp-tools-panel${open ? " is-open" : ""}`}>
        <div className="bkp-tool-group" role="group" aria-label="Text size">
          <button type="button" className="bkp-tool" onClick={() => update({ size: Math.max(0, prefs.size - 1) })}
                  disabled={prefs.size === 0} aria-label="Smaller text" title="Smaller text">
            <span aria-hidden="true" style={{ fontSize: 12 }}>A</span><IconMinus size={11} />
          </button>
          <button type="button" className="bkp-tool" onClick={() => update({ size: Math.min(SIZES - 1, prefs.size + 1) })}
                  disabled={prefs.size === SIZES - 1} aria-label="Larger text" title="Larger text">
            <span aria-hidden="true" style={{ fontSize: 16 }}>A</span><IconPlus size={11} />
          </button>
        </div>

        <div className="bkp-tool-group" role="radiogroup" aria-label="Page colour">
          {PAPERS.map((p) => (
            <button key={p.id || "auto"} type="button" role="radio" aria-checked={prefs.paper === p.id}
                    title={p.title} onClick={() => update({ paper: p.id })}
                    className={`bkp-swatch bkp-swatch--${p.id || "auto"}${prefs.paper === p.id ? " is-on" : ""}`}>
              <span className="bkp-swatch-dot" aria-hidden="true" />
              <span className="bkp-swatch-label">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="bkp-tool bkp-tool--pdf" onClick={savePdf} title="Save this book as a PDF">
        <IconPrinter size={15} /> <span>Save as PDF</span>
      </button>
    </div>
  );
}

/**
 * "11 min left in this chapter", from how far through the article the reader
 * is — not the page, which also contains the contents and the footer.
 */
export function TimeLeft({ words }: { words: number }) {
  const [left, setLeft] = useState<number | null>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".bkp-sheet .bk-prose");
    if (!article) return;
    function update() {
      const r = article!.getBoundingClientRect();
      const read = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height)));
      setPct(read);
      setLeft(Math.max(0, Math.ceil((words * (1 - read)) / 230)));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [words]);

  if (left === null) return null;
  return (
    <div className="bkp-timeleft" aria-live="off">
      <div className="bkp-timeleft-bar"><span style={{ transform: `scaleX(${pct})` }} /></div>
      <p>{pct >= 0.98 ? "Chapter finished" : left <= 1 ? "About a minute left" : `${left} min left in this chapter`}</p>
    </div>
  );
}
