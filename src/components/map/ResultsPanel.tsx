"use client";

import Image from "next/image";
import Link from "next/link";
import type { PlaceCard } from "@/data/explorer";
import { assessPeriod, periodQuery, type Period } from "@/domain/period";
import { VERDICT_LABELS } from "@/domain/season";
import { SaveButton } from "../saved/SaveButton";
import { VERDICT_BACKGROUND } from "../verdict-styles";

export const destinationHref = (place: PlaceCard, period: Period) =>
  `${place.href}${periodQuery(period)}`;

export function VerdictBadge({ place, period }: { place: PlaceCard; period: Period }) {
  if (!period) return null;
  if (place.unreliable) return <span className="text-xs text-white/55">Дані уточнюємо</span>;
  const season = assessPeriod(place.months, period);
  return (
    <span
      className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold text-on-verdict transition-colors duration-500 ${VERDICT_BACKGROUND[season.verdict]}`}
    >
      {VERDICT_LABELS[season.verdict]} · {season.score}
    </span>
  );
}

export function ResultsPanel({
  places,
  period,
  active,
  onActivate,
}: {
  places: PlaceCard[];
  period: Period;
  active: string | null;
  onActivate?: (slug: string) => void;
}) {
  if (places.length === 0) {
    return <p className="p-5 text-sm text-white/60">Тут поки немає напрямків. Змініть пошук або регіон.</p>;
  }
  return (
    <ul className="flex flex-col gap-1 p-2">
      {places.map((place, index) => (
        // Елементи зʼявляються по черзі; затримку обмежено, щоб кінець списку не чекав.
        <li
          key={place.slug}
          className="flex animate-swap items-center gap-1"
          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
          <Link
            href={destinationHref(place, period)}
            onPointerEnter={() => onActivate?.(place.slug)}
            onFocus={() => onActivate?.(place.slug)}
            data-active={active === place.slug}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-2 transition hover:bg-white/10 data-[active=true]:bg-white/10"
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
                {period ? place.countryName : place.summary}
              </span>
              <VerdictBadge place={place} period={period} />
            </span>
          </Link>
          <SaveButton slug={place.slug} name={place.name} className="shrink-0 scale-90" />
        </li>
      ))}
    </ul>
  );
}
