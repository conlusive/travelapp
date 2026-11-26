import { describe, expect, it } from "vitest";
import { matchesQuery } from "./search";

describe("matchesQuery", () => {
  const fields = ["Нью-Йорк", "new-york", "США"];

  it("matches by part of any field, ignoring case", () => {
    expect(matchesQuery("йорк", fields)).toBe(true);
    expect(matchesQuery("NEW Y", fields)).toBe(true);
    expect(matchesQuery("сша", fields)).toBe(true);
  });

  it("ignores apostrophe variants", () => {
    expect(matchesQuery("вєтнам", ["Вʼєтнам"])).toBe(true);
    expect(matchesQuery("в'єтнам", ["Вʼєтнам"])).toBe(true);
    expect(matchesQuery("в’єтнам", ["Вʼєтнам"])).toBe(true);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery("   ", fields)).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesQuery("лондон", fields)).toBe(false);
  });
});
