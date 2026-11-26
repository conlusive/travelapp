"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { MONTH_NAMES, monthName } from "@/domain/months";
import { VERDICT_LABELS } from "@/domain/season";
import { filterDestinations, parseMonth, type FilterableCard } from "@/lib/destination-filter";
import { replaceSearchParams } from "@/lib/url-state";
import { VERDICT_BACKGROUND } from "./verdict-styles";

export type DestinationCard = FilterableCard & {
  href: string;
  countryName: string;
  summary: string;
};

type ViewProps = {
  cards: DestinationCard[];
  query: string;
  month: number | null;
  /** Відсутній у статичному варіанті до гідратації. */
  onChange?: (next: { q?: string; month?: number | null }) => void;
};

export function DestinationSearchView({ cards, query, month, onChange }: ViewProps) {
  const visible = filterDestinations(cards, query, month);
  const monthList = useRef<HTMLDivElement>(null);

  // На телефоні місяці прокручуються горизонтально: обраний має бути видно.
  useEffect(() => {
    const list = monthList.current;
    const chip = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!list || !chip) return;
    const offset = chip.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollLeft += offset - (list.clientWidth - chip.offsetWidth) / 2;
  }, [month]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <label htmlFor="destination-search" className="sr-only">
          Пошук країни або місця
        </label>
        <input
          id="destination-search"
          type="search"
          value={query}
          readOnly={!onChange}
          onChange={(event) => onChange?.({ q: event.target.value })}
          placeholder="Країна або місто: Грузія, Лісабон…"
          autoComplete="off"
          className="min-h-12 w-full max-w-xl rounded-xl border border-border bg-surface px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Коли плануєте їхати?</legend>
          <div ref={monthList} className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
            {[null, ...MONTH_NAMES.map((_, i) => i + 1)].map((value) => (
              <button
                key={value ?? "any"}
                type="button"
                aria-pressed={month === value}
                onClick={() => onChange?.({ month: value })}
                className="min-h-11 shrink-0 cursor-pointer rounded-full border border-border bg-surface px-4 text-sm transition hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-on-accent"
              >
                {value === null ? "Будь-коли" : monthName(value).full}
              </button>
            ))}
          </div>
        </fieldset>
        <p role="status" className="text-sm text-muted">
          {month === null
            ? `Напрямків: ${visible.length}`
            : `${monthName(month).full}: від найкомфортнішої погоди. Напрямків: ${visible.length}`}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-6">
          <p className="text-muted">Такого напрямку поки немає. Спробуйте іншу назву.</p>
          <button
            type="button"
            onClick={() => onChange?.({ q: "" })}
            className="cursor-pointer font-semibold text-accent hover:underline"
          >
            Показати всі
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((card) => {
            const season = month === null ? null : card.months[month - 1];
            return (
              <li key={card.href}>
                <Link
                  href={month === null ? card.href : `${card.href}?month=${month}`}
                  className="flex h-full flex-col gap-1 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent"
                >
                  <span className="text-sm text-muted">{card.countryName}</span>
                  <span className="text-lg font-semibold">{card.name}</span>
                  {season && !card.unreliable ? (
                    <span
                      className={`mt-2 self-start rounded-full px-3 py-0.5 text-sm font-semibold text-on-verdict ${VERDICT_BACKGROUND[season.verdict]}`}
                    >
                      {VERDICT_LABELS[season.verdict]} · {season.score}/100
                    </span>
                  ) : (
                    <span className="mt-2 text-sm text-muted">{card.summary}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Пошук і місяць живуть в адресі: нею можна поділитися, а «назад» не губить вибір. */
export function DestinationSearch({ cards }: { cards: DestinationCard[] }) {
  const params = useSearchParams();

  return (
    <DestinationSearchView
      cards={cards}
      query={params.get("q") ?? ""}
      month={parseMonth(params.get("month"))}
      onChange={replaceSearchParams}
    />
  );
}
