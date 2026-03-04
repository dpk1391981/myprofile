/**
 * Calculate total experience in "X+ Yrs" format.
 * Same logic as the original `totalExperianceYears`.
 *
 * If no arguments → uses PERSONAL_INFO.careerStartDate
 * If arguments   → calculates from given start date
 */
export function totalExperianceYears(
  startYear?: string,
  startMonth?: string,
  startDay?: string
): string {
  const now = new Date();

  const y = startYear ? parseInt(startYear) : 2016;
  const m = startMonth ? parseInt(startMonth) - 1 : 11; // Dec = 11
  const d = startDay ? parseInt(startDay) : 1;

  const start = new Date(y, m, d);
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const decimal = Math.round((months / 12) * 10) / 10;
  const total = years + decimal;

  return `${total.toFixed(1)}+ Yrs`;
}