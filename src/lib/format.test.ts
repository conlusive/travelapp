import { describe, expect, it } from "vitest";
import { formatMonthYear, formatTemperature, formatVisitDuration } from "./format";

describe("formatTemperature", () => {
  it.each([
    [21.4, "+21 °C"],
    [-2.6, "-3 °C"],
    [0.4, "0 °C"],
    [-0.4, "0 °C"],
  ])("formats %d", (value, text) => {
    expect(formatTemperature(value)).toBe(text);
  });
});

describe("formatVisitDuration", () => {
  it.each([
    [20, "≈ 20 хв"],
    [59, "≈ 59 хв"],
    [60, "≈ 1 год"],
    [90, "≈ 1,5 год"],
    [100, "≈ 1,5 год"],
    [180, "≈ 3 год"],
  ])("formats %i minutes", (minutes, text) => {
    expect(formatVisitDuration(minutes)).toBe(text);
  });
});

describe("formatMonthYear", () => {
  it("names the month in Ukrainian", () => {
    expect(formatMonthYear("2026-11-27")).toBe("листопад 2026");
    expect(formatMonthYear("2027-01-01")).toBe("січень 2027");
  });

  it("fails on a malformed date", () => {
    expect(() => formatMonthYear("вчора")).toThrow();
  });
});
