// Дані головної сторінки: те, що карта й добірки отримують на клієнт. Лише для сервера.
import { monthName } from "../domain/months.ts";
import { REGIONS, type RegionId } from "../domain/regions.ts";
import { bestMonths, type Verdict } from "../domain/season.ts";
import type { ExploreCountry, ExplorePlace } from "../lib/explore.ts";
import { projectBox, projectPoint } from "../lib/map-projection.ts";
import type { Bounds } from "../lib/map-view.ts";
import { getCountry, getSeason, listCountries, listDestinations, type MonthSeason } from "./catalog.ts";
import mapBounds from "./map-bounds.json" with { type: "json" };
import { getPhoto } from "./photos.ts";
import type { Destination } from "../domain/types.ts";

export type PlaceCard = ExplorePlace & {
  countryName: string;
  href: string;
  summary: string;
  searchFields: string[];
  months: { score: number; verdict: Verdict }[];
  unreliable: boolean;
  /** Координати на карті. */
  x: number;
  y: number;
  photo: { src: string; blur: string; author: string; license: string };
};

export type MapCountry = ExploreCountry & { mapId: string; bounds: Bounds };

export type MapRegion = {
  id: RegionId;
  name: string;
  bounds: Bounds;
  marker: { x: number; y: number };
};

export function summarize(destination: Destination, season: MonthSeason[]): string {
  if (destination.climateCaveat) return "Кліматичні дані уточнюємо";
  const months = bestMonths(season);
  if (months.length === 0) return "Погода непроста цілий рік";
  return `Найкраща погода: ${months.map((m) => monthName(m).full.toLowerCase()).join(", ")}`;
}

export function buildPlaceCard(destination: Destination): PlaceCard {
  const country = getCountry(destination.countrySlug);
  if (!country) throw new Error(`Unknown country "${destination.countrySlug}"`);
  const season = getSeason(destination.slug);
  const [x, y] = projectPoint(destination.lng, destination.lat);
  const { src, blur, author, license } = getPhoto(destination.slug);

  return {
    slug: destination.slug,
    name: destination.name,
    searchName: destination.searchName,
    countrySlug: country.slug,
    countryName: country.name,
    region: country.region,
    href: `/${country.slug}/${destination.slug}`,
    summary: summarize(destination, season),
    searchFields: [
      destination.name,
      destination.searchName,
      country.name,
      country.slug,
      REGIONS.find((region) => region.id === country.region)!.name,
    ],
    months: season.map(({ score, verdict }) => ({ score, verdict })),
    unreliable: destination.climateCaveat ?? false,
    x,
    y,
    photo: { src, blur, author, license },
  };
}

export function listPlaceCards(): PlaceCard[] {
  return listDestinations().map(buildPlaceCard);
}

export function listMapCountries(): MapCountry[] {
  const bounds: Record<string, number[]> = mapBounds;
  return listCountries().map(({ slug, name, region, mapId }) => ({
    slug,
    name,
    region,
    mapId,
    bounds: bounds[slug] as Bounds,
  }));
}

export function listMapRegions(): MapRegion[] {
  return REGIONS.map(({ id, name, box, marker }) => {
    const [x, y] = projectPoint(marker[0], marker[1]);
    return { id, name, bounds: projectBox([...box]), marker: { x, y } };
  });
}
