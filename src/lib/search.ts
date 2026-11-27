// Апострофи в українських назвах пишуть по-різному (ʼ ' ’ `), тому ігноруємо їх.
const APOSTROPHES = /[ʼ'’‘`]/g;

export function normalizeText(value: string): string {
  return value.toLowerCase().replace(APOSTROPHES, "").replace(/-/g, " ").trim();
}

/** true, якщо хоча б одне з полів містить запит. Порожній запит підходить усьому. */
export function matchesQuery(query: string, fields: string[]): boolean {
  const needle = normalizeText(query);
  if (!needle) return true;
  return fields.some((field) => normalizeText(field).includes(needle));
}
