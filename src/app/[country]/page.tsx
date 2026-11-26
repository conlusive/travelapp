import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClimateAttribution } from "@/components/ClimateAttribution";
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">{country.name}: коли їхати</h1>
        <dl className="flex flex-wrap gap-x-8 gap-y-1 text-muted">
          <div className="flex gap-2">
            <dt>Валюта:</dt>
            <dd className="text-foreground">{country.currency}</dd>
          </div>
          <div className="flex gap-2">
            <dt>Мова:</dt>
            <dd className="text-foreground">{country.language}</dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="overview-title" className="flex flex-col gap-4">
        <h2 id="overview-title" className="text-2xl font-bold">
          Погода по місяцях
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-4">
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
                  <th scope="row" className="pr-2 text-left font-semibold">
                    <Link
                      href={`/${country.slug}/${destination.slug}`}
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {destination.name}
                    </Link>
                    {destination.climateCaveat && <span title="Дані уточнюються"> *</span>}
                  </th>
                  {getSeason(destination.slug).map((item) => (
                    <td
                      key={item.climate.month}
                      title={`${monthName(item.climate.month).full}: ${VERDICT_LABELS[item.verdict]}`}
                      className={`rounded-md text-center font-medium text-on-verdict ${VERDICT_BACKGROUND[item.verdict]}`}
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
      </section>

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

      <footer className="border-t border-border pt-6">
        <ClimateAttribution />
      </footer>
    </main>
  );
}
