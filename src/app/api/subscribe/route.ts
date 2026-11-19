import { normalizeEmail, normalizeSource } from "@/lib/email";
import { createRateLimiter } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const MAX_BODY_BYTES = 2048;
const checkRateLimit = createRateLimiter(5, 60_000);

function clientIp(request: Request): string {
  // Перший елемент — клієнт; платформа (Vercel) дописує свої значення в кінець.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    return Response.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const { email, source, website } = body as Record<string, unknown>;

  // Honeypot: людина це поле не бачить. Бот отримує «успіх», але нічого не зберігається.
  if (typeof website === "string" && website.length > 0) {
    return Response.json({ ok: true });
  }

  const normalized = normalizeEmail(email);
  if (!normalized) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("subscribe: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  // Повторна підписка не помилка й не розкриває, чи адреса вже є в списку.
  const { error } = await supabase
    .from("waitlist_subscribers")
    .upsert(
      { email: normalized, source: normalizeSource(source) },
      { onConflict: "email", ignoreDuplicates: true },
    );

  if (error) {
    console.error("subscribe: insert failed", { code: error.code, message: error.message });
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
