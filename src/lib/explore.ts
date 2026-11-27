// Вибір на карті: світ → регіон → країна, пошукові підказки та добірки за порами року.
import { SEASONS } from "../domain/period.ts";
import { REGIONS, isRegionId, type RegionId } from "../domain/regions.ts";
import type { FilterableCard } from "./destination-filter.ts";
import { filterDestinations } from "./destination-filter.ts";
import { normalizeText } from "./search.ts";

export type Selection = { region: RegionId | null; country: string | null };

export type ExploreCountry = { slug: string; name: string; region: RegionId };

export type ExplorePlace = {
  slug: string;
  name: string;
  searchName: string;
  countrySlug: string;
  region: RegionId;
};

/** Значення з адреси: невідомі відкидаються, країна завжди визначає свій регіон. */
export function parseSelection(
  region: string | null,
  country: string | null,
  countries: ExploreCountry[],
): Selection {
  const found = countries.find((item) => item.slug === country);
  if (found) return { region: found.region, country: found.slug };
  return { region: isRegionId(region) ? region : null, country: null };
}

export function filterBySelection<T extends { countrySlug: string; region: RegionId }>(
  places: T[],
  { region, country }: Selection,
): T[] {
  if (country) return places.filter((place) => place.countrySlug === country);
  if (region) return places.filter((place) => place.region === region);
  return places;
}

export type Suggestion =
  | { type: "region"; id: RegionId; label: string; hint: string }
  | { type: "country"; id: string; label: string; hint: string }
  | { type: "destination"; id: string; label: string; hint: string };

/** 0 — збіг з початку слова, 1 — усередині, null — немає збігу. */
function matchRank(needle: string, fields: string[]): number | null {
  let rank: number | null = null;
  for (const field of fields) {
    const text = normalizeText(field);
    if (text.startsWith(needle) || text.includes(` ${needle}`)) return 0;
    if (text.includes(needle)) rank = 1;
  }
  return rank;
}

export function suggest(
  query: string,
  countries: ExploreCountry[],
  places: ExplorePlace[],
  limit = 7,
): Suggestion[] {
  const needle = normalizeText(query);
  if (!needle) return [];

  const regionName = (id: RegionId) => REGIONS.find((region) => region.id === id)!.name;
  const count = (selection: Selection) => filterBySelection(places, selection).length;

  const candidates: { suggestion: Suggestion; fields: string[] }[] = [
    ...REGIONS.map((region) => ({
      suggestion: {
        type: "region" as const,
        id: region.id,
        label: region.name,
        hint: `Регіон · напрямків: ${count({ region: region.id, country: null })}`,
      },
      fields: [region.name, region.id],
    })),
    ...countries.map((country) => ({
      suggestion: {
        type: "country" as const,
        id: country.slug,
        label: country.name,
        hint: `Країна · ${regionName(country.region)}`,
      },
      fields: [country.name, country.slug],
    })),
    ...places.map((place) => ({
      suggestion: {
        type: "destination" as const,
        id: place.slug,
        label: place.name,
        hint: countries.find((country) => country.slug === place.countrySlug)?.name ?? "",
      },
      fields: [place.name, place.searchName],
    })),
  ];

  return candidates
    .map(({ suggestion, fields }) => ({ suggestion, rank: matchRank(needle, fields) }))
    .filter((item): item is { suggestion: Suggestion; rank: number } => item.rank !== null)
    .toSorted((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map((item) => item.suggestion);
}

// Літери під картками пір року, як у відео-орієнтирі: разом читаються «КОЛИ».
const SEASON_LETTERS = ["К", "О", "Л", "И"];

/** Для кожної пори року — найкращий за середньою погодою напрямок, без повторів. */
export function seasonHighlights<T extends FilterableCard>(cards: T[]) {
  const used = new Set<T>();
  return SEASONS.map((season, index) => {
    const card = filterDestinations(cards, "", { kind: "season", season: season.id }).find(
      (item) => !item.unreliable && !used.has(item),
    );
    if (!card) throw new Error(`No destination for ${season.id}`);
    used.add(card);
    return { id: season.id, when: season.when, letter: SEASON_LETTERS[index], card };
  });
}

/** Для кожного місяця 1–12: у скількох надійних напрямках погода щонайменше добра. */
export function goodWeatherByMonth(cards: FilterableCard[]): { good: number; total: number }[] {
  const reliable = cards.filter((card) => !card.unreliable);
  return Array.from({ length: 12 }, (_, month) => ({
    good: reliable.filter((card) => ["ideal", "good"].includes(card.months[month].verdict)).length,
    total: reliable.length,
  }));
}
