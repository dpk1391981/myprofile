/**
 * The price anchor.
 *
 * "Free" on its own is a weak signal — a reader has no idea whether they are
 * being given something worth having. "₹499 on Amazon Kindle — free here" tells
 * them exactly what they are getting and why it is worth an email address. It is
 * the highest-leverage element on the page for conversion.
 *
 * IT ONLY RENDERS WITH A REAL PRICE BEHIND IT. `listPricePaise` defaults to 0
 * and the admin form says plainly what it is for: a struck-through figure the
 * book was never actually offered at is a misleading price representation under
 * India's CCPA dark-pattern guidelines, and it breaches Amazon's list-price
 * policy too. `priceLabel` is what keeps it honest — naming where the price
 * applies makes the claim checkable, which is also what makes it persuasive.
 * An unverifiable number reads as a marketing trick and costs trust.
 */
export default function PriceTag({
  listPricePaise,
  priceLabel,
  currency = "INR",
  size = "md",
}: {
  listPricePaise: number;
  priceLabel?: string;
  currency?: string;
  size?: "sm" | "md" | "lg";
}) {
  const free = (
    <span
      style={{
        fontWeight: 700,
        color: "var(--spot-deep)",
        fontSize: size === "lg" ? 26 : size === "md" ? 19 : 15,
        letterSpacing: "-.01em",
      }}
    >
      Free
    </span>
  );

  // No anchor price set — say "Free" and nothing more. Never invent a number.
  if (!listPricePaise || listPricePaise <= 0) return free;

  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(listPricePaise / 100);

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", flexWrap: "wrap", gap: 9 }}>
      <s
        aria-label={`List price ${amount}${priceLabel ? ` ${priceLabel}` : ""}`}
        style={{
          color: "var(--quiet)",
          textDecorationThickness: "1.5px",
          fontSize: size === "lg" ? 19 : size === "md" ? 16 : 14,
        }}
      >
        {amount}
      </s>
      {free}
      {priceLabel && (
        <span style={{ color: "var(--quiet)", fontSize: size === "lg" ? 14 : 13 }}>
          {priceLabel}
        </span>
      )}
    </span>
  );
}
