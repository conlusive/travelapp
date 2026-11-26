import { ClimateAttribution } from "@/components/ClimateAttribution";
import { DestinationSearch, type DestinationCard } from "@/components/DestinationSearch";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getCountry, getSeason, listDestinations } from "@/data/catalog";
import { monthName } from "@/domain/months";
import { bestMonths } from "@/domain/season";
import type { Destination } from "@/domain/types";

function summarize(destination: Destination): string {
  if (destination.climateCaveat) return "Кліматичні дані уточнюємо";
  const months = bestMonths(getSeason(destination.slug));
  if (months.length === 0) return "Погода непроста цілий рік";
  return `Найкраща погода: ${months.map((m) => monthName(m).full.toLowerCase()).join(", ")}`;
}

function buildCards(): DestinationCard[] {
  return listDestinations().map((destination) => {
    const country = getCountry(destination.countrySlug);
    if (!country) throw new Error(`Unknown country "${destination.countrySlug}"`);
    return {
      href: `/${country.slug}/${destination.slug}`,
      name: destination.name,
      countryName: country.name,
      summary: summarize(destination),
      searchFields: [destination.name, destination.slug, country.name, country.slug],
    };
  });
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-10 sm:px-6 sm:py-16">
      <section className="flex flex-col gap-6">
        <h1 className="max-w-3xl text-4xl leading-tight font-bold sm:text-5xl">
          Куди й коли поїхати
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Оберіть напрямок і подивіться, в які місяці там найкомфортніша погода. Ціни, дорогу й
          візові умови ще додаємо.
        </p>
        <DestinationSearch cards={buildCards()} />
      </section>

      <section
        aria-labelledby="waitlist-title"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
      >
        <h2 id="waitlist-title" className="text-2xl font-bold">
          Отримайте ранній доступ
        </h2>
        <p className="max-w-2xl text-muted">
          Напишемо, коли додамо ціни, дорогу з Києва, Львова й Варшави та візи для українців.
        </p>
        <SubscribeForm />
      </section>

      <footer className="border-t border-border pt-6">
        <ClimateAttribution />
      </footer>
    </main>
  );
}
