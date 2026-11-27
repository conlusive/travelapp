import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoHero } from "@/components/PhotoHero";
import { ReportForm } from "@/components/ReportForm";
import { VerdictLegend } from "@/components/VerdictLegend";
import { FactList, Section } from "@/components/ui";
import { VERDICT_BACKGROUND } from "@/components/verdict-styles";
import {
  getCountry,
  getEntryRules,
  getSeason,
  listCountries,
  listDestinations,
} from "@/data/catalog";
import { summarize } from "@/data/explorer";
import { getPhoto } from "@/data/photos";
import { MONTH_NAMES, monthName } from "@/domain/months";
import { VERDICT_LABELS } from "@/domain/season";
import { formatMonthYear } from "@/lib/format";

// Усі напрямки відомі на збірці; інші адреси отримують справжній 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return listCountries().map((country) => ({ country: country.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[country]">): Promise<Metadata> {
  const country = getCountry((await params).country);
  if (!country) return {};
  return {
    title: `${country.name}: коли їхати`,
    description: `Погода по місяцях у напрямках країни ${country.name}: коли комфортніше їхати.`,
  };
}

export default async function CountryPage({ params }: PageProps<"/[country]">) {
  const country = getCountry((await params).country);
  if (!country) notFound();
  const destinations = listDestinations(country.slug);
  const entryRules = getEntryRules(country.slug);

  return (
    <>
      <PhotoHero
        photo={getPhoto(destinations[0].slug)}
        alt={`${destinations[0].name}, ${country.name}`}
        title={country.name}
        eyebrow={
          <Link href={`/?country=${country.slug}#map`} className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black">
            Показати на карті
          </Link>
        }
      >
        <p>
          Валюта: {country.currency}. Мова: {country.language}.
        </p>
      </PhotoHero>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 sm:px-8">
        <Section id="places" title="Напрямки">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <li key={destination.slug}>
                <PhotoCard
                  href={`/${country.slug}/${destination.slug}`}
                  title={destination.name}
                  text={summarize(destination, getSeason(destination.slug))}
                  photo={getPhoto(destination.slug)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="season" title="Погода по місяцях">
          <div className="overflow-x-auto rounded-3xl border border-border bg-surface p-4">
            <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th scope="col" className="text-left font-medium text-muted">
                    Напрямок
                  </th>
                  {MONTH_NAMES.map((month) => (
                    <th key={month.short} scope="col" className="font-medium text-muted">
                      {month.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {destinations.map((destination) => (
                  <tr key={destination.slug}>
                    <th scope="row" className="pr-2 text-left font-bold">
                      <Link
                        href={`/${country.slug}/${destination.slug}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {destination.name}
                      </Link>
                      {destination.climateCaveat && <span title="Дані уточнюються"> *</span>}
                    </th>
                    {getSeason(destination.slug).map((item) => (
                      <td
                        key={item.climate.month}
                        title={`${monthName(item.climate.month).full}: ${VERDICT_LABELS[item.verdict]}`}
                        className={`rounded-lg text-center font-semibold text-on-verdict ${VERDICT_BACKGROUND[item.verdict]}`}
                      >
                        <Link
                          href={`/${country.slug}/${destination.slug}?month=${item.climate.month}`}
                          aria-label={`${destination.name}, ${monthName(item.climate.month).full}: ${VERDICT_LABELS[item.verdict]}`}
                          className="flex min-h-9 items-center justify-center"
                        >
                          {item.score}
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <VerdictLegend />
          <p className="text-sm text-muted">
            Оцінка попередня: враховано лише погоду.
            {destinations.some((d) => d.climateCaveat) &&
              " Для напрямків із зірочкою кліматичні дані можуть помітно відрізнятися від реальних."}
          </p>
        </Section>

        {entryRules && (
          <Section id="visa" title="Візи й вʼїзд для українців">
            <FactList facts={entryRules.facts} />
            <p className="text-sm text-muted">
              Для біометричного паспорта й короткої туристичної поїздки. Перевірено:{" "}
              {formatMonthYear(entryRules.verifiedAt)}.
            </p>
          </Section>
        )}

        <ReportForm />
      </main>
    </>
  );
}
