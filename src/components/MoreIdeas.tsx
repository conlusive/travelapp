"use client";

import { useSearchParams } from "next/navigation";
import type { PlaceCard } from "@/data/explorer";
import { assessPeriod, parsePeriod, periodName, periodQuery, type Period } from "@/domain/period";
import { VERDICT_LABELS } from "@/domain/season";
import { filterDestinations } from "@/lib/destination-filter";
import { PhotoCard } from "./PhotoCard";
import { VERDICT_BACKGROUND } from "./verdict-styles";

type Props = { places: PlaceCard[]; current: string; initialMonth: number };

export function MoreIdeasView({
  places,
  current,
  period,
}: Omit<Props, "initialMonth"> & { period: NonNullable<Period> }) {
  const ideas = filterDestinations(places, "", period)
    .filter((place) => place.slug !== current && !place.unreliable)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">
        Де ще гарна погода, якщо ви їдете в цей час: {periodName(period).toLowerCase()}.
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((place) => {
          const season = assessPeriod(place.months, period);
          return (
            <li key={place.slug} className="animate-swap">
              <PhotoCard
                slug={place.slug}
                href={`${place.href}${periodQuery(period)}`}
                title={place.name}
                text={place.countryName}
                photo={place.photo}
                badge={
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold text-on-verdict ${VERDICT_BACKGROUND[season.verdict]}`}
                  >
                    {VERDICT_LABELS[season.verdict]} · {season.score}
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Підказує, куди ще поїхати в обраний на сторінці час, щоб шлях не закінчувався тупиком. */
export function MoreIdeas({ places, current, initialMonth }: Props) {
  const params = useSearchParams();
  const period = parsePeriod(params.get("month"), params.get("season")) ?? {
    kind: "month" as const,
    month: initialMonth,
  };

  return <MoreIdeasView places={places} current={current} period={period} />;
}
