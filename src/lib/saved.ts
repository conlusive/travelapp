// Список «Хочу поїхати» та вибір для порівняння: чисті операції без сховища.

export const MAX_SAVED = 50;
export const MAX_COMPARED = 3;

/** Значення зі сховища браузера: будь-що пошкоджене перетворюється на порожній список. */
export function parseSaved(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const slugs = value.filter((item): item is string => typeof item === "string");
    return [...new Set(slugs)].slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

/** Додає в кінець або прибирає; понад ліміт витісняється найстаріше. */
export function toggleSlug(list: string[], slug: string): string[] {
  if (list.includes(slug)) return list.filter((item) => item !== slug);
  return [...list, slug].slice(-MAX_SAVED);
}

/** «a,b,c» з адреси: лише відомі напрямки, без повторів, не більше трьох. */
export function parseCompare(value: string | null, known: ReadonlySet<string>): string[] {
  if (!value) return [];
  return [...new Set(value.split(","))].filter((slug) => known.has(slug)).slice(0, MAX_COMPARED);
}

/** Вмикає чи вимикає напрямок у порівнянні; четвертий замінює найстаріший. */
export function toggleCompare(selected: string[], slug: string): string[] {
  if (selected.includes(slug)) return selected.filter((item) => item !== slug);
  return [...selected, slug].slice(-MAX_COMPARED);
}
