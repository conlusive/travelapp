import { assessPeriod, type Period } from "../domain/period.ts";
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

/** Фільтрує за текстом; якщо обрано період — сортує від найкращої погоди. */
export function filterDestinations<T extends FilterableCard>(
  cards: T[],
  query: string,
  period: Period,
): T[] {
  const matching = cards.filter((card) => matchesQuery(query, card.searchFields));
  if (!period) return matching;

  return matching.toSorted(
    (a, b) =>
      Number(a.unreliable) - Number(b.unreliable) ||
      assessPeriod(b.months, period).score - assessPeriod(a.months, period).score ||
      a.name.localeCompare(b.name, "uk"),
  );
}
