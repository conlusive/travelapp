import { readFile } from "node:fs/promises";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { beforeAll, describe, expect, it } from "vitest";
import { restoreCrimea } from "./map-corrections";
import { projectPoint } from "./map-projection";

const UKRAINE = "804";

let countries: ReturnType<typeof countriesOf>;

function countriesOf(topology: Topology) {
  const collection = feature(topology, topology.objects.countries as GeometryCollection);
  return collection.features;
}

function ownerOf(lng: number, lat: number): string[] {
  return countries.filter((c) => geoContains(c, [lng, lat])).map((c) => String(c.id));
}

beforeAll(async () => {
  const source = new URL("../../node_modules/world-atlas/countries-50m.json", import.meta.url);
  countries = countriesOf(restoreCrimea(JSON.parse(await readFile(source, "utf8"))));
});

describe("restoreCrimea", () => {
  it.each([
    ["Сімферополь", 34.1, 44.95],
    ["Севастополь", 33.52, 44.6],
    ["Ялта", 34.16, 44.5],
    ["Керч", 36.47, 45.36],
    ["Джанкой", 34.39, 45.71],
    ["Армʼянськ", 33.69, 46.11],
    ["Арабатська стрілка", 35.0, 45.65],
    ["Донецьк", 37.8, 48.0],
    ["Луганськ", 39.31, 48.57],
    ["Київ", 30.52, 50.45],
  ])("places %s in Ukraine only", (_name, lng, lat) => {
    expect(ownerOf(lng, lat)).toEqual([UKRAINE]);
  });

  it.each([
    ["Краснодар", 38.97, 45.04, "643"],
    ["Тамань", 36.9, 45.15, "643"],
    ["Москва", 37.62, 55.75, "643"],
    ["Сухумі", 41.02, 43.0, "268"],
    ["Цхінвалі", 43.97, 42.23, "268"],
    ["Тирасполь", 29.63, 46.84, "498"],
  ])("keeps %s where it belongs", (_name, lng, lat, id) => {
    expect(ownerOf(lng, lat)).toEqual([id]);
  });

  it("is already applied to the generated map", async () => {
    const shapes: { id: string | null; d: string }[] = JSON.parse(
      await readFile(new URL("../../public/map/world.json", import.meta.url), "utf8"),
    );
    // У шляху України мають бути точки на південь від Сімферополя; у шляху Росії поблизу — жодної.
    const [x, y] = projectPoint(34.1, 44.95);
    const pointsNearCrimea = (id: string) =>
      [...shapes.find((s) => s.id === id)!.d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].filter(
        ([, px, py]) => Math.abs(Number(px) - x) < 6 && Number(py) > y && Number(py) - y < 6,
      ).length;

    expect(pointsNearCrimea(UKRAINE)).toBeGreaterThan(0);
    expect(pointsNearCrimea("643")).toBe(0);
  });
});
