"use client";

import type { KeyboardEvent } from "react";
import { monthName } from "@/domain/months";
import {
  SEASONAL_MONTH_ORDER,
  SEASONS,
  periodMonths,
  type Period,
  type SeasonId,
} from "@/domain/period";

export type MonthBar = {
  /** Висота стовпчика, 0–100. */
  value: number;
  /** Tailwind-клас кольору стовпчика. */
  color: string;
  /** Опис значення для підказки та скрінрідерів. */
  description: string;
  /** Число над місяцем; не обовʼязкове. */
  label?: string;
};

type Props = {
  /** 12 елементів за календарем: bars[0] — січень. */
  bars: MonthBar[];
  period: Period;
  /** Відсутній у статичному варіанті до гідратації. */
  onChange?: (period: Period) => void;
  /** Чи можна прибрати вибір («Будь-коли»). */
  clearable?: boolean;
  /** dark — на чорному тлі карти; page — у темі сторінки. */
  tone?: "dark" | "page";
  title: string;
  summary: string;
};

const SEASON_ICONS: Record<SeasonId, string> = {
  winter: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5",
  spring: "M12 21v-8M12 13c0-4 2.5-6.5 7-6.5 0 4-2.5 6.5-7 6.5ZM12 15c0-3.2-2-5.2-5.8-5.2 0 3.2 2 5.2 5.8 5.2Z",
  summer: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  autumn: "M5 19c0-9 5-14 15-14 0 10-5 15-12 14M5 21c2-6 5-9 9-11",
};

export function SeasonIcon({ season, className = "size-4" }: { season: SeasonId; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={SEASON_ICONS[season]} />
    </svg>
  );
}

/** Ряд із 12 місяців, згрупованих за порами року: обрати можна і місяць, і всю пору. */
export function SeasonPicker({
  bars,
  period,
  onChange,
  clearable = false,
  tone = "page",
  title,
  summary,
}: Props) {
  const selected = period ? periodMonths(period) : [];
  const start = selected.length ? SEASONAL_MONTH_ORDER.indexOf(selected[0]) : 0;
  const singleMonth = period?.kind === "month";
  const dark = tone === "dark";
  const muted = dark ? "text-white/50" : "text-muted";
  const strong = dark ? "text-white" : "text-foreground";

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-month]");
    if (!step || !button) return;
    event.preventDefault();
    const index = SEASONAL_MONTH_ORDER.indexOf(Number(button.dataset.month));
    const next = SEASONAL_MONTH_ORDER[(index + step + 12) % 12];
    onChange?.({ kind: "month", month: next });
    event.currentTarget.querySelector<HTMLElement>(`[data-month="${next}"]`)?.focus();
  }

  return (
    <div role="group" aria-label={title} className="flex flex-col gap-3">
      <div className="flex min-h-8 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className={`text-sm font-extrabold ${strong}`}>{title}</p>
        {/* На телефоні пояснення переходить під заголовок, а кнопка лишається поруч із ним. */}
        <p role="status" className={`text-xs max-sm:order-last max-sm:basis-full ${muted}`}>
          {summary}
        </p>
        {clearable && (
          <button
            type="button"
            onClick={() => onChange?.(null)}
            aria-pressed={period === null}
            className={`ml-auto min-h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition ${
              dark
                ? "border-white/15 text-white/70 hover:border-white/50 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-black"
                : "border-border text-muted hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent"
            }`}
          >
            Будь-коли
          </button>
        )}
      </div>

      <div onKeyDown={onKeyDown} className="relative">
        {/* Одна підсвітка плавно переїжджає: місяць — лише в ряду місяців, пора року — з назвою. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.3,0.9,0.2,1)] ${
            dark ? "bg-white/10 ring-1 ring-white/30" : "bg-foreground/5 ring-1 ring-foreground/25"
          } ${period ? "opacity-100" : "opacity-0"}`}
          style={{
            top: singleMonth ? "2.5rem" : 0,
            left: `${(start * 100) / 12}%`,
            width: `${(Math.max(selected.length, 1) * 100) / 12}%`,
          }}
        />

        <div className="grid h-10 grid-cols-4">
          {SEASONS.map((season) => {
            const active = period?.kind === "season" && period.season === season.id;
            return (
              <button
                key={season.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange?.({ kind: "season", season: season.id })}
                className={`relative flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition sm:text-sm ${
                  active ? strong : `${muted} ${dark ? "hover:text-white" : "hover:text-foreground"}`
                }`}
              >
                <SeasonIcon season={season.id} className="size-4 max-[360px]:hidden" />
                {season.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-12">
          {SEASONAL_MONTH_ORDER.map((month) => {
            const bar = bars[month - 1];
            const isSelected = selected.includes(month);
            const exact = period?.kind === "month" && period.month === month;
            return (
              <button
                key={month}
                type="button"
                data-month={month}
                aria-pressed={exact}
                aria-label={`${monthName(month).full}: ${bar.description}`}
                title={`${monthName(month).full}: ${bar.description}`}
                onClick={() => onChange?.({ kind: "month", month })}
                className="group relative flex cursor-pointer flex-col items-center gap-1 rounded-xl px-0.5 pt-1 pb-2 focus-visible:outline-2 focus-visible:outline-current"
              >
                <span className={`h-4 text-[10px] font-bold tabular-nums sm:text-xs ${isSelected ? strong : muted}`}>
                  {bar.label}
                </span>
                <span className="flex h-14 w-full items-end justify-center">
                  <span
                    className={`block w-full max-w-5 origin-bottom rounded-full transition-all duration-500 group-hover:scale-y-110 ${bar.color} ${
                      period && !isSelected ? "opacity-40 group-hover:opacity-80" : ""
                    }`}
                    style={{ height: `${Math.max(10, bar.value)}%` }}
                  />
                </span>
                <span className={`text-[10px] sm:text-xs ${isSelected ? `font-extrabold ${strong}` : muted}`}>
                  {monthName(month).short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
