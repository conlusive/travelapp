// Дані сторінки «Обране»: усе, що порівнюється поруч. Лише для сервера.
import type { MonthlyClimate } from "../domain/types.ts";
import { getContent, getCountry, getEntryRules, getSeason, listDestinations } from "./catalog.ts";
import { buildPlaceCard, type PlaceCard } from "./explorer.ts";

export type CompareItem = PlaceCard & {
  climate: MonthlyClimate[];
  currency: string;
  /** null — ще не перевірено. */
  fare: { label: string; price: string } | null;
  entry: string | null;
  sights: number | null;
};

export function listCompareItems(): CompareItem[] {
  return listDestinations().map((destination) => {
    const country = getCountry(destination.countrySlug)!;
    const content = getContent(destination.slug);
    const fare = content?.fares[0];

    return {
      ...buildPlaceCard(destination),
      climate: getSeason(destination.slug).map((month) => month.climate),
      currency: country.currency,
      fare: fare ? { label: fare.label, price: fare.price } : null,
      entry: getEntryRules(country.slug)?.facts[0]?.text ?? null,
      sights: content?.attractions.length ?? null,
    };
  });
}
