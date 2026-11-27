"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { CompareItem } from "@/data/compare";
import { monthName } from "@/domain/months";
import {
  assessPeriod,
  averageClimate,
  parsePeriod,
  periodName,
  periodParams,
  periodQuery,
  seasonOfMonth,
  type Period,
  type SeasonId,
} from "@/domain/period";
import { VERDICT_LABELS, bestMonths } from "@/domain/season";
import { formatTemperature } from "@/lib/format";
import { MAX_COMPARED, parseCompare, toggleCompare } from "@/lib/saved";
import { replaceSearchParams } from "@/lib/url-state";
import { PhotoCard } from "../PhotoCard";
import { SeasonPicker, type MonthBar } from "../SeasonPicker";
import { VERDICT_BACKGROUND } from "../verdict-styles";
import { useSaved } from "./useSaved";

const SEASON_BARS: Record<SeasonId, string> = {
  winter: "bg-season-winter",
  spring: "bg-season-spring",
  summer: "bg-season-summer",
  autumn: "bg-season-autumn",
};

const PENDING = <span className="text-muted">ще перевіряємо</span>;

function temperatureRange(values: number[]): string {
  return `${formatTemperature(Math.min(...values))} … ${formatTemperature(Math.max(...values))}`;
}

function bestMonthNames(item: CompareItem): string {
  const months = bestMonths(item.months.map((m, i) => ({ ...m, climate: { month: i + 1 } })));
  return months.length
    ? months.map((month) => monthName(month).full.toLowerCase()).join(", ")
    : "немає";
}

