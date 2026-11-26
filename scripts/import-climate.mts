// Завантажує щоденні дані NASA POWER і зберігає помісячні середні в src/data/climate.json.
// Запуск: npm run import:climate
import { writeFile } from "node:fs/promises";
import { DESTINATIONS } from "../src/data/destinations.ts";
import { aggregateMonthly, type DailySeries } from "../src/domain/climate.ts";
import type { MonthlyClimate } from "../src/domain/types.ts";

const ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point";
const FIRST_YEAR = 2016;
const LAST_YEAR = 2025;
const OUTPUT = new URL("../src/data/climate.json", import.meta.url);
const PAUSE_MS = 1000;
const TIMEOUT_MS = 60_000;

type PowerResponse = {
  properties: {
    parameter: Record<"T2M_MAX" | "T2M_MIN" | "PRECTOTCORR", DailySeries>;
  };
  header: { fill_value: number; api: { version: string } };
};

function isPowerResponse(value: unknown): value is PowerResponse {
  const data = value as Partial<PowerResponse> | null;
  const parameter = data?.properties?.parameter;
  return Boolean(
    parameter?.T2M_MAX &&
      parameter.T2M_MIN &&
      parameter.PRECTOTCORR &&
      typeof data?.header?.fill_value === "number",
  );
}

async function fetchDaily(lat: number, lng: number): Promise<PowerResponse> {
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({
    parameters: "T2M_MAX,T2M_MIN,PRECTOTCORR",
    community: "RE",
    latitude: String(lat),
    longitude: String(lng),
    start: `${FIRST_YEAR}0101`,
    end: `${LAST_YEAR}1231`,
    format: "JSON",
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`NASA POWER responded ${response.status}`);

  const data: unknown = await response.json();
  if (!isPowerResponse(data)) throw new Error("Unexpected NASA POWER response shape");
  return data;
}

const years = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
const destinations: Record<string, MonthlyClimate[]> = {};
let apiVersion = "";

for (const { slug, lat, lng } of DESTINATIONS) {
  const data = await fetchDaily(lat, lng);
  const { T2M_MAX, T2M_MIN, PRECTOTCORR } = data.properties.parameter;
  destinations[slug] = aggregateMonthly(
    { maxC: T2M_MAX, minC: T2M_MIN, precipitationMm: PRECTOTCORR },
    years,
    data.header.fill_value,
  );
  apiVersion = data.header.api.version;
  console.log(`ok ${slug}`);
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
}

// Файл пишеться лише після успіху для всіх напрямків, щоб не залишити часткові дані.
const output = {
  source: {
    name: "NASA POWER Daily API",
    url: "https://power.larc.nasa.gov/",
    version: apiVersion,
    accessedAt: new Date().toISOString().slice(0, 10),
    firstYear: FIRST_YEAR,
    lastYear: LAST_YEAR,
  },
  destinations,
};

await writeFile(OUTPUT, `${JSON.stringify(output, null, 1)}\n`);
console.log(`Saved ${Object.keys(destinations).length} destinations`);
