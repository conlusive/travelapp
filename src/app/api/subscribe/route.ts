import { readGuardedJson } from "@/lib/api-guard";
import { normalizeEmail, normalizeSource } from "@/lib/email";
import { createRateLimiter } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const MAX_BODY_BYTES = 2048;
const checkRateLimit = createRateLimiter(5, 60_000);

export async function POST(request: Request) {
  const guard = await readGuardedJson(request, checkRateLimit, MAX_BODY_BYTES);
  if (!guard.ok) return guard.response;

  const normalized = normalizeEmail(guard.body.email);
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
      { email: normalized, source: normalizeSource(guard.body.source) },
      { onConflict: "email", ignoreDuplicates: true },
    );

  if (error) {
    console.error("subscribe: insert failed", { code: error.code, message: error.message });
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
