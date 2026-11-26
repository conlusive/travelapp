import { describe, expect, it } from "vitest";
import { assessSeason, bestMonths, verdictFor, weatherScore } from "./season";

describe("bestMonths", () => {
  const season = (scores: number[]) =>
    scores.map((score, i) => ({ score, verdict: verdictFor(score), climate: { month: i + 1 } }));

  it("picks the highest scores and returns them in calendar order", () => {
    expect(bestMonths(season([60, 90, 80, 100, 70]))).toEqual([2, 3, 4]);
  });

  it("prefers earlier months on equal scores", () => {
    expect(bestMonths(season([90, 90, 90, 90]), 2)).toEqual([1, 2]);
  });

  it("returns nothing when no month is at least good", () => {
    expect(bestMonths(season([54, 40, 10]))).toEqual([]);
  });
});

describe("weatherScore", () => {
  it("gives 100 for comfortable and dry months, including both range edges", () => {
    expect(weatherScore({ avgMaxC: 20, rainDays: 0 })).toBe(100);
    expect(weatherScore({ avgMaxC: 27, rainDays: 4 })).toBe(100);
  });

  it("gives 0 for extreme temperature combined with constant rain", () => {
    expect(weatherScore({ avgMaxC: 5, rainDays: 18 })).toBe(0);
    expect(weatherScore({ avgMaxC: 45, rainDays: 30 })).toBe(0);
    expect(weatherScore({ avgMaxC: -10, rainDays: 25 })).toBe(0);
  });

  it("falls linearly between the ideal range and the limits", () => {
    // температура 12.5 °C — половина шляху від 5 до 20; дощ 11 днів — половина від 4 до 18
    expect(weatherScore({ avgMaxC: 12.5, rainDays: 11 })).toBe(50);
    expect(weatherScore({ avgMaxC: 32.5, rainDays: 11 })).toBe(50);
  });

  it("weights temperature at 70% and rain at 30%", () => {
    expect(weatherScore({ avgMaxC: 41, rainDays: 0 })).toBe(30);
    expect(weatherScore({ avgMaxC: 24, rainDays: 25 })).toBe(70);
  });
});

describe("verdictFor", () => {
  it.each([
    [100, "ideal"],
    [75, "ideal"],
    [74, "good"],
    [55, "good"],
    [54, "meh"],
    [35, "meh"],
    [34, "avoid"],
    [0, "avoid"],
  ])("maps %i to %s", (score, verdict) => {
    expect(verdictFor(score)).toBe(verdict);
  });
});

describe("assessSeason", () => {
  it("applies the 40/30/30 weights when all inputs exist", () => {
    const result = assessSeason({ weather: 100, crowd: 50, price: 0 });
    expect(result).toEqual({ score: 55, verdict: "good", isPreliminary: false });
  });

  it("uses weather only and marks the result as preliminary", () => {
    expect(assessSeason({ weather: 80 })).toEqual({
      score: 80,
      verdict: "ideal",
      isPreliminary: true,
    });
  });

  it("renormalizes weights when one input is missing", () => {
    // (100·0.4 + 30·0.3) / 0.7 = 70
    const result = assessSeason({ weather: 100, price: 30 });
    expect(result.score).toBe(70);
    expect(result.isPreliminary).toBe(true);
  });

  it("treats a zero input as a real value, not as missing", () => {
    const result = assessSeason({ weather: 100, crowd: 0, price: 0 });
    expect(result).toEqual({ score: 40, verdict: "meh", isPreliminary: false });
  });
});
