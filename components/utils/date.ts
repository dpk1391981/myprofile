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