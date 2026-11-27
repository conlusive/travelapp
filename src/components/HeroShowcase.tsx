"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { PlaceCard } from "@/data/explorer";
import { ScrollProgress } from "./ScrollProgress";

const SLIDE_MS = 6500;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

const number = (index: number) => String(index + 1).padStart(2, "0");

export function HeroShowcase({ slides }: { slides: PlaceCard[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const reducedMotion = useReducedMotion();
  const playing = !paused && !held && !reducedMotion;
  const count = slides.length;
  const slide = slides[index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, count]);

  // Тримаємо в DOM лише сусідні фото, щоб не вантажити всі одразу.
  const nearby = new Set([index, (index + 1) % count, (index - 1 + count) % count]);
  const upcoming = [1, 2, 3].map((step) => (index + step) % count);

  return (
    <ScrollProgress mode="exit" className="relative h-svh min-h-[36rem] overflow-hidden bg-ink">
      <section aria-roledescription="карусель" aria-label="Напрямки" className="absolute inset-0 text-white">
        <h1 className="sr-only">SeasonWise: куди й коли поїхати</h1>

        <div className="parallax-media absolute inset-0">
          {slides.map((item, i) =>
            nearby.has(i) ? (
              <div
                key={item.slug}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
              >
                <Image
                  src={item.photo.src}
                  alt={i === index ? `${item.name}, ${item.countryName}` : ""}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  placeholder="blur"
                  blurDataURL={item.photo.blur}
                  className={`object-cover ${i === index ? "animate-ken-burns" : ""}`}
                />
              </div>
            ) : null,
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-ink" />
        {/* Затемнення за центром: білий текст читається на будь-якому фото. */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_48%,rgb(0_0_0/0.45),transparent_75%)]" />
        <div className="parallax-shade absolute inset-0 bg-ink" />

        <div
          className="parallax-content absolute inset-0 flex flex-col items-center justify-center px-4 pb-24 text-center"
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <div key={slide.slug} aria-live={playing ? "off" : "polite"} className="flex flex-col items-center">
            <p className="animate-rise text-sm font-semibold tracking-[0.35em] uppercase [animation-delay:80ms]">
              {slide.countryName}
            </p>
            <p className="mt-3 max-w-full animate-rise text-[clamp(2.75rem,11vw,10rem)] leading-[1.1] font-extrabold tracking-tight text-balance drop-shadow-[0_4px_30px_rgb(0_0_0/0.35)] [animation-delay:160ms]">
              {slide.name}.
            </p>
            <p className="mt-4 max-w-xl animate-rise text-base font-medium text-white drop-shadow-[0_1px_8px_rgb(0_0_0/0.8)] [animation-delay:300ms] sm:text-lg">
              {slide.summary}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={slide.href}
              className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-bold text-black transition hover:scale-[1.03]"
            >
              Коли їхати
            </Link>
            <a
              href="#map"
              className="inline-flex min-h-12 items-center rounded-full border border-white/40 bg-black/40 px-6 font-bold backdrop-blur transition hover:bg-black/70"
            >
              Обрати на карті
            </a>
          </div>
        </div>

        <div className="parallax-content absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-6 sm:px-8">
          <div className="flex flex-col gap-3">
            <p className="flex items-baseline gap-1 font-extrabold" aria-live="off">
              <span className="text-5xl sm:text-6xl">{number(index)}</span>
              <span className="text-sm text-white/60">/ {number(count - 1)}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Увімкнути показ фото" : "Зупинити показ фото"}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/30 backdrop-blur hover:bg-black/60"
              >
                <span aria-hidden="true">{paused || reducedMotion ? "▶" : "❚❚"}</span>
              </button>
              <ul className="flex gap-1.5">
                {slides.map((item, i) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Показати: ${item.name}`}
                      aria-current={i === index}
                      className="flex h-11 w-7 cursor-pointer items-center sm:w-10"
                    >
                      <span className="block h-0.5 w-full overflow-hidden rounded bg-white/30">
                        {i === index && (
                          <span
                            key={`${index}-${playing}`}
                            className={`block h-full origin-left bg-white ${playing ? "animate-progress" : ""}`}
                            style={{ animationDuration: `${SLIDE_MS}ms` }}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="hidden gap-3 lg:flex" aria-label="Наступні напрямки">
            {upcoming.map((i) => (
              <li key={slides[i].slug} className="animate-pop">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group relative block h-28 w-40 cursor-pointer overflow-hidden rounded-2xl text-left ring-1 ring-white/20 transition hover:-translate-y-2 xl:h-32 xl:w-48"
                >
                  <Image
                    src={slides[i].photo.src}
                    alt=""
                    fill
                    sizes="192px"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <span className="absolute top-1 right-3 text-3xl font-extrabold text-white/90">
                    {number(i)}
                  </span>
                  <span className="absolute bottom-2 left-3 text-sm font-bold">{slides[i].name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="absolute top-20 right-4 text-[11px] text-white/55 sm:right-8">
          Фото: {slide.photo.author} · {slide.photo.license}
        </p>
      </section>
    </ScrollProgress>
  );
}
