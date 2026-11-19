import { describe, expect, it } from "vitest";
import { normalizeEmail, normalizeSource } from "./email";

describe("normalizeEmail", () => {
  it("trims and lowercases a valid address", () => {
    expect(normalizeEmail("  Olena.K@Example.COM ")).toBe("olena.k@example.com");
  });

  it.each(["", "   ", "no-at-sign", "a@b", "a@@b.com", "a b@c.com", "a@b.c", "@b.com"])(
    "rejects %j",
    (value) => {
      expect(normalizeEmail(value)).toBeNull();
    },
  );

  it("rejects non-string input", () => {
    expect(normalizeEmail(undefined)).toBeNull();
    expect(normalizeEmail(42)).toBeNull();
    expect(normalizeEmail({ email: "a@b.com" })).toBeNull();
  });

  it("accepts 254 characters and rejects 255", () => {
    const domain = "@example.com";
    const ok = "a".repeat(254 - domain.length) + domain;
    expect(normalizeEmail(ok)).toBe(ok);
    expect(normalizeEmail("a" + ok)).toBeNull();
  });
});

describe("normalizeSource", () => {
  it("accepts a simple channel slug", () => {
    expect(normalizeSource("Telegram_UA-1")).toBe("telegram_ua-1");
  });

  it.each(["", "has space", "<script>", "a".repeat(41), "україна"])("rejects %j", (value) => {
    expect(normalizeSource(value)).toBeNull();
  });

  it("returns null for non-string input", () => {
    expect(normalizeSource(null)).toBeNull();
    expect(normalizeSource(["x"])).toBeNull();
  });
});
