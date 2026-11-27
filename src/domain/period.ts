// Період поїздки: один місяць або пора року. Спільний для карти, сторінок і порівняння.
import { monthName } from "./months.ts";
import { verdictFor, type Verdict } from "./season.ts";
import type { MonthlyClimate } from "./types.ts";

export const SEASONS = [
  { id: "winter", name: "Зима", when: "Взимку", months: [12, 1, 2] },
  { id: "spring", name: "Весна", when: "Навесні", months: [3, 4, 5] },
  { id: "summer", name: "Літо", when: "Влітку", months: [6, 7, 8] },
  { id: "autumn", name: "Осінь", when: "Восени", months: [9, 10, 11] },
] as const;

export type SeasonId = (typeof SEASONS)[number]["id"];

/** Місяці в порядку пір року: грудень стоїть перед січнем, щоб зима була цілою. */
export const SEASONAL_MONTH_ORDER: number[] = SEASONS.flatMap((season) => [...season.months]);

export type Period =
  | { kind: "month"; month: number }
  | { kind: "season"; season: SeasonId }
  | null;

export function getSeasonInfo(id: SeasonId) {
  return SEASONS.find((season) => season.id === id)!;
}

export function seasonOfMonth(month: number): SeasonId {
  const found = SEASONS.find((season) => (season.months as readonly number[]).includes(month));
  if (!found) throw new Error(`Invalid month: ${month}`);
  return found.id;
}

/** 1–12 або null для відсутнього чи некоректного значення з адреси. */
export function parseMonth(value: string | null): number | null {
  if (!value || !/^\d{1,2}$/.test(value)) return null;
  const month = Number(value);
  return month >= 1 && month <= 12 ? month : null;
}

/** Значення з адреси; якщо задано і місяць, і пору року, перемагає точніший місяць. */
export function parsePeriod(month: string | null, season: string | null): Period {
  const parsed = parseMonth(month);
  if (parsed !== null) return { kind: "month", month: parsed };
  const found = SEASONS.find((item) => item.id === season);
  return found ? { kind: "season", season: found.id } : null;
}

/** Параметри адреси: незадіяний параметр прибирається. */
export function periodParams(period: Period): { month: number | null; season: SeasonId | null } {
  return {
    month: period?.kind === "month" ? period.month : null,
    season: period?.kind === "season" ? period.season : null,
  };
}

export function periodQuery(period: Period): string {
  if (!period) return "";
  return period.kind === "month" ? `?month=${period.month}` : `?season=${period.season}`;
}

export function periodMonths(period: NonNullable<Period>): number[] {
  return period.kind === "month" ? [period.month] : [...getSeasonInfo(period.season).months];
}

export function periodName(period: NonNullable<Period>): string {
  return period.kind === "month" ? monthName(period.month).full : getSeasonInfo(period.season).name;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** months — оцінки за місяцями 1–12. Для пори року це середнє трьох місяців. */
export function assessPeriod(
  months: { score: number }[],
  period: NonNullable<Period>,
): { score: number; verdict: Verdict } {
  const score = Math.round(mean(periodMonths(period).map((month) => months[month - 1].score)));
  return { score, verdict: verdictFor(score) };
}

/** Середні показники за місяць у межах періоду. climate — місяці 1–12. */
export function averageClimate(
  climate: MonthlyClimate[],
  period: NonNullable<Period>,
): Omit<MonthlyClimate, "month"> {
  const selected = periodMonths(period).map((month) => climate[month - 1]);
  const average = (pick: (item: MonthlyClimate) => number) =>
    Math.round(mean(selected.map(pick)) * 10) / 10;

  return {
    avgMaxC: average((item) => item.avgMaxC),
    avgMinC: average((item) => item.avgMinC),
    precipitationMm: Math.round(average((item) => item.precipitationMm)),
    rainDays: average((item) => item.rainDays),
  };
}
