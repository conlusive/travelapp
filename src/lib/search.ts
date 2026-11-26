// Апострофи в українських назвах пишуть по-різному (ʼ ' ’ `), тому ігноруємо їх.
const APOSTROPHES = /[ʼ'’‘`]/g;

function normalize(value: string): string {
  return value.toLowerCase().replace(APOSTROPHES, "").replace(/-/g, " ").trim();
}

/** true, якщо хоча б одне з полів містить запит. Порожній запит підходить усьому. */
export function matchesQuery(query: string, fields: string[]): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  return fields.some((field) => normalize(field).includes(needle));
}
