// Спільний захист публічних POST-маршрутів: rate limit, ліміт розміру, розбір JSON, honeypot.
import type { createRateLimiter } from "./rate-limit.ts";

export type GuardResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

function clientIp(request: Request): string {
  // Перший елемент — клієнт; платформа (Vercel) дописує свої значення в кінець.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function fail(error: string, status: number, headers?: HeadersInit): GuardResult {
  return { ok: false, response: Response.json({ error }, { status, headers }) };
}

export async function readGuardedJson(
  request: Request,
  checkRateLimit: ReturnType<typeof createRateLimiter>,
  maxBytes: number,
): Promise<GuardResult> {
  const limit = checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    return fail("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  }

  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) {
    return fail("payload_too_large", 413);
  }
  // content-length може бути відсутнім або неправдивим, тому міряємо й фактичне тіло.
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) return fail("payload_too_large", 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return fail("invalid_json", 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("invalid_json", 400);
  }

  // Honeypot: людина це поле не бачить. Бот отримує «успіх», але нічого не зберігається.
  const record = body as Record<string, unknown>;
  if (typeof record.website === "string" && record.website.length > 0) {
    return { ok: false, response: Response.json({ ok: true }) };
  }

  return { ok: true, body: record };
}
