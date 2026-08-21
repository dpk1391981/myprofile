"use client";

import { useEffect, useState } from "react";

/**
 * The hairline progress bar at the top of a chapter.
 *
 * Small thing, but it is what makes a long page feel like a chapter with an end
 * rather than an endless scroll — the single cheapest signal that this is a book
 * and not a web page.
 *
 * Transform rather than width so it animates on the compositor and never
 * triggers layout; the scroll handler is passive for the same reason.
 */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setPct(scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="bk-progress"
      style={{ transform: `scaleX(${pct})` }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
