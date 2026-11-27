"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapCountry, MapRegion, PlaceCard } from "@/data/explorer";
import { MONTH_NAMES, monthName } from "@/domain/months";
import type { RegionId } from "@/domain/regions";
import { filterDestinations, parseMonth } from "@/lib/destination-filter";
import {
  filterBySelection,
  parseSelection,
  suggest,
  type Selection,
  type Suggestion,
} from "@/lib/explore";
import { boundsAround, type Bounds } from "@/lib/map-view";
import { replaceSearchParams } from "@/lib/url-state";
import { ChipRow } from "./ChipRow";
import { PlaceMarkers, RegionMarkers } from "./MapMarkers";
import { MapSearch } from "./MapSearch";
import { ResultsPanel, VerdictBadge, destinationHref } from "./ResultsPanel";
import { useMapView } from "./useMapView";
import { WorldMap, type CountryShape } from "./WorldMap";

/** Ширше вікно (в одиницях карти) показує мітки регіонів замість окремих точок. */
const REGION_VIEW_WIDTH = { landscape: 1150, portrait: 480 };
/** Мінімальне «поле» навколо точок країни, щоб маленькі країни не зумились впритул. */
const COUNTRY_MARGIN = 45;
/** Поле навколо знайдених під час набору місць. */
const SEARCH_MARGIN = 90;

type Data = { places: PlaceCard[]; countries: MapCountry[]; regions: MapRegion[] };

type ViewProps = Data & {
  selection: Selection;
  month: number | null;
  /** Відсутній у статичному варіанті до гідратації. */
  onChange?: (next: Partial<{ region: RegionId | null; country: string | null; month: number | null }>) => void;
};

function targetBounds({ selection, places, countries, regions }: Data & { selection: Selection }): Bounds | null {
  if (selection.country) {
    const country = countries.find((item) => item.slug === selection.country)!;
    const [x0, y0, x1, y1] = country.bounds;
    const own = boundsAround(
      places.filter((place) => place.countrySlug === country.slug),
      COUNTRY_MARGIN,
    );
    if (!own) return country.bounds;
    return [Math.min(x0, own[0]), Math.min(y0, own[1]), Math.max(x1, own[2]), Math.max(y1, own[3])];
  }
  return regions.find((region) => region.id === selection.region)?.bounds ?? null;
}

