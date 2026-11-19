import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit and blocks the next one", () => {
    let time = 0;
    const check = createRateLimiter(3, 60_000, () => time);

    expect(check("ip").allowed).toBe(true);
    expect(check("ip").allowed).toBe(true);
    expect(check("ip").allowed).toBe(true);

    time = 10_000;
    const blocked = check("ip");
    expect(blocked).toEqual({ allowed: false, retryAfterSeconds: 50 });
  });

  it("starts a new window after it expires", () => {
    let time = 0;
    const check = createRateLimiter(1, 1000, () => time);

    expect(check("ip").allowed).toBe(true);
    expect(check("ip").allowed).toBe(false);
    time = 1000;
    expect(check("ip").allowed).toBe(true);
  });

  it("counts each key separately", () => {
    const check = createRateLimiter(1, 60_000, () => 0);

    expect(check("a").allowed).toBe(true);
    expect(check("b").allowed).toBe(true);
    expect(check("a").allowed).toBe(false);
  });
});
