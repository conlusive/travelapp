import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AttractionList } from "@/components/AttractionList";
import { ClimateAttribution } from "@/components/ClimateAttribution";
import { ReportForm } from "@/components/ReportForm";
import { RouteFinder } from "@/components/RouteFinder";
import { SeasonCalendar, SeasonCalendarView } from "@/components/SeasonCalendar";
import { SourceLink } from "@/components/SourceLink";
import { Card, ExternalButton, FactList, Pending, Section } from "@/components/ui";
import {
  getContent,
  getCountry,
  getDestination,
  getEntryRules,
  getSeason,
  listDestinations,
} from "@/data/catalog";
import { monthName } from "@/domain/months";
import { bestMonths } from "@/domain/season";
import { formatMonthYear } from "@/lib/format";
import { bookingSearchUrl, mapSearchUrl, numbeoUrl } from "@/lib/links";

const SECTIONS = [
  { id: "season", label: "Коли їхати" },
  { id: "places", label: "Що відвідати" },
  { id: "prices", label: "Ціни" },
  { id: "stay", label: "Житло" },
  { id: "route", label: "Дорога" },
  { id: "visa", label: "Візи" },
  { id: "tips", label: "Поради" },
];

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
  const content = getContent(destination.slug);
  const entryRules = getEntryRules(country.slug);
  const best = destination.climateCaveat ? [] : bestMonths(season);
  const initialMonth = bestMonths(season, 1)[0] ?? 1;
  const ticketed = content?.attractions.filter((attraction) => attraction.price) ?? [];

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 pt-8 pb-4 sm:px-6">
        <nav aria-label="Хлібні крихти" className="text-sm text-muted">
          <Link href="/" className="hover:underline">
            Напрямки
          </Link>
          {" / "}
          <Link href={`/${country.slug}`} className="hover:underline">
            {country.name}
          </Link>
        </nav>
        <h1 className="text-4xl font-bold">{destination.name}</h1>
        <p className="text-muted">
          {best.length > 0 &&
            `Найкраща погода: ${best.map((m) => monthName(m).full.toLowerCase()).join(", ")}. `}
          Валюта: {country.currency}.
          {content && ` Перевірено: ${formatMonthYear(content.verifiedAt)}.`}
        </p>
      </header>

      <nav
        aria-label="Розділи сторінки"
        className="sticky top-0 z-10 border-y border-border bg-background/95 backdrop-blur"
      >
        <ul className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-2 sm:px-4">
          {SECTIONS.map((section) => (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                className="inline-flex min-h-12 items-center px-2 text-sm font-medium text-muted hover:text-accent"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-8 sm:px-6">
        <Section id="season" title="Коли їхати">
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
          <Suspense
            fallback={
              <SeasonCalendarView season={season} selected={initialMonth} />
            }
          >
            {/* key скидає стан при переході між напрямками */}
            <SeasonCalendar key={destination.slug} season={season} initialMonth={initialMonth} />
          </Suspense>
        </Section>

        <Section id="places" title="Що відвідати">
          {content ? (
            <AttractionList attractions={content.attractions} city={destination.searchName} />
          ) : (
            <>
              <Pending>Перевірений список місць ще готуємо.</Pending>
              <ExternalButton href={mapSearchUrl(`attractions in ${destination.searchName}`)}>
                Памʼятки на карті
              </ExternalButton>
            </>
          )}
        </Section>

        <Section id="prices" title="Ціни">
          {content ? (
            <>
              <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
                {content.fares.map((fare) => (
                  <li key={fare.label} className="flex flex-col gap-1 p-4">
                    <p className="flex flex-wrap justify-between gap-x-4">
                      <span>{fare.label}</span>
                      <strong>{fare.price}</strong>
                    </p>
                    <SourceLink source={fare.source} />
                  </li>
                ))}
                {ticketed.map((attraction) => (
                  <li key={attraction.name} className="flex flex-col gap-1 p-4">
                    <p className="flex flex-wrap justify-between gap-x-4">
                      <span>Вхід: {attraction.name}</span>
                      <strong>{attraction.price!.text}</strong>
                    </p>
                    <SourceLink source={attraction.price!.source} />
                  </li>
                ))}
              </ul>
              {content.faresNote && <p className="text-sm text-muted">{content.faresNote}</p>}
              <ExternalButton href={numbeoUrl(destination.searchName)}>
                Ціни на їжу й побут (Numbeo)
              </ExternalButton>
            </>
          ) : (
            <Pending>Перевірені ціни ще готуємо.</Pending>
          )}
        </Section>

        <Section id="stay" title="Житло">
          <Card>
            <p className="mb-4 text-muted">
              Власної добірки готелів ще немає. Живі ціни на ваші дати — на сайті бронювання (це
              звичайне посилання, не партнерське).
            </p>
            <ExternalButton href={bookingSearchUrl(destination.searchName)}>
              Житло: {destination.name} на Booking.com
            </ExternalButton>
          </Card>
        </Section>

        <Section id="route" title="Як дістатися">
          <RouteFinder
            routes={content?.routes ?? null}
            destinationName={destination.name}
            destinationSearchName={destination.searchName}
          />
        </Section>

        <Section id="visa" title="Візи й вʼїзд для українців">
          {entryRules ? (
            <>
              <FactList facts={entryRules.facts} />
              <p className="text-sm text-muted">
                Для біометричного паспорта й короткої туристичної поїздки. Перевірено:{" "}
                {formatMonthYear(entryRules.verifiedAt)}. Правила змінюються: перед поїздкою
                перевірте їх на офіційному сайті.
              </p>
            </>
          ) : (
            <Pending>
              Візові умови ще перевіряємо. Не плануйте поїздку, не звірившись з офіційними
              джерелами.
            </Pending>
          )}
        </Section>

        <Section id="tips" title="Поради">
          {content ? <FactList facts={content.tips} /> : <Pending>Поради ще збираємо.</Pending>}
        </Section>

        <ReportForm />

        <footer className="border-t border-border pt-6">
          <ClimateAttribution />
        </footer>
      </main>
    </>
  );
}