function useWorldShapes() {
  const [shapes, setShapes] = useState<CountryShape[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/map/world.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Map request failed: ${response.status}`);
        return response.json() as Promise<CountryShape[]>;
      })
      .then(setShapes)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return { shapes, failed };
}

export function MapExplorerView({ places, countries, regions, selection, month, onChange }: ViewProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { shapes, failed } = useWorldShapes();

  const suggestions = suggest(query, countries, places);
  const searching = query.trim() !== "";
  // Набраний текст шукає по всьому світу; без нього діє вибір на карті.
  const results = filterDestinations(
    searching ? places : filterBySelection(places, selection),
    query,
    month,
  );

  // Поки користувач пише, карта летить до знайденого; без збігів діє вибір.
  const matched = searching && results.length < places.length ? results : [];
  const target =
    boundsAround(matched, SEARCH_MARGIN) ?? targetBounds({ selection, places, countries, regions });
  const { view, size, handlers, zoom, reset } = useMapView(mapRef, target);
  const highlighted = new Set(results.map((p) => p.slug));
  const activePlace = results.find((place) => place.slug === active) ?? null;
  const counts = new Map(
    regions.map((r) => [r.id, places.filter((p) => p.region === r.id).length] as const),
  );
  const showRegions =
    !!view &&
    !!size &&
    !selection.region &&
    !searching &&
    view.width >
      (size.width < size.height * 1.2 ? REGION_VIEW_WIDTH.portrait : REGION_VIEW_WIDTH.landscape);

  const selectCountry = useCallback(
    (slug: string) => {
      setActive(null);
      onChange?.({ country: slug, region: null });
    },
    [onChange],
  );

  function selectRegion(id: RegionId | null) {
    setActive(null);
    setQuery("");
    onChange?.({ region: id, country: null });
    // Повторний вибір того самого регіону повертає карту на місце після перетягування.
    if (id === selection.region && !selection.country) reset();
  }

  function pick(suggestion: Suggestion) {
    setQuery("");
    if (suggestion.type === "region") return selectRegion(suggestion.id);
    if (suggestion.type === "country") return selectCountry(suggestion.id);
    const place = places.find((p) => p.slug === suggestion.id)!;
    onChange?.({ country: place.countrySlug, region: null });
    setActive(place.slug);
  }

  const regionName = regions.find((r) => r.id === selection.region)?.name;
  const countryName = countries.find((c) => c.slug === selection.country)?.name;
  const hoveredName = countries.find((c) => c.slug === hovered)?.name;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0d10] text-white lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col">
        <div className="relative z-40 flex flex-col gap-3 p-3 sm:p-4">
          <MapSearch query={query} suggestions={suggestions} onQuery={setQuery} onPick={pick} />
          <ChipRow<RegionId | null>
            label="Регіон"
            selected={selection.region}
            onSelect={selectRegion}
            options={[
              { value: null, text: "Весь світ" },
              ...regions.map((r) => ({ value: r.id, text: r.name })),
            ]}
          />
        </div>

        <div
          ref={mapRef}
          {...handlers}
          className="relative h-[58svh] min-h-96 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing lg:h-[40rem]"
        >
          {view && size ? (
            <>
              <WorldMap
                view={view}
                shapes={shapes}
                countries={countries}
                selection={selection}
                onSelectCountry={selectCountry}
                onHoverCountry={setHovered}
              />
              {showRegions ? (
                <RegionMarkers view={view} regions={regions} counts={counts} onSelect={selectRegion} />
              ) : (
                <PlaceMarkers
                  view={view}
                  size={size}
                  places={places}
                  matching={highlighted}
                  month={month}
                  active={active}
                  onActivate={(slug) => {
                    const place = places.find((p) => p.slug === slug)!;
                    // Точка поза поточним вибором переносить вибір у свою країну.
                    if (!results.includes(place)) {
                      setQuery("");
                      onChange?.({ country: place.countrySlug, region: null });
                    }
                    setActive(slug);
                  }}
                />
              )}
            </>
          ) : null}
          {(failed || shapes.length === 0) && (
            <p role="status" className="absolute inset-x-0 top-1/2 text-center text-sm text-white/60">
              {failed ? "Не вдалося завантажити карту. Скористайтеся списком напрямків." : "Завантажуємо карту…"}
            </p>
          )}

          {hoveredName && (
            <p aria-hidden="true" className="pointer-events-none absolute top-3 left-4 rounded-full bg-black/75 px-3 py-1 text-xs font-bold">
              {hoveredName}
            </p>
          )}

          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            {[
              { label: "Наблизити", symbol: "+", run: () => zoom(0.65) },
              { label: "Віддалити", symbol: "−", run: () => zoom(1.55) },
              { label: "Повернути вигляд", symbol: "⟲", run: reset },
            ].map((button) => (
              <button
                key={button.label}
                type="button"
                aria-label={button.label}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={button.run}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/60 text-lg backdrop-blur hover:bg-white hover:text-black"
              >
                {button.symbol}
              </button>
            ))}
          </div>

          {activePlace && (
            <div
              key={activePlace.slug}
              onPointerDown={(event) => event.stopPropagation()}
              className="absolute inset-x-3 bottom-3 z-30 flex animate-pop cursor-default items-stretch gap-3 rounded-3xl bg-black/80 p-3 backdrop-blur-xl sm:right-auto sm:w-96"
            >
              <span className="relative w-24 shrink-0 overflow-hidden rounded-2xl">
                <Image src={activePlace.photo.src} alt="" fill sizes="96px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-lg font-extrabold">{activePlace.name}</span>
                <span className="text-xs text-white/60">
                  {month === null ? activePlace.summary : `${activePlace.countryName}, ${monthName(month).full.toLowerCase()}`}
                </span>
                <VerdictBadge place={activePlace} month={month} />
                <Link
                  href={destinationHref(activePlace, month)}
                  className="mt-1 inline-flex min-h-10 items-center self-start rounded-full bg-white px-4 text-sm font-bold text-black"
                >
                  Відкрити →
                </Link>
              </span>
              <button
                type="button"
                aria-label="Закрити картку"
                onClick={() => setActive(null)}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/60 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-3 sm:p-4">
          <p className="mb-2 text-xs font-bold tracking-widest text-white/50 uppercase">Коли їдете?</p>
          <ChipRow<number | null>
            label="Місяць поїздки"
            selected={month}
            onSelect={(value) => onChange?.({ month: value })}
            options={[
              { value: null, text: "Будь-коли" },
              ...MONTH_NAMES.map((name, i) => ({ value: i + 1, text: name.full })),
            ]}
          />
        </div>
      </div>

      <aside aria-label="Напрямки" className="flex max-h-[36rem] min-h-0 min-w-0 flex-col border-t border-white/10 lg:max-h-none lg:border-t-0 lg:border-l">
        <div className="flex flex-col gap-1 border-b border-white/10 p-4">
          {searching && <p className="min-h-8 text-sm font-bold">Результати пошуку</p>}
          <nav aria-label="Обране на карті" className={`flex flex-wrap items-center gap-1 text-sm ${searching ? "hidden" : ""}`}>
            <button type="button" onClick={() => selectRegion(null)} className="min-h-8 cursor-pointer text-white/60 hover:text-white">
              Світ
            </button>
            {regionName && (
              <>
                <span aria-hidden="true" className="text-white/30">›</span>
                <button type="button" onClick={() => selectRegion(selection.region)} className="min-h-8 cursor-pointer text-white/60 hover:text-white">
                  {regionName}
                </button>
              </>
            )}
            {countryName && (
              <>
                <span aria-hidden="true" className="text-white/30">›</span>
                <Link href={`/${selection.country}`} className="inline-flex min-h-8 items-center font-bold underline underline-offset-4">
                  {countryName}
                </Link>
              </>
            )}
          </nav>
          <p role="status" className="text-xs text-white/50">
            Напрямків: {results.length}
            {month !== null && ` · ${monthName(month).full.toLowerCase()}, найкращі зверху`}
          </p>
        </div>
        {/* На великих екранах список прокручується в межах висоти карти. */}
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="lg:absolute lg:inset-0 lg:overflow-y-auto">
            <ResultsPanel places={results} month={month} active={active} onActivate={setActive} />
          </div>
        </div>
      </aside>
    </div>
  );
}

/** Регіон, країна й місяць живуть в адресі: вибором можна поділитися. */
export function MapExplorer(props: Data) {
  const params = useSearchParams();
  const selection = parseSelection(params.get("region"), params.get("country"), props.countries);

  return (
    <MapExplorerView
      {...props}
      selection={selection}
      month={parseMonth(params.get("month"))}
      onChange={replaceSearchParams}
    />
  );
}
