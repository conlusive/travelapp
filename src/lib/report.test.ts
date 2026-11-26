import { describe, expect, it } from "vitest";
import { normalizeReport } from "./report";

describe("normalizeReport", () => {
  it("trims the message and keeps the page path", () => {
    expect(normalizeReport("/portugal/lisbon", "  Ціна квитка змінилась  ")).toEqual({
      path: "/portugal/lisbon",
      message: "Ціна квитка змінилась",
    });
  });

  it.each([10, 1000])("accepts %i characters", (length) => {
    expect(normalizeReport("/", "я".repeat(length))).not.toBeNull();
  });

  it.each([0, 9, 1001])("rejects %i characters", (length) => {
    expect(normalizeReport("/", "я".repeat(length))).toBeNull();
  });

  it.each(["", "portugal", "https://evil.test/", "/a?b=1", "/A", "/".padEnd(201, "a")])(
    "rejects path %j",
    (path) => {
      expect(normalizeReport(path, "достатньо довгий текст")).toBeNull();
    },
  );

  it("rejects non-string input", () => {
    expect(normalizeReport(null, "достатньо довгий текст")).toBeNull();
    expect(normalizeReport("/", 12345678901)).toBeNull();
  });
});
