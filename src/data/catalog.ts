// Єдина точка читання даних для сторінок. Зараз джерело — файли репозиторію;
// перехід на Supabase змінюватиме лише цей модуль.
import { assessSeason, weatherScore, type SeasonAssessment } from "../domain/season.ts";
import type { DestinationContent, EntryRules } from "../domain/content.ts";
import type { Country, Destination, MonthlyClimate } from "../domain/types.ts";
import climate from "./climate.json" with { type: "json" };
import { ENTRY_RULES } from "./content/entry-rules.ts";
import { DESTINATION_CONTENT } from "./content/index.ts";
import { COUNTRIES, DESTINATIONS } from "./destinations.ts";

export type MonthSeason = SeasonAssessment & { climate: MonthlyClimate };

const climateBySlug: Record<string, MonthlyClimate[]> = climate.destinations;

export const climateSource = climate.source;

export function listCountries(): Country[] {
  return COUNTRIES;
}

export function getCountry(slug: string): Country | null {
  return COUNTRIES.find((country) => country.slug === slug) ?? null;
}

export function listDestinations(countrySlug?: string): Destination[] {
  if (!countrySlug) return DESTINATIONS;
  return DESTINATIONS.filter((destination) => destination.countrySlug === countrySlug);
}

export function getDestination(countrySlug: string, slug: string): Destination | null {
  return listDestinations(countrySlug).find((destination) => destination.slug === slug) ?? null;
}

export function getSeason(destinationSlug: string): MonthSeason[] {
  const months = climateBySlug[destinationSlug];
  if (!months) throw new Error(`No climate data for destination "${destinationSlug}"`);
  return months.map((month) => ({
    ...assessSeason({ weather: weatherScore(month) }),
    climate: month,
  }));
}

/** null — ручний контент для напрямку ще не перевірений. */
export function getContent(destinationSlug: string): DestinationContent | null {
  return DESTINATION_CONTENT[destinationSlug] ?? null;
}

export function getEntryRules(countrySlug: string): EntryRules | null {
  return ENTRY_RULES[countrySlug] ?? null;
}
