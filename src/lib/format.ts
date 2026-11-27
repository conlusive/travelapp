import { monthName } from "../domain/months.ts";

/** «≈ 45 хв», «≈ 2,5 год» */
export function formatVisitDuration(minutes: number): string {
  if (minutes < 60) return `≈ ${minutes} хв`;
  const hours = Math.round(minutes / 30) / 2;
  return `≈ ${String(hours).replace(".", ",")} год`;
}

/** «2026-11-27» → «листопад 2026» */
export function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  return `${monthName(month).full.toLowerCase()} ${year}`;
}

/** «+21 °C», «-3 °C», «0 °C» */
export function formatTemperature(celsius: number): string {
  const rounded = Math.round(celsius);
  return `${rounded > 0 ? "+" : ""}${rounded === 0 ? 0 : rounded} °C`;
}
