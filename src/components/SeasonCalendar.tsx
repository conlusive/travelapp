"use client";

import { useSearchParams } from "next/navigation";
import type { MonthSeason } from "@/data/catalog";
import {
  assessPeriod,
  averageClimate,
  parsePeriod,
  periodMonths,
  periodName,
  periodParams,
  type Period,
} from "@/domain/period";
import { VERDICT_LABELS } from "@/domain/season";
import { formatTemperature } from "@/lib/format";
import { replaceSearchParams } from "@/lib/url-state";
import { SeasonPicker, type MonthBar } from "./SeasonPicker";
import { VerdictLegend } from "./VerdictLegend";
import { VERDICT_BACKGROUND } from "./verdict-styles";

type ViewProps = {
  season: MonthSeason[];
  period: NonNullable<Period>;
  /** Відсутній у статичному варіанті до гідратації. */
  onChange?: (period: Period) => void;
};

export function SeasonCalendarView({ season, period, onChange }: ViewProps) {
  const climate = averageClimate(
    season.map((item) => item.climate),
    period,
  );
  const { score, verdict } = assessPeriod(season, period);
  const isSeason = periodMonths(period).length > 1;

  const bars: MonthBar[] = season.map((item) => ({
    value: item.score,
    label: String(item.score),
    color: VERDICT_BACKGROUND[item.verdict],
    description: `${VERDICT_LABELS[item.verdict]}, ${item.score} зі 100`,
  }));

  const facts = [
    { label: "Вдень", value: formatTemperature(climate.avgMaxC) },
    { label: "Вночі", value: formatTemperature(climate.avgMinC) },
    { label: "Опади за місяць", value: `${climate.precipitationMm} мм` },
    { label: "Дощових днів", value: `≈ ${Math.round(climate.rainDays)}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-border bg-surface p-3 sm:p-5">
        <SeasonPicker
          bars={bars}
          period={period}
          onChange={onChange}
          title="Коли їдете?"
          summary="Оберіть місяць або пору року"
        />
        <div className="mt-3">
          <VerdictLegend />
        </div>
      </div>

      <section aria-live="polite" className="rounded-3xl border border-border bg-surface p-5">
        <h3 className="flex flex-wrap items-center gap-3 text-lg font-extrabold">
          {periodName(period)}
          <span
            className={`rounded-full px-3 py-0.5 text-sm text-on-verdict transition-colors duration-500 ${VERDICT_BACKGROUND[verdict]}`}
          >
            {VERDICT_LABELS[verdict]} · {score}/100
          </span>
          {isSeason && <span className="text-sm font-medium text-muted">у середньому за три місяці</span>}
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-muted">{fact.label}</dt>
              {/* key перезапускає анімацію, коли значення змінюється. */}
              <dd key={fact.value} className="animate-swap text-2xl font-extrabold sm:text-3xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/** Обраний місяць чи пора року зберігаються в адресі: «Лісабон у квітні» — це посилання. */
export function SeasonCalendar({
  season,
  initialMonth,
}: {
  season: MonthSeason[];
  initialMonth: number;
}) {
  const params = useSearchParams();

  return (
    <SeasonCalendarView
      season={season}
      period={
        parsePeriod(params.get("month"), params.get("season")) ?? {
          kind: "month",
          month: initialMonth,
        }
      }
      onChange={(period) => replaceSearchParams(periodParams(period))}
    />
  );
}
