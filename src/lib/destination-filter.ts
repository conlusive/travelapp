import type { Verdict } from "../domain/season.ts";
import { matchesQuery } from "./search.ts";

export type FilterableCard = {
  name: string;
  searchFields: string[];
  /** Оцінки за місяцями 1–12. */
  months: { score: number; verdict: Verdict }[];
  /** Дані неточні: у рейтингу за місяцем ідуть після надійних. */
  unreliable: boolean;
};

/** 1–12 або null для відсутнього чи некоректного значення з адреси. */
export function parseMonth(value: string | null): number | null {
  if (!value || !/^\d{1,2}$/.test(value)) return null;
  const month = Number(value);
  return month >= 1 && month <= 12 ? month : null;
}

/** Фільтрує за текстом; якщо обрано місяць — сортує від найкращої погоди. */
export function filterDestinations<T extends FilterableCard>(
  cards: T[],
  query: string,
  month: number | null,
): T[] {
  const matching = cards.filter((card) => matchesQuery(query, card.searchFields));
  if (month === null) return matching;

  return matching.toSorted(
    (a, b) =>
      Number(a.unreliable) - Number(b.unreliable) ||
      b.months[month - 1].score - a.months[month - 1].score ||
      a.name.localeCompare(b.name, "uk"),
  );
}
