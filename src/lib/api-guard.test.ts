import { describe, expect, it } from "vitest";
import { readGuardedJson } from "./api-guard";
import { createRateLimiter } from "./rate-limit";

const MAX = 100;

function post(body: string, headers: Record<string, string> = {}) {
  return new Request("http://test/api", { method: "POST", body, headers });
}

async function run(body: string, limiter = createRateLimiter(10, 1000)) {
  const result = await readGuardedJson(post(body), limiter, MAX);
  if (result.ok) return { status: 200, body: result.body };
  return { status: result.response.status, body: await result.response.json() };
}

describe("readGuardedJson", () => {
  it("returns the parsed object", async () => {
    expect(await run('{"a":1}')).toEqual({ status: 200, body: { a: 1 } });
  });

  it.each(["not json", '"text"', "null", "[1]", ""])("rejects %j", async (body) => {
    expect(await run(body)).toEqual({ status: 400, body: { error: "invalid_json" } });
  });

  it("rejects a body over the limit measured in bytes, not characters", async () => {
    const cyrillic = JSON.stringify({ a: "я".repeat(60) });
    expect(cyrillic.length).toBeLessThanOrEqual(MAX);
    expect((await run(cyrillic)).status).toBe(413);
  });

  it("answers a filled honeypot with a fake success", async () => {
    const result = await readGuardedJson(post('{"website":"x"}'), createRateLimiter(10, 1000), MAX);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(await result.response.json()).toEqual({ ok: true });
  });

  it("limits requests per client address", async () => {
    const limiter = createRateLimiter(1, 60_000, () => 0);
    const from = (ip: string) =>
      readGuardedJson(post("{}", { "x-forwarded-for": `${ip}, 10.0.0.1` }), limiter, MAX);

    expect((await from("1.1.1.1")).ok).toBe(true);
    expect((await from("2.2.2.2")).ok).toBe(true);
    const blocked = await from("1.1.1.1");
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.response.status).toBe(429);
      expect(blocked.response.headers.get("Retry-After")).toBe("60");
    }
  });
});
