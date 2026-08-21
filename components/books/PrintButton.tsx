"use client";

import { IconPrinter } from "@tabler/icons-react";

/**
 * Save-as-PDF trigger.
 *
 * Its own tiny client component so the book page around it stays a server
 * component — the alternative, marking that page "use client", would ship every
 * chapter's markup to the browser as props for the sake of one onClick.
 *
 * window.print() rather than a generated file: the browser's own PDF export is
 * correct on every platform, keeps the text selectable and the headings
 * navigable, and needs no Chromium on the VPS. The print stylesheet on the page
 * is what makes the output look like a book.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bs-btn bs-btn--solid bs-btn--sm"
    >
      <IconPrinter size={16} />
      Save as PDF
    </button>
  );
}
