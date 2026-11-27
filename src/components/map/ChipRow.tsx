"use client";

import { useEffect, useRef } from "react";

type Props<T> = {
  label: string;
  options: { value: T; text: string }[];
  selected: T;
  onSelect?: (value: T) => void;
  className?: string;
};

/** Ряд кнопок-перемикачів на темному тлі з горизонтальною прокруткою. */
export function ChipRow<T extends string | number | null>({
  label,
  options,
  selected,
  onSelect,
  className = "",
}: Props<T>) {
  const list = useRef<HTMLDivElement>(null);

  // Обраний пункт має бути видно, коли ряд не вміщується на екрані.
  useEffect(() => {
    const row = list.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip) return;
    const offset = chip.getBoundingClientRect().left - row.getBoundingClientRect().left;
    row.scrollLeft += offset - (row.clientWidth - chip.offsetWidth) / 2;
  }, [selected]);

  return (
    <div
      ref={list}
      role="group"
      aria-label={label}
      className={`flex gap-2 overflow-x-auto [scrollbar-width:none] ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value ?? "any"}
          type="button"
          aria-pressed={selected === option.value}
          onClick={() => onSelect?.(option.value)}
          className="min-h-10 shrink-0 cursor-pointer rounded-full border border-white/15 bg-black/55 px-4 text-sm font-semibold text-white/85 backdrop-blur-md transition hover:border-white/50 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-black"
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}
