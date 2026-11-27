"use client";

import { useSyncExternalStore } from "react";
import { ORIGINS, type DestinationContent, type OriginId } from "@/domain/content";
import { rome2rioUrl } from "@/lib/links";
import { SourceLink } from "./SourceLink";
import { ExternalButton } from "./ui";

const STORAGE_KEY = "seasonwise:origin";
const CHANGE_EVENT = "seasonwise:origin-change";
const DEFAULT_ORIGIN: OriginId = "kyiv";

// Памʼятаємо місто лише в цій вкладці, якщо сховище недоступне (приватний режим).
let fallback: string | null = null;

function readOrigin(): OriginId {
  let stored = fallback;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY) ?? fallback;
  } catch {
    // Сховище заблоковане: лишається значення з памʼяті.
  }
  return ORIGINS.find((origin) => origin.id === stored)?.id ?? DEFAULT_ORIGIN;
}

function saveOrigin(origin: OriginId) {
  fallback = origin;
  try {
    window.localStorage.setItem(STORAGE_KEY, origin);
  } catch {
    // Сховище заблоковане: лишається значення з памʼяті.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

type Props = {
  routes: DestinationContent["routes"] | null;
  destinationName: string;
  destinationSearchName: string;
};

export function RouteFinder({ routes, destinationName, destinationSearchName }: Props) {
  const originId = useSyncExternalStore(subscribe, readOrigin, () => DEFAULT_ORIGIN);
  const origin = ORIGINS.find((item) => item.id === originId) ?? ORIGINS[0];
  const options = routes?.[origin.id];

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Місто вирушення" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted">Звідки:</span>
        {ORIGINS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === origin.id}
            onClick={() => saveOrigin(item.id)}
            className="min-h-11 cursor-pointer rounded-full border border-border bg-surface px-4 text-sm transition hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-on-accent"
          >
            {item.name}
          </button>
        ))}
      </div>

      {options ? (
        <ul className="divide-y divide-border rounded-3xl border border-border bg-surface">
          {options.map((option) => (
            <li key={option.text} className="flex flex-col gap-1 p-4">
              <p>{option.text}</p>
              {option.source && <SourceLink source={option.source} />}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-border p-5 text-sm text-muted">
          Описаного маршруту ще немає. Актуальні варіанти — за посиланням нижче.
        </p>
      )}

      <ExternalButton href={rome2rioUrl(origin.searchName, destinationSearchName)}>
        {origin.name} → {destinationName}: живі варіанти й ціни
      </ExternalButton>
      {options && (
        <p className="text-xs text-muted">
          Тривалості — оцінки агрегатора без черг на кордоні. Розклад і сезонність перевіряйте в
          перевізника.
        </p>
      )}
    </div>
  );
}
