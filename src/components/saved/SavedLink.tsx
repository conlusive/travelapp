"use client";

import Link from "next/link";
import { HeartIcon } from "./SaveButton";
import { useSaved } from "./useSaved";

/** Пункт меню з лічильником збережених напрямків. */
export function SavedLink() {
  const { saved } = useSaved();
  const count = saved.length;

  return (
    <Link
      href="/saved"
      aria-label={`Обране: ${count}`}
      className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-white/80 hover:text-white"
    >
      <HeartIcon filled={count > 0} className="size-4" />
      <span className="max-sm:hidden">Обране</span>
      {count > 0 && (
        <span
          key={count}
          className="flex h-5 min-w-5 animate-beat items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-black"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
