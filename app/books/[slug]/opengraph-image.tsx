import { ImageResponse } from "next/og";
import { getBook } from "@/components/utils/books-api";

/**
 * OG card for one book.
 *
 * Carries the things that decide whether someone clicks a shared link: the
 * title, who it is for, how long it is, and the price. The price is the whole
 * point — most results for "<topic> book" are paid, so a card that says
 * "₹499 free" out-competes one that says nothing, and it does the work before
 * the reader has loaded the page.
 *
 * The strike-through only appears when a real list price is set. Same rule as
 * PriceTag: an invented anchor price is a misleading price representation, and
 * on a share card it travels further than on the page.
 */
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;
export const alt = "Free technical book by Deepak Kumar";

export default async function Image({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);

  // A missing book still needs a card — a share of a 404 should not render a
  // broken image.
  const title = book?.title ?? "Book";
  const subtitle = book?.subtitle ?? "";
  const audience = book?.audience ?? "";

  /*
    Price WITHOUT Intl currency formatting.

    Intl produces "₹450", and the rupee sign (U+20B9) is not in any font Satori
    can reach here, so it rendered as a tofu box — "□450 Free", which reads as a
    broken image rather than a discount. A share card is the one surface where a
    rendering fault travels furthest, so this spells the currency in ASCII
    instead. The page itself keeps the proper symbol: browsers have the glyph.

    Embedding a font with ₹ would also work, but it means fetching or bundling a
    file on every card render for one character.
  */
  const listPrice = book?.listPricePaise ?? 0;
  const CURRENCY_PREFIX: Record<string, string> = { INR: "Rs ", USD: "$", EUR: "EUR ", GBP: "GBP " };
  const cur = (book?.currency || "INR").toUpperCase();
  const priceText =
    listPrice > 0
      ? `${CURRENCY_PREFIX[cur] ?? cur + " "}${Math.round(listPrice / 100).toLocaleString("en-IN")}`
      : "";

  // Long titles have to shrink or they overflow the card.
  const titleSize = title.length > 46 ? 60 : title.length > 30 ? 72 : 84;

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
          padding: "56px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 6, background: "#201e1d" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 18,
              fontSize: 21,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#0088b0",
            }}
          >
            {/* No emoji: Satori has no colour-emoji font here, so the book
                glyph rendered as a plain blue square. */}
            <span>Deepak Kumar</span>
            <span style={{ color: "#201e1d", opacity: 0.45 }}>Free book</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: titleSize, lineHeight: 1.04, fontWeight: 700 }}>
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.35,
                marginTop: 18,
                opacity: 0.62,
                maxWidth: 960,
              }}
            >
              {subtitle.length > 110 ? subtitle.slice(0, 107) + "…" : subtitle}
            </div>
          )}
          {audience && (
            <div style={{ display: "flex", fontSize: 24, marginTop: 16, opacity: 0.5 }}>
              For {audience.length > 88 ? audience.slice(0, 85) + "…" : audience}
            </div>
          )}
        </div>

        {/* The conversion line. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 25,
              background: "#e9f8ff",
              color: "#006786",
              padding: "10px 22px",
              borderRadius: 4,
            }}
          >
            {book?.chapters ?? 0} chapters · {book?.pages ?? 0} pages
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {priceText && (
              <span
                style={{
                  display: "flex",
                  fontSize: 27,
                  color: "#201e1d",
                  opacity: 0.42,
                  textDecoration: "line-through",
                }}
              >
                {priceText}
              </span>
            )}
            <span style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#006786" }}>
              Free
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 22, opacity: 0.45 }}>
            Read online · no signup
          </div>
        </div>
      </div>
    ),
    size
  );
}
