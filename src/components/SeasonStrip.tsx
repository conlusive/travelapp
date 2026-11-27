"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { PlaceCard } from "@/data/explorer";
import type { SeasonId } from "@/domain/period";
import type { seasonHighlights } from "@/lib/explore";
import { replaceSearchParams } from "@/lib/url-state";
import { ScrollProgress } from "./ScrollProgress";

type Highlight = ReturnType<typeof seasonHighlights<PlaceCard>>[number];

// Сходинки, як у відео: сусідні картки зміщені по висоті.
const OFFSETS = ["1rem", "-1.5rem", "2rem", "-0.5rem"];

function showOnMap(season: SeasonId) {
  replaceSearchParams({ season, month: null, region: null, country: null });
  document.getElementById("map")?.scrollIntoView();
}

export function SeasonStrip({ highlights }: { highlights: Highlight[] }) {
  return (
    <ScrollProgress mode="enter" className="overflow-hidden bg-ink text-white">
      <section aria-labelledby="when-title" className="mx-auto max-w-6xl px-4 pt-16 pb-24 sm:px-8 sm:pt-24">
        <h2 id="when-title" className="sr-only">
          Коли їхати: оберіть пору року
        </h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-4 md:gap-x-8">
          {highlights.map((item, index) => (
            <li
              key={item.id}
              className="reveal"
              style={{ "--delay": index * 0.09, "--offset": OFFSETS[index] } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => showOnMap(item.id)}
                className="group flex w-full cursor-pointer flex-col items-center"
              >
                <span className="relative block aspect-[2/3] w-full overflow-hidden rounded-3xl">
                  <Image
                    src={item.card.photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    placeholder="blur"
                    blurDataURL={item.card.photo.blur}
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <span className="absolute inset-x-3 bottom-11 flex flex-col text-center sm:bottom-14">
                    <span className="text-lg font-extrabold transition duration-500 group-hover:-translate-y-1 sm:text-xl">
                      {item.when}
                    </span>
                    <span className="text-sm text-white/80">
                      {item.card.name}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="relative z-10 -mt-8 text-6xl leading-none font-extrabold drop-shadow-[0_2px_12px_rgb(0_0_0/0.7)] transition group-hover:-translate-y-2 sm:-mt-10 sm:text-7xl"
                >
                  {item.letter}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p
          className="reveal mx-auto mt-20 max-w-xl text-center text-lg leading-relaxed text-white/75"
          style={{ "--delay": 0.45 } as CSSProperties}
        >
          Один і той самий напрямок буває казковим у жовтні й нестерпним у липні. Оберіть пору року,
          а карта покаже, де тоді найкомфортніша погода.
        </p>
      </section>
    </ScrollProgress>
  );
}
