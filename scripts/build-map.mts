// Будує контури країн із world-atlas (Natural Earth) у проєкції застосунку.
// Запуск: npm run build:map (лише після зміни проєкції або списку країн).
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { geoArea, geoPath } from "d3-geo";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { feature } from "topojson-client";
import { presimplify, quantile, simplify } from "topojson-simplify";
import type { Topology } from "topojson-specification";
import { COUNTRIES } from "../src/data/destinations.ts";
import { restoreCrimea } from "../src/lib/map-corrections.ts";
import { mapProjection } from "../src/lib/map-projection.ts";

const SOURCE = new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url);
const PATHS_OUTPUT = new URL("../public/map/world.json", import.meta.url);
const BOUNDS_OUTPUT = new URL("../src/data/map-bounds.json", import.meta.url);
// Частка найдрібніших точок контуру, яку відкидаємо.
const SIMPLIFY_QUANTILE = 0.35;
const ANTARCTICA = "010";

type SimplifyInput = Parameters<typeof presimplify>[0];

const source = restoreCrimea(JSON.parse(await readFile(SOURCE, "utf8")) as Topology);
const topology = presimplify(source as SimplifyInput);
const simplified = simplify(topology, quantile(topology, SIMPLIFY_QUANTILE)) as Topology;
const collection = feature(simplified, simplified.objects.countries);
if (collection.type !== "FeatureCollection") throw new Error("Unexpected world-atlas shape");
const features = collection.features as Feature<Polygon | MultiPolygon>[];

const path = geoPath(mapProjection).digits(1);

const countries = features
  .filter((country) => country.id !== ANTARCTICA)
  .map((country) => ({ id: country.id === undefined ? null : String(country.id), d: path(country) }));

/** Найбільший за площею шматок країни: без нього Франція «тягнулася» б до Південної Америки. */
function mainland({ geometry }: Feature<Polygon | MultiPolygon>): Polygon {
  if (geometry.type === "Polygon") return geometry;
  const polygons = geometry.coordinates.map(
    (coordinates): Polygon => ({ type: "Polygon", coordinates }),
  );
  return polygons.reduce((largest, next) => (geoArea(next) > geoArea(largest) ? next : largest));
}

const bounds = Object.fromEntries(
  COUNTRIES.map(({ slug, mapId }) => {
    const country = features.find((item) => String(item.id) === mapId);
    if (!country) throw new Error(`No map shape for ${slug} (${mapId})`);
    const [[x0, y0], [x1, y1]] = path.bounds(mainland(country));
    return [slug, [x0, y0, x1, y1].map((value) => Math.round(value * 10) / 10)];
  }),
);

await mkdir(new URL("./", PATHS_OUTPUT), { recursive: true });
await writeFile(PATHS_OUTPUT, JSON.stringify(countries));
await writeFile(BOUNDS_OUTPUT, `${JSON.stringify(bounds, null, 1)}\n`);
console.log(`Saved ${countries.length} countries, bounds for ${Object.keys(bounds).length}`);
