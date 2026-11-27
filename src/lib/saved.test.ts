import { describe, expect, it } from "vitest";
import { MAX_SAVED, parseCompare, parseSaved, toggleCompare, toggleSlug } from "./saved";

describe("parseSaved", () => {
  it("reads a list, dropping duplicates and non-strings", () => {
    expect(parseSaved('["lisbon","prague","lisbon",5,null]')).toEqual(["lisbon", "prague"]);
  });

  it.each([null, "", "not json", "{}", '"lisbon"', "42"])("treats %j as empty", (raw) => {
    expect(parseSaved(raw)).toEqual([]);
  });

  it("limits the size", () => {
    const many = JSON.stringify(Array.from({ length: MAX_SAVED + 5 }, (_, i) => `d${i}`));
    expect(parseSaved(many)).toHaveLength(MAX_SAVED);
  });
});

describe("toggleSlug", () => {
  it("adds and removes", () => {
    expect(toggleSlug(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleSlug(["a", "b"], "a")).toEqual(["b"]);
  });

  it("drops the oldest entry past the limit", () => {
    const full = Array.from({ length: MAX_SAVED }, (_, i) => `d${i}`);
    const next = toggleSlug(full, "new");
    expect(next).toHaveLength(MAX_SAVED);
    expect(next[0]).toBe("d1");
    expect(next.at(-1)).toBe("new");
  });
});

describe("comparison", () => {
  const known = new Set(["a", "b", "c", "d"]);

  it("keeps up to three known unique destinations", () => {
    expect(parseCompare("b,x,a,b,c,d", known)).toEqual(["b", "a", "c"]);
    expect(parseCompare(null, known)).toEqual([]);
  });

  it("replaces the oldest when a fourth is chosen", () => {
    expect(toggleCompare(["a", "b", "c"], "d")).toEqual(["b", "c", "d"]);
    expect(toggleCompare(["a", "b"], "a")).toEqual(["b"]);
  });
});
