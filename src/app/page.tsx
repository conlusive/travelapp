import { Suspense } from "react";
import { ClimateAttribution } from "@/components/ClimateAttribution";
import {
  DestinationSearch,
  DestinationSearchView,
  type DestinationCard,
} from "@/components/DestinationSearch";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getCountry, getSeason, listDestinations, type MonthSeason } from "@/data/catalog";
import { monthName } from "@/domain/months";
import { bestMonths } from "@/domain/season";
import type { Destination } from "@/domain/types";

function summarize(destination: Destination, season: MonthSeason[]): string {
  if (destination.climateCaveat) return "Кліматичні дані уточнюємо";
  const months = bestMonths(season);
  if (months.length === 0) return "Погода непроста цілий рік";
  return `Найкраща погода: ${months.map((m) => monthName(m).full.toLowerCase()).join(", ")}`;
}

function buildCards(): DestinationCard[] {
  return listDestinations().map((destination) => {
    const country = getCountry(destination.countrySlug);
    if (!country) throw new Error(`Unknown country "${destination.countrySlug}"`);
    const season = getSeason(destination.slug);
    return {
      href: `/${country.slug}/${destination.slug}`,
      name: destination.name,
      countryName: country.name,
      summary: summarize(destination, season),
      months: season.map(({ score, verdict }) => ({ score, verdict })),
      unreliable: destination.climateCaveat ?? false,
      searchFields: [destination.name, destination.slug, country.name, country.slug],
    };
  });
}

export default function Home() {
  const cards = buildCards();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-10 sm:px-6 sm:py-16">
      <section className="flex flex-col gap-6">
        <h1 className="max-w-3xl text-4xl leading-tight font-bold sm:text-5xl">
          Куди й коли поїхати
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Оберіть місяць і дізнайтеся, де буде найкомфортніше, або знайдіть напрямок: сезон, місця,
          дорога з Києва, Львова чи Варшави та візові умови.
        </p>
        {/* До гідратації показуємо повний список: він потрібен і пошуковикам. */}
        <Suspense
          fallback={
            <DestinationSearchView cards={cards} query="" month={null} onChange={undefined} />
          }
        >
          <DestinationSearch cards={cards} />
        </Suspense>
      </section>

      <section
        aria-labelledby="waitlist-title"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 id="waitlist-title" className="text-2xl font-bold">
          Отримайте ранній доступ
        </h2>
        <p className="max-w-2xl text-muted">
          Напишемо, коли додамо перевірені ціни й нові напрямки.
        </p>
        <SubscribeForm />
      </section>

      <footer className="border-t border-border pt-6">
        <ClimateAttribution />
      </footer>
    </main>
  );
}
