"use client";

import Image from "next/image";
import Link from "next/link";
import type { PlaceCard } from "@/data/explorer";
import { VERDICT_LABELS } from "@/domain/season";
import { VERDICT_BACKGROUND } from "../verdict-styles";

export const destinationHref = (place: PlaceCard, month: number | null) =>
  month === null ? place.href : `${place.href}?month=${month}`;

export function VerdictBadge({ place, month }: { place: PlaceCard; month: number | null }) {
  if (month === null) return null;
  if (place.unreliable) return <span className="text-xs text-white/55">Дані уточнюємо</span>;
  const season = place.months[month - 1];
  return (
    <span
      className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold text-on-verdict ${VERDICT_BACKGROUND[season.verdict]}`}
    >
      {VERDICT_LABELS[season.verdict]} · {season.score}
    </span>
  );
}

export function ResultsPanel({
  places,
  month,
  active,
  onActivate,
}: {
  places: PlaceCard[];
  month: number | null;
  active: string | null;
  onActivate?: (slug: string) => void;
}) {
  if (places.length === 0) {
    return <p className="p-5 text-sm text-white/60">Тут поки немає напрямків. Змініть пошук або регіон.</p>;
  }
  return (
    <ul className="flex flex-col gap-1 p-2">
      {places.map((place) => (
        <li key={place.slug}>
          <Link
            href={destinationHref(place, month)}
            onPointerEnter={() => onActivate?.(place.slug)}
            onFocus={() => onActivate?.(place.slug)}
            data-active={active === place.slug}
            className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/10 data-[active=true]:bg-white/10"
          >
            <span className="relative size-18 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={place.photo.src}
                alt=""
                fill
                sizes="72px"
                placeholder="blur"
                blurDataURL={place.photo.blur}
                className="object-cover transition duration-500 group-hover:scale-110"
              />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-bold">{place.name}</span>
              <span className="truncate text-xs text-white/55">
                {month === null ? place.summary : place.countryName}
              </span>
              <VerdictBadge place={place} month={month} />
            </span>
            <span aria-hidden="true" className="ml-auto pr-1 text-white/40 transition group-hover:translate-x-1 group-hover:text-white">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
