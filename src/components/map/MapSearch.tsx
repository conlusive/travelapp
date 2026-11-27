"use client";

import { useId, useState, type KeyboardEvent } from "react";
import type { Suggestion } from "@/lib/explore";

type Props = {
  query: string;
  suggestions: Suggestion[];
  onQuery: (query: string) => void;
  onPick: (suggestion: Suggestion) => void;
};

const ICONS: Record<Suggestion["type"], string> = { region: "◎", country: "⚑", destination: "●" };

export function MapSearch({ query, suggestions, onQuery, onPick }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const expanded = open && query.trim() !== "";
  const active = Math.min(cursor, suggestions.length - 1);

  function pick(suggestion: Suggestion) {
    setOpen(false);
    onPick(suggestion);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (expanded) setOpen(false);
      else onQuery("");
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setCursor(expanded ? (active + step + suggestions.length) % suggestions.length : 0);
    } else if (event.key === "Enter" && expanded) {
      event.preventDefault();
      pick(suggestions[active]);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Напишіть регіон, країну або місто
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="pointer-events-none absolute top-1/2 left-5 z-10 size-5 -translate-y-1/2 text-white/60"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        id={`${listId}-input`}
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="go"
        placeholder="Куди? Європа, Грузія, Лісабон…"
        value={query}
        onChange={(event) => {
          onQuery(event.target.value);
          setCursor(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className="h-14 w-full rounded-full border border-white/15 bg-black/60 pr-12 pl-13 text-base text-white backdrop-blur-xl outline-none placeholder:text-white/55 focus:border-white/60"
      />
      {query && (
        <button
          type="button"
          aria-label="Очистити пошук"
          onClick={() => onQuery("")}
          className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white/70 hover:bg-white/10"
        >
          ✕
        </button>
      )}
      <ul
        id={listId}
        role="listbox"
        aria-label="Підказки"
        hidden={!expanded}
        className="absolute inset-x-0 top-16 z-30 max-h-80 overflow-auto rounded-3xl border border-white/15 bg-[#101215]/95 p-2 text-white shadow-2xl backdrop-blur-xl"
      >
        {suggestions.length === 0 && (
          <li role="presentation" className="px-4 py-3 text-sm text-white/60">
            Такого напрямку поки немає.
          </li>
        )}
        {suggestions.map((suggestion, i) => (
          <li
            key={`${suggestion.type}-${suggestion.id}`}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            // mousedown замість click: інакше blur поля закриє список раніше за вибір.
            onMouseDown={(event) => {
              event.preventDefault();
              pick(suggestion);
            }}
            onMouseEnter={() => setCursor(i)}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2 aria-selected:bg-white/12"
          >
            <span aria-hidden="true" className="w-4 text-center text-white/60">
              {ICONS[suggestion.type]}
            </span>
            <span className="font-semibold">{suggestion.label}</span>
            <span className="ml-auto text-sm text-white/55">{suggestion.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
