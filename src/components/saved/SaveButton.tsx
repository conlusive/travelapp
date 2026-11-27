"use client";

import { useSaved } from "./useSaved";

type Props = {
  slug: string;
  name: string;
  /** pill — кнопка з текстом; icon — лише сердечко поверх фото чи в списку. */
  variant?: "pill" | "icon";
  className?: string;
};

export function HeartIcon({ filled, className = "size-5" }: { filled: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.9 1.2-1.8 2.8-2.9 4.8-2.9 3.4 0 5.5 3.3 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
    </svg>
  );
}

export function SaveButton({ slug, name, variant = "icon", className = "" }: Props) {
  const { saved, toggle } = useSaved();
  const active = saved.includes(slug);
  const label = active ? `Прибрати з обраного: ${name}` : `Хочу поїхати: ${name}`;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => toggle(slug)}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-bold transition active:scale-90 ${
        variant === "pill"
          ? "min-h-11 border border-white/40 bg-black/40 px-5 text-sm text-white backdrop-blur hover:bg-black/70 aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-black"
          : "size-11 bg-black/45 text-white backdrop-blur hover:bg-black/75 aria-pressed:bg-white aria-pressed:text-[#e5484d]"
      } ${className}`}
    >
      {/* key перезапускає анімацію «стрибка» під час кожної зміни. */}
      <span key={String(active)} className={`inline-flex ${active ? "animate-beat" : ""}`}>
        <HeartIcon filled={active} />
      </span>
      {variant === "pill" && <span aria-hidden="true">{active ? "В обраному" : "Хочу поїхати"}</span>}
    </button>
  );
}
