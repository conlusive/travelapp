import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClimateAttribution } from "@/components/ClimateAttribution";
import { SeasonCalendar } from "@/components/SeasonCalendar";
import { getCountry, getDestination, getSeason, listDestinations } from "@/data/catalog";
import { bestMonths } from "@/domain/season";

const UPCOMING_SECTIONS = ["Що відвідати", "Ціни", "Де жити", "Як дістатися", "Візи для українців"];

// Усі напрямки відомі на збірці; інші адреси отримують справжній 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return listDestinations().map((destination) => ({
    country: destination.countrySlug,
    destination: destination.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[country]/[destination]">): Promise<Metadata> {
  const { country, destination: slug } = await params;
  const destination = getDestination(country, slug);
  if (!destination) return {};
  return {
    title: `${destination.name}: коли їхати`,
    description: `${destination.name} по місяцях: температура, опади й дощові дні. Коли комфортніше їхати.`,
  };
}

export default async function DestinationPage({
  params,
}: PageProps<"/[country]/[destination]">) {
  const { country: countrySlug, destination: slug } = await params;
  const country = getCountry(countrySlug);
  const destination = getDestination(countrySlug, slug);
  if (!country || !destination) notFound();

  const season = getSeason(destination.slug);
  const initialMonth = bestMonths(season, 1)[0] ?? 1;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <nav aria-label="Навігація" className="text-sm text-muted">
          <Link href="/" className="hover:underline">
            Напрямки
          </Link>
          {" / "}
          <Link href={`/${country.slug}`} className="hover:underline">
            {country.name}
          </Link>
        </nav>
        <h1 className="text-4xl font-bold">{destination.name}: коли їхати</h1>
      </header>

      <section aria-labelledby="season-title" className="flex flex-col gap-4">
        <h2 id="season-title" className="text-2xl font-bold">
          Календар сезонів
        </h2>
        {destination.climateCaveat && (
          <p role="note" className="rounded-xl border border-verdict-meh bg-verdict-meh/15 p-4">
            <strong>Увага: дані неточні.</strong> Для цього напрямку наше джерело клімату в окремі
            місяці розходиться з детальнішою моделлю на кілька градусів. Перевіряйте погоду в
            інших джерелах.
          </p>
        )}
        <p className="text-sm text-muted">
          Оцінка попередня: враховано лише температуру й дощ. Натовпи та ціни ще не додані.
        </p>
        {/* key скидає вибраний місяць при переході між напрямками */}
        <SeasonCalendar key={destination.slug} season={season} initialMonth={initialMonth} />
      </section>

      <section aria-labelledby="more-title" className="flex flex-col gap-4">
        <h2 id="more-title" className="text-2xl font-bold">
          Готуємо
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING_SECTIONS.map((title) => (
            <li key={title} className="rounded-2xl border border-dashed border-border p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">Ще перевіряємо дані.</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border pt-6">
        <ClimateAttribution />
      </footer>
    </main>
  );
}
