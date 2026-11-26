"use client";

import { useState } from "react";
import type { MonthSeason } from "@/data/catalog";
import { monthName } from "@/domain/months";
import { VERDICT_LABELS } from "@/domain/season";
import { VerdictLegend } from "./VerdictLegend";
import { VERDICT_BACKGROUND } from "./verdict-styles";

type Props = {
  season: MonthSeason[];
  initialMonth: number;
};

function formatTemperature(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} °C`;
}

export function SeasonCalendar({ season, initialMonth }: Props) {
  const [selected, setSelected] = useState(initialMonth);
  const current = season.find((item) => item.climate.month === selected) ?? season[0];
  const { climate } = current;

  const facts = [
    { label: "Вдень", value: formatTemperature(climate.avgMaxC) },
    { label: "Вночі", value: formatTemperature(climate.avgMinC) },
    { label: "Опади", value: `${climate.precipitationMm} мм` },
    { label: "Дощових днів", value: `≈ ${Math.round(climate.rainDays)}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <ul className="grid grid-cols-6 gap-2 sm:grid-cols-12" aria-label="Календар сезонів">
          {season.map((item) => {
            const month = item.climate.month;
            const isSelected = month === selected;
            return (
              <li key={month}>
                <button
                  type="button"
                  onClick={() => setSelected(month)}
                  aria-pressed={isSelected}
                  aria-label={`${monthName(month).full}: ${VERDICT_LABELS[item.verdict]}`}
                  className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span
                    className={`flex h-12 w-full items-center justify-center rounded-lg text-sm font-semibold text-on-verdict ${VERDICT_BACKGROUND[item.verdict]} ${
                      isSelected ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface" : ""
                    }`}
                  >
                    {item.score}
                  </span>
                  <span className={`text-xs ${isSelected ? "font-semibold" : "text-muted"}`}>
                    {monthName(month).short}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4">
          <VerdictLegend />
        </div>
      </div>

      <section
        aria-live="polite"
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
      >
        <h3 className="flex flex-wrap items-center gap-3 text-lg font-semibold">
          {monthName(climate.month).full}
          <span
            className={`rounded-full px-3 py-0.5 text-sm text-on-verdict ${VERDICT_BACKGROUND[current.verdict]}`}
          >
            {VERDICT_LABELS[current.verdict]} · {current.score}/100
          </span>
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-muted">{fact.label}</dt>
              <dd className="text-2xl font-bold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
