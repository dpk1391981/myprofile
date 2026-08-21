/**
 * Calculate experience duration.
 *
 * Usage:
 *   totalExperianceYears()                          → total career (Dec 2016 → now) → "9.3+ Yrs"
 *   totalExperianceYears("2025","05","14")           → current job (start → now)     → "0.8+ Yrs"
 *   totalExperianceYears("2017","09","01","2025","05","01") → past job (start → end) → "7.7 Yrs"
 */
export function totalExperianceYears(
  startYear?: string,
  startMonth?: string,
  startDay?: string,
  endYear?: string,
  endMonth?: string,
  endDay?: string
): string {
  // End date: use provided end date, or fallback to now
  const end = endYear
    ? new Date(parseInt(endYear), parseInt(endMonth || "1") - 1, parseInt(endDay || "1"))
    : new Date();

  // Start date: use provided, or fallback to career start (Dec 2016)
  const sy = startYear ? parseInt(startYear) : 2016;
  const sm = startMonth ? parseInt(startMonth) - 1 : 11; // Dec = 11
  const sd = startDay ? parseInt(startDay) : 1;
  const start = new Date(sy, sm, sd);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // Also account for day difference
  if (end.getDate() < start.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  const total = years + Math.round((months / 12) * 10) / 10;

  // If less than 1 year, show months
  if (years === 0) {
    return months <= 1 ? `1 Month` : `${months} Months`;
  }

  // For current/total career show "X.X+ Yrs", for past jobs show "X.X Yrs" (no +)
  const isCurrent = !endYear;
  return `${total.toFixed(1)}${isCurrent ? "+" : ""} Yrs`;
}
/**
 * Whole-year career length for prose — "9+", "10+", …
 *
 * totalExperianceYears() carries one decimal ("9.7+ Yrs"), which is right for a
 * stat tile and wrong in a sentence: nobody writes "9.7+ years of experience",
 * and it makes the headline a character longer for no gain. This floors to the
 * whole year, so the copy stays honest as it ages and no string anywhere needs
 * editing on an anniversary.
 */
export function careerYears(): string {
  const decimal = parseFloat(totalExperianceYears());
  return `${Math.floor(decimal) || 9}+`;
}

/* ── Publication dates ───────────────────────────────────────────────────────
 *
 * The blog publishes on IST and every date it shows is meant as an IST date.
 * Two things get that wrong on their own:
 *
 *   1. A bare "2026-08-21" is parsed by `new Date()` as UTC midnight, so a
 *      reader west of UTC sees the day before. A US visitor read every post as
 *      a day older than it is.
 *   2. A timestamp with no offset — "2026-08-21T11:04:00", which is the shape
 *      the agent API used to return — is parsed as the *viewer's* local time,
 *      so the same row rendered differently depending on who was looking.
 *
 * istStamp() forces both shapes onto +05:30; the formatters then render in
 * Asia/Kolkata so the output is the same everywhere. The API now sends the
 * offset itself (api/portfolio_routes.py `_iso`), and an input that already
 * carries one is passed through untouched — this stays for the static
 * fallback posts, which are bare dates, and so a future API regression
 * degrades to "still correct" rather than "silently 5h30m off".
 */
const IST_OFFSET = "+05:30";

export function istStamp(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00${IST_OFFSET}`;

  // Microseconds are valid but noisy, and no consumer reads past seconds.
  const trimmed = value.replace(/\.\d+/, "");
  return /(Z|[+-]\d{2}:?\d{2})$/.test(trimmed) ? trimmed : `${trimmed}${IST_OFFSET}`;
}

/** "2026-08-21T11:04:00+05:30" → "Aug 21, 2026", always as the IST day. */
export function formatISTDate(value: string): string {
  const d = new Date(istStamp(value));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Kolkata",
  });
}

/** "2026-08-21T11:04:00+05:30" → "11:04 am IST". */
export function formatISTTime(value: string): string {
  const d = new Date(istStamp(value));
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
  })} IST`;
}

/**
 * "2026-08-21T11:04:00+05:30" → "Aug 21, 2026 · 11:04 am IST".
 *
 * Falls back to the date alone when the value carries no time of day. That
 * case is real and must not be papered over: the `date` column is a bare DATE
 * and the hand-written fallback posts in portfolio-data have never had a
 * timestamp, so formatting them as a datetime would invent a publication
 * minute — and "12:00 am IST" on every older essay reads as a real claim.
 * Pass `publishedAt` when you want the time; it is the only field that has one.
 */
export function formatISTDateTime(value: string): string {
  const date = formatISTDate(value);
  if (!date || !hasTimeOfDay(value)) return date;
  return `${date} · ${formatISTTime(value)}`;
}

/** Whether a value is a full timestamp rather than a bare "2026-08-21". */
export function hasTimeOfDay(value: string): boolean {
  return Boolean(value) && /\d{2}:\d{2}/.test(value);
}
