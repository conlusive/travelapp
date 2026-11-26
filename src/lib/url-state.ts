/**
 * Оновлює параметри адреси без переходу й нового запису в історії.
 * Next.js синхронізує useSearchParams із history.replaceState.
 */
export function replaceSearchParams(next: Record<string, string | number | null | undefined>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined) continue;
    if (value === null || value === "") url.searchParams.delete(key);
    else url.searchParams.set(key, String(value));
  }
  window.history.replaceState(null, "", url);
}
