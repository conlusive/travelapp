import { readGuardedJson } from "@/lib/api-guard";
import { createRateLimiter } from "@/lib/rate-limit";
import { normalizeReport } from "@/lib/report";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// 1000 кириличних символів — близько 2 КБ, плюс шлях і службові поля.
const MAX_BODY_BYTES = 6144;
const checkRateLimit = createRateLimiter(3, 60_000);

export async function POST(request: Request) {
  const guard = await readGuardedJson(request, checkRateLimit, MAX_BODY_BYTES);
  if (!guard.ok) return guard.response;

  const report = normalizeReport(guard.body.path, guard.body.message);
  if (!report) return Response.json({ error: "invalid_report" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("report: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const { error } = await supabase.from("inaccuracy_reports").insert(report);
  if (error) {
    console.error("report: insert failed", { code: error.code, message: error.message });
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
