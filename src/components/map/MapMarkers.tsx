"use client";

import type { MapRegion, PlaceCard } from "@/data/explorer";
import type { RegionId } from "@/domain/regions";
import { VERDICT_LABELS } from "@/domain/season";
import { placeLabels, toPercent, type View } from "@/lib/map-view";
import { VERDICT_BACKGROUND } from "../verdict-styles";

type Size = { width: number; height: number };

const inside = ({ left, top }: { left: number; top: number }) =>
  left >= 0 && left <= 100 && top >= 0 && top <= 100;

/** Віддалена карта: по одній мітці на регіон, щоб точки не злипалися. */
export function RegionMarkers({
  view,
  regions,
  counts,
  onSelect,
}: {
  view: View;
  regions: MapRegion[];
  counts: Map<RegionId, number>;
  onSelect: (id: RegionId) => void;
}) {
  return regions.map((region) => {
    const position = toPercent(view, region.marker.x, region.marker.y);
    const count = counts.get(region.id) ?? 0;
    if (!count || !inside(position)) return null;
    return (
      <button
        key={region.id}
        type="button"
        onClick={() => onSelect(region.id)}
        style={{ left: `${position.left}%`, top: `${position.top}%` }}
        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 animate-pop cursor-pointer flex-col items-center gap-1 text-white"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-white text-lg font-extrabold text-black shadow-[0_0_0_8px_rgb(255_255_255/0.15)] transition hover:scale-110">
          {count}
        </span>
        <span className="max-w-32 rounded-full bg-black/70 px-3 py-0.5 text-center text-xs font-bold">
          {region.name}
        </span>
      </button>
    );
  });
}

export function PlaceMarkers({
  view,
  size,
  places,
  matching,
  month,
  active,
  onActivate,
}: {
  view: View;
  size: Size;
  places: PlaceCard[];
  /** Напрямки поточного вибору й пошуку; решта пригашені. */
  matching: Set<string>;
  month: number | null;
  active: string | null;
  onActivate: (slug: string) => void;
}) {
  const positioned = places
    .map((place) => ({ place, position: toPercent(view, place.x, place.y) }))
    .filter(({ position }) => inside(position));

  // Пріоритет підписів: активний, потім з вибору, потім за оцінкою місяця.
  const priority = (place: PlaceCard) =>
    (place.slug === active ? 1000 : 0) +
    (matching.has(place.slug) ? 500 : 0) +
    (month === null ? 0 : place.months[month - 1].score);

  const labels = placeLabels(
    positioned
      .toSorted((a, b) => priority(b.place) - priority(a.place))
      .map(({ place, position }) => ({
        id: place.slug,
        left: (position.left / 100) * size.width,
        top: (position.top / 100) * size.height,
        text: month === null ? place.name : `${place.name} 100`,
      })),
  );

  return positioned.map(({ place, position }) => {
    const season = month === null || place.unreliable ? null : place.months[month - 1];
    const isActive = place.slug === active;
    const dimmed = !matching.has(place.slug);
    return (
      <button
        key={place.slug}
        type="button"
        onClick={() => onActivate(place.slug)}
        aria-pressed={isActive}
        aria-label={`${place.name}, ${place.countryName}${season ? `: ${VERDICT_LABELS[season.verdict]}, ${season.score} зі 100` : ""}`}
        style={{ left: `${position.left}%`, top: `${position.top}%` }}
        className={`group absolute flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center transition-opacity ${
          isActive ? "z-20" : "z-10 hover:z-20"
        } ${dimmed ? "opacity-35" : ""}`}
      >
        <span
          className={`block rounded-full ring-2 ring-black/60 transition-transform group-hover:scale-125 ${
            season ? VERDICT_BACKGROUND[season.verdict] : "bg-white"
          } ${isActive ? "size-5 shadow-[0_0_0_7px_rgb(255_255_255/0.25)]" : "size-3.5"}`}
        />
        <span
          className={`pointer-events-none absolute ${labels.get(place.slug) === "left" ? "right-7" : "left-7"} flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold whitespace-nowrap text-white backdrop-blur-sm ${
            labels.has(place.slug) || isActive ? "" : "hidden group-hover:flex group-focus-visible:flex"
          }`}
        >
          {place.name}
          {season && <span className="text-white/60">{season.score}</span>}
        </span>
      </button>
    );
  });
}
