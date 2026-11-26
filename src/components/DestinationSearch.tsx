"use client";

import Link from "next/link";
import { useState } from "react";
import { matchesQuery } from "@/lib/search";

export type DestinationCard = {
  href: string;
  name: string;
  countryName: string;
  summary: string;
  searchFields: string[];
};

export function DestinationSearch({ cards }: { cards: DestinationCard[] }) {
  const [query, setQuery] = useState("");
  const visible = cards.filter((card) => matchesQuery(query, card.searchFields));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="destination-search" className="sr-only">
          Пошук країни або місця
        </label>
        <input
          id="destination-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Країна або місто: Грузія, Лісабон…"
          autoComplete="off"
          className="min-h-12 w-full max-w-xl rounded-xl border border-border bg-surface px-4 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <p role="status" className="sr-only">
          Знайдено напрямків: {visible.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-muted">
          Такого напрямку поки немає. Спробуйте іншу назву.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className="flex h-full flex-col gap-1 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent"
              >
                <span className="text-sm text-muted">{card.countryName}</span>
                <span className="text-lg font-semibold">{card.name}</span>
                <span className="mt-2 text-sm text-muted">{card.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
