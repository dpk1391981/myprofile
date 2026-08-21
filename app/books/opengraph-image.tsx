import { ImageResponse } from "next/og";
import { listBooks } from "@/components/utils/books-api";

/**
 * OG card for /books.
 *
 * Generated rather than a static PNG so the card always states the real number
 * of books and pages — a hand-made image goes stale the day a second book
 * publishes, and a stale share card is worse than a generic one because it
 * makes a specific false claim.
 *
 * No external fonts or images: the CSP on a shared card is unforgiving, and
 * system fonts render identically enough at this size. Everything here is
 * inline styles because Satori (what next/og uses) supports a flexbox subset
 * and nothing else — no CSS classes, no grid, no cascade.
 */
export const runtime = "nodejs";
export const alt = "Free technical books by Deepak Kumar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Regenerated hourly. The underlying list changes when a book publishes, which
// is rare, and a share card is fetched far more often than it changes.
export const revalidate = 3600;

export default async function Image() {
  const books = await listBooks();
  const pages = books.reduce((n, b) => n + (b.pages || 0), 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3f2f2",
          color: "#201e1d",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Masthead rule — the same press furniture the site uses. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 6, background: "#201e1d" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 18,
              fontSize: 22,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#0088b0",
            }}
          >
            <span>Deepak Kumar</span>
            <span style={{ color: "#201e1d", opacity: 0.55 }}>officialdeepak.in/books</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, fontWeight: 700 }}>
            Free books for developers
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              lineHeight: 1.4,
              marginTop: 22,
              color: "#201e1d",
              opacity: 0.66,
              maxWidth: 900,
            }}
          >
            Full-length technical books, free to read online. No paywall, no signup —
            every chapter is a public page.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {books.length > 0 && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                background: "#e9f8ff",
                color: "#006786",
                padding: "10px 22px",
                borderRadius: 4,
              }}
            >
              {books.length} book{books.length === 1 ? "" : "s"} · {pages} pages
            </div>
          )}
          <div style={{ display: "flex", fontSize: 26, color: "#006786", fontWeight: 700 }}>
            Free
          </div>
        </div>
      </div>
    ),
    size
  );
}
