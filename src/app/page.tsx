import { Suspense } from "react";
import { HeroShowcase } from "@/components/HeroShowcase";
import { MapExplorer, MapExplorerView } from "@/components/map/MapExplorer";
import { SeasonStrip } from "@/components/SeasonStrip";
import { SubscribeForm } from "@/components/SubscribeForm";
import { listMapCountries, listMapRegions, listPlaceCards } from "@/data/explorer";
import { seasonHighlights } from "@/lib/explore";

// Напрямки з виразними фото для головного екрана.
const HERO_SLUGS = ["dubrovnik", "ubud", "tokyo", "rome", "cancun"];

export default function Home() {
  const places = listPlaceCards();
  const map = { places, countries: listMapCountries(), regions: listMapRegions() };
  const slides = HERO_SLUGS.map((slug) => {
    const place = places.find((item) => item.slug === slug);
    if (!place) throw new Error(`Unknown hero destination "${slug}"`);
    return place;
  });

  return (
    <main className="flex flex-1 flex-col">
      <HeroShowcase slides={slides} />
      <SeasonStrip highlights={seasonHighlights(places)} />

      <section id="map" aria-labelledby="map-title" className="bg-ink px-3 pb-16 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 pt-10 text-white">
          <div className="flex flex-col gap-2 px-2">
            <h2 id="map-title" className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Куди поїхати?
            </h2>
            <p className="max-w-xl text-white/65">
              Напишіть назву або клацайте по карті: від світу до регіону, країни й міста. Місяць
              унизу перефарбовує точки за погодою.
            </p>
          </div>
          {/* До гідратації показуємо повний список: він потрібен і пошуковикам. */}
          <Suspense
            fallback={
              <MapExplorerView {...map} selection={{ region: null, country: null }} month={null} />
            }
          >
            <MapExplorer {...map} />
          </Suspense>
        </div>
      </section>

      <section
        id="subscribe"
        aria-labelledby="subscribe-title"
        className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-20 sm:px-8"
      >
        <div className="flex flex-col gap-5 rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-14 sm:py-16">
          <h2 id="subscribe-title" className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Підпишіться й дізнайтеся першими про нові напрямки
          </h2>
          <p className="max-w-xl text-white/65">
            Напишемо, коли додамо перевірені ціни, готелі та більше міст.
          </p>
          <SubscribeForm />
        </div>
      </section>
    </main>
  );
}
