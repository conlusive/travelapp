import { describe, expect, it } from "vitest";
import { aggregateMonthly, type DailyClimate } from "./climate";

const FILL = -999;

function buildYear(year: number, value: (month: number, day: number) => [number, number, number]) {
  const daily: DailyClimate = { maxC: {}, minC: {}, precipitationMm: {} };
  const date = new Date(Date.UTC(year, 0, 1));
  while (date.getUTCFullYear() === year) {
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const key = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
    [daily.maxC[key], daily.minC[key], daily.precipitationMm[key]] = value(month, day);
    date.setUTCDate(day + 1);
  }
  return daily;
}

describe("aggregateMonthly", () => {
  it("averages temperatures and counts rain days with a 1 mm threshold", () => {
    const daily = buildYear(2025, (month, day) => [
      month,
      month - 10,
      day === 1 ? 1 : day === 2 ? 0.9 : 0,
    ]);

    const result = aggregateMonthly(daily, [2025], FILL);

    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({
      month: 1,
      avgMaxC: 1,
      avgMinC: -9,
      precipitationMm: 2,
      rainDays: 1,
    });
    expect(result[11].avgMaxC).toBe(12);
  });

  it("averages across several years, including a leap February", () => {
    const first = buildYear(2024, () => [10, 0, 1]);
    const second = buildYear(2025, () => [20, 10, 1]);
    const daily: DailyClimate = {
      maxC: { ...first.maxC, ...second.maxC },
      minC: { ...first.minC, ...second.minC },
      precipitationMm: { ...first.precipitationMm, ...second.precipitationMm },
    };

    const february = aggregateMonthly(daily, [2024, 2025], FILL)[1];

    // (29·10 + 28·20) / 57
    expect(february.avgMaxC).toBe(14.9);
    expect(february.rainDays).toBe(28.5);
  });

  it("skips fill values without lowering monthly totals", () => {
    const daily = buildYear(2025, (month, day) =>
      month === 1 && day === 5 ? [FILL, FILL, FILL] : [10, 0, 2],
    );

    const january = aggregateMonthly(daily, [2025], FILL)[0];

    expect(january.avgMaxC).toBe(10);
    expect(january.precipitationMm).toBe(62);
  });

  it("fails when too much of a month is missing", () => {
    const daily = buildYear(2025, (month, day) =>
      month === 3 && day <= 10 ? [FILL, FILL, FILL] : [10, 0, 0],
    );

    expect(() => aggregateMonthly(daily, [2025], FILL)).toThrow(/month 3/);
  });
});
