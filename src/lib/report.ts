// Межі звіту про неточність; ті самі, що в supabase/migrations/0003_inaccuracy_reports.sql.
export const REPORT_MIN_LENGTH = 10;
export const REPORT_MAX_LENGTH = 1000;
const PATH_PATTERN = /^\/[a-z0-9/-]{0,199}$/;

export function normalizeReport(path: unknown, message: unknown) {
  if (typeof path !== "string" || !PATH_PATTERN.test(path)) return null;
  if (typeof message !== "string") return null;
  const text = message.trim();
  // Рахуємо символи так само, як char_length у Postgres.
  const length = [...text].length;
  if (length < REPORT_MIN_LENGTH || length > REPORT_MAX_LENGTH) return null;
  return { path, message: text };
}