function compareRows(period: Period): { label: string; value: (item: CompareItem) => ReactNode }[] {
  const climate = (item: CompareItem) => (period ? averageClimate(item.climate, period) : null);

  return [
    {
      label: period ? `Погода: ${periodName(period).toLowerCase()}` : "Найкращі місяці",
      value: (item) => {
        if (item.unreliable) return <span className="text-muted">дані уточнюємо</span>;
        if (!period) return bestMonthNames(item);
        const { score, verdict } = assessPeriod(item.months, period);
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-bold whitespace-nowrap text-on-verdict ${VERDICT_BACKGROUND[verdict]}`}
          >
            {VERDICT_LABELS[verdict]} · {score}
          </span>
        );
      },
    },
    {
      label: "Вдень",
      value: (item) =>
        climate(item)
          ? formatTemperature(climate(item)!.avgMaxC)
          : temperatureRange(item.climate.map((m) => m.avgMaxC)),
    },
    {
      label: "Вночі",
      value: (item) =>
        climate(item)
          ? formatTemperature(climate(item)!.avgMinC)
          : temperatureRange(item.climate.map((m) => m.avgMinC)),
    },
    {
      label: period ? "Дощових днів на місяць" : "Дощових днів на рік",
      value: (item) =>
        `≈ ${Math.round(climate(item)?.rainDays ?? item.climate.reduce((sum, m) => sum + m.rainDays, 0))}`,
    },
    { label: "Валюта", value: (item) => item.currency },
    {
      label: "Транспорт",
      value: (item) =>
        item.fare ? (
          <>
            <strong>{item.fare.price}</strong>
            <span className="block text-xs text-muted">{item.fare.label}</span>
          </>
        ) : (
          PENDING
        ),
    },
    { label: "Вʼїзд для українців", value: (item) => item.entry ?? PENDING },
    { label: "Перевірених місць", value: (item) => item.sights ?? PENDING },
  ];
}

type ViewProps = {
  items: CompareItem[];
  saved: string[];
  compared: string[];
  period: Period;
};

function SavedBoardView({ items, saved, compared, period }: ViewProps) {
  const [copied, setCopied] = useState(false);
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  const savedItems = saved.flatMap((slug) => bySlug.get(slug) ?? []);
  const columns = compared.flatMap((slug) => bySlug.get(slug) ?? []);

  // Висота стовпчика — середня оцінка напрямків, що порівнюються.
  const bars: MonthBar[] = Array.from({ length: 12 }, (_, index) => {
    const source = columns.length ? columns : savedItems;
    const score = source.length
      ? Math.round(source.reduce((sum, item) => sum + item.months[index].score, 0) / source.length)
      : 0;
    return {
      value: score,
      color: SEASON_BARS[seasonOfMonth(index + 1)],
      description: source.length ? `середня оцінка погоди ${score} зі 100` : "нічого не обрано",
    };
  });

  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("compare", compared.join(","));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Буфер обміну недоступний: адреса з порівнянням лишається в рядку браузера.
      window.history.replaceState(null, "", url);
    }
  }

  if (savedItems.length === 0 && columns.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border px-6 py-20 text-center">
        <p aria-hidden="true" className="animate-beat text-6xl">
          ♡
        </p>
        <h2 className="text-2xl font-extrabold">Тут будуть місця, куди ви хочете поїхати</h2>
        <p className="max-w-md text-muted">
          Натискайте на сердечко біля напрямку на карті чи на його сторінці. Потім тут можна
          порівняти до трьох місць поруч.
        </p>
        <Link
          href="/#map"
          className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-bold text-on-accent transition hover:scale-105"
        >
          Відкрити карту
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {savedItems.length > 0 && (
        <section aria-labelledby="saved-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="saved-title" className="text-3xl font-extrabold tracking-tight">
              Ваш список
            </h2>
            <p className="text-sm text-muted">Зберігається лише в цьому браузері.</p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {savedItems.map((item) => {
              const checked = compared.includes(item.slug);
              return (
                <li key={item.slug} className="flex animate-swap flex-col gap-2">
                  <PhotoCard
                    slug={item.slug}
                    href={`${item.href}${periodQuery(period)}`}
                    title={item.name}
                    text={item.countryName}
                    photo={item.photo}
                  />
                  <button
                    type="button"
                    aria-pressed={checked}
                    onClick={() =>
                      replaceSearchParams({
                        compare: toggleCompare(compared, item.slug).join(",") || "none",
                      })
                    }
                    className="min-h-11 cursor-pointer rounded-full border border-border text-sm font-bold transition hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent"
                  >
                    {checked ? "✓ У порівнянні" : "Порівняти"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="compare-title" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="compare-title" className="text-3xl font-extrabold tracking-tight">
            Порівняння
          </h2>
          {columns.length > 0 && (
            <button
              type="button"
              onClick={share}
              className="min-h-11 cursor-pointer rounded-full border border-border px-5 text-sm font-bold transition hover:border-accent"
            >
              <span role="status">{copied ? "Посилання скопійовано ✓" : "Поділитися порівнянням"}</span>
            </button>
          )}
        </div>

        {columns.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border p-6 text-muted">
            Позначте «Порівняти» під напрямками зі списку — до {MAX_COMPARED} місць.
          </p>
        ) : (
          <>
            <div className="rounded-3xl border border-border bg-surface p-3 sm:p-5">
              <SeasonPicker
                clearable
                title="Коли порівнюємо?"
                summary={period ? periodName(period) : "Увесь рік"}
                bars={bars}
                period={period}
                onChange={(next) => replaceSearchParams(periodParams(next))}
              />
            </div>
            <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
              {/* Мінімальна ширина росте з кількістю колонок; підписи рядків лишаються на місці. */}
              <table
                className="w-full table-fixed text-left"
                style={{ minWidth: `${7 + columns.length * 9.5}rem` }}
              >
                <thead>
                  <tr>
                    <td className="sticky left-0 z-10 w-28 bg-surface p-3 sm:w-44 sm:p-4" />
                    {columns.map((item) => (
                      <th key={item.slug} scope="col" className="animate-swap p-3 align-top sm:p-4">
                        <Link
                          href={`${item.href}${periodQuery(period)}`}
                          className="text-xl font-extrabold underline-offset-4 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <span className="block text-sm font-medium text-muted">{item.countryName}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows(period).map((row) => (
                    <tr key={row.label} className="border-t border-border align-top transition hover:bg-foreground/[0.03]">
                      <th scope="row" className="sticky left-0 z-10 bg-surface p-3 text-sm font-semibold text-muted sm:p-4">
                        {row.label}
                      </th>
                      {columns.map((item) => (
                        <td key={item.slug} className="p-3 break-words sm:p-4">
                          {row.value(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted">
              Погода — середні за 2016–2025 роки; оцінка враховує лише температуру й дощ.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

/** Порівняння й період живуть в адресі, щоб ним можна було поділитися. */
export function SavedBoard({ items }: { items: CompareItem[] }) {
  const params = useSearchParams();
  const { saved } = useSaved();
  const known = new Set(items.map((item) => item.slug));
  const raw = params.get("compare");
  // Без параметра порівнюємо перші збережені; «none» — користувач прибрав усе сам.
  const compared =
    raw === null ? saved.filter((slug) => known.has(slug)).slice(0, MAX_COMPARED) : parseCompare(raw, known);

  return (
    <SavedBoardView
      items={items}
      saved={saved}
      compared={compared}
      period={parsePeriod(params.get("month"), params.get("season"))}
    />
  );
}
