import type { MonthlyClimate } from "./types.ts";

/** Щоденні значення за ключем YYYYMMDD (формат NASA POWER). */
export type DailySeries = Record<string, number>;

export type DailyClimate = {
  maxC: DailySeries;
  minC: DailySeries;
  precipitationMm: DailySeries;
};

const RAIN_DAY_THRESHOLD_MM = 1;
// Менше пропусків, ніж ця частка, інакше середнє за місяць ненадійне.
const MIN_COVERAGE = 0.9;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Згортає щоденні дані у 12 багаторічних середніх.
 * Кидає помилку, якщо для якогось місяця даних бракує.
 */
export function aggregateMonthly(
  daily: DailyClimate,
  years: number[],
  fillValue: number,
): MonthlyClimate[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const maxima: number[] = [];
    const minima: number[] = [];
    const rain: number[] = [];
    let expectedDays = 0;

    for (const year of years) {
      const days = daysInMonth(year, month);
      expectedDays += days;
      for (let day = 1; day <= days; day++) {
        const key = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
        const values = [daily.maxC[key], daily.minC[key], daily.precipitationMm[key]];
        if (values.some((value) => value === undefined || value === fillValue)) continue;
        maxima.push(values[0]);
        minima.push(values[1]);
        rain.push(values[2]);
      }
    }

    if (maxima.length < expectedDays * MIN_COVERAGE) {
      throw new Error(`Not enough data for month ${month}: ${maxima.length}/${expectedDays} days`);
    }

    // Середні за день × тривалість місяця: пропущені дні не занижують суму.
    const monthLength = expectedDays / years.length;
    const rainShare = rain.filter((mm) => mm >= RAIN_DAY_THRESHOLD_MM).length / rain.length;

    return {
      month,
      avgMaxC: round1(mean(maxima)),
      avgMinC: round1(mean(minima)),
      precipitationMm: Math.round(mean(rain) * monthLength),
      rainDays: round1(rainShare * monthLength),
    };
  });
}
