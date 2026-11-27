import { describe, expect, it } from "vitest";
import {
  SEASONAL_MONTH_ORDER,
  assessPeriod,
  averageClimate,
  parseMonth,
  parsePeriod,
  periodName,
  periodParams,
  periodQuery,
  seasonOfMonth,
} from "./period";

describe("seasons", () => {
  it("cover every month exactly once, starting with December", () => {
    expect(SEASONAL_MONTH_ORDER).toEqual([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(seasonOfMonth(12)).toBe("winter");
    expect(seasonOfMonth(9)).toBe("autumn");
    expect(() => seasonOfMonth(13)).toThrow();
  });
});

describe("parseMonth", () => {
  it.each([
    ["1", 1],
    ["12", 12],
    ["04", 4],
  ])("accepts %s", (value, month) => {
    expect(parseMonth(value)).toBe(month);
  });

  it.each([null, "", "0", "13", "-1", "1.5", "abc", "1e1"])("rejects %j", (value) => {
    expect(parseMonth(value)).toBeNull();
  });
});

describe("parsePeriod", () => {
  it("reads a month or a season", () => {
    expect(parsePeriod("7", null)).toEqual({ kind: "month", month: 7 });
    expect(parsePeriod(null, "summer")).toEqual({ kind: "season", season: "summer" });
  });

  it("prefers a valid month and ignores bad values", () => {
    expect(parsePeriod("2", "summer")).toEqual({ kind: "month", month: 2 });
    expect(parsePeriod("99", "summer")).toEqual({ kind: "season", season: "summer" });
    expect(parsePeriod("99", "monsoon")).toBeNull();
  });

  it("round-trips through the address", () => {
    for (const period of [parsePeriod("7", null), parsePeriod(null, "winter"), null]) {
      const { month, season } = periodParams(period);
      expect(parsePeriod(month === null ? null : String(month), season)).toEqual(period);
    }
    expect(periodQuery({ kind: "season", season: "spring" })).toBe("?season=spring");
    expect(periodQuery(null)).toBe("");
  });

  it("names periods", () => {
    expect(periodName({ kind: "month", month: 3 })).toBe("Березень");
    expect(periodName({ kind: "season", season: "autumn" })).toBe("Осінь");
  });
});

describe("assessPeriod", () => {
  const months = Array.from({ length: 12 }, (_, i) => ({ score: i === 11 ? 90 : i < 2 ? 60 : 10 }));

  it("uses the month score for a month", () => {
    expect(assessPeriod(months, { kind: "month", month: 12 })).toEqual({ score: 90, verdict: "ideal" });
  });

  it("averages the three months of a season, including December for winter", () => {
    expect(assessPeriod(months, { kind: "season", season: "winter" })).toEqual({
      score: 70,
      verdict: "good",
    });
  });
});

describe("averageClimate", () => {
  const climate = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    avgMaxC: i + 1,
    avgMinC: -(i + 1),
    precipitationMm: (i + 1) * 10,
    rainDays: i + 1,
  }));

  it("returns the month itself for a single month", () => {
    expect(averageClimate(climate, { kind: "month", month: 5 })).toEqual({
      avgMaxC: 5,
      avgMinC: -5,
      precipitationMm: 50,
      rainDays: 5,
    });
  });

  it("averages a season", () => {
    expect(averageClimate(climate, { kind: "season", season: "winter" })).toEqual({
      avgMaxC: 5,
      avgMinC: -5,
      precipitationMm: 50,
      rainDays: 5,
    });
  });
});
