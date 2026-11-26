"use client";

import { useState } from "react";
import { ATTRACTION_CATEGORIES, type Attraction, type AttractionCategory } from "@/domain/content";
import { formatVisitDuration } from "@/lib/format";
import { mapSearchUrl } from "@/lib/links";
import { SourceLink } from "./SourceLink";

export function AttractionList({ attractions, city }: { attractions: Attraction[]; city: string }) {
  const [category, setCategory] = useState<AttractionCategory | null>(null);
  const present = (Object.keys(ATTRACTION_CATEGORIES) as AttractionCategory[]).filter((key) =>
    attractions.some((attraction) => attraction.category === key),
  );
  const visible = category ? attractions.filter((a) => a.category === category) : attractions;

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Тип місця" className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {[null, ...present].map((key) => (
          <button
            key={key ?? "all"}
            type="button"
            aria-pressed={category === key}
            onClick={() => setCategory(key)}
            className="min-h-11 shrink-0 cursor-pointer rounded-full border border-border bg-surface px-4 text-sm transition hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-on-accent"
          >
            {key ? ATTRACTION_CATEGORIES[key] : `Усі (${attractions.length})`}
          </button>
        ))}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {visible.map((attraction) => (
          <li
            key={attraction.name}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5"
          >
            <div>
              <h3 className="font-semibold">{attraction.name}</h3>
              <p lang="und" className="text-sm text-muted">
                {attraction.localName}
              </p>
            </div>
            <p className="flex flex-wrap gap-x-3 text-sm">
              <span>{formatVisitDuration(attraction.visitMinutes)}</span>
              {attraction.price && <span className="font-semibold">{attraction.price.text}</span>}
            </p>
            {attraction.warning && (
              <p className="rounded-lg bg-verdict-meh/15 px-3 py-2 text-sm">
                {attraction.warning.text}
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
              <a
                href={mapSearchUrl(`${attraction.localName}, ${city}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline"
              >
                На карті ↗
              </a>
              <SourceLink source={attraction.price?.source ?? attraction.source} />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">
        Тривалість візиту — наша орієнтовна оцінка. Ціну показуємо, лише якщо бачили її на
        офіційному сайті.
      </p>
    </div>
  );
}
