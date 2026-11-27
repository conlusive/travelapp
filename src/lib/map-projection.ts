// Єдине визначення проєкції: нею будується карта (scripts/build-map.mts) і ставляться точки.
import { geoNaturalEarth1 } from "d3-geo";
import type { GeoBox } from "../domain/regions.ts";
import type { Bounds } from "./map-view.ts";

export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 1040;

export const mapProjection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], {
  type: "Sphere",
});

export function projectPoint(lng: number, lat: number): [number, number] {
  const point = mapProjection([lng, lat]);
  if (!point) throw new Error(`Cannot project ${lng}, ${lat}`);
  return point;
}

/** Прямокутник на карті, що охоплює географічний прямокутник (краї вигнуті, тому їх семплюємо). */
export function projectBox([west, south, east, north]: GeoBox): Bounds {
  const steps = 12;
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const lng = west + ((east - west) * i) / steps;
    const lat = south + ((north - south) * i) / steps;
    points.push(
      projectPoint(lng, south),
      projectPoint(lng, north),
      projectPoint(west, lat),
      projectPoint(east, lat),
    );
  }
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
