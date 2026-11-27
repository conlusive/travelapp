/** [захід, південь, схід, північ] у градусах. */
export type GeoBox = [number, number, number, number];

// box — куди зумиться карта, marker — де стоїть мітка регіону на віддаленій карті ([довгота, широта]).
export const REGIONS = [
  { id: "europe", name: "Європа", box: [-25, 34, 32, 67], marker: [8, 56] },
  { id: "middle-east", name: "Кавказ і Близький Схід", box: [24, 20, 62, 45], marker: [56, 36] },
  { id: "asia", name: "Азія", box: [66, -12, 148, 46], marker: [104, 32] },
  { id: "africa", name: "Африка", box: [-20, 12, 50, 38], marker: [12, 6] },
  { id: "oceania", name: "Океанія", box: [110, -45, 180, -8], marker: [134, -25] },
  { id: "americas", name: "Америка", box: [-128, -36, -30, 52], marker: [-98, 30] },
] as const satisfies readonly {
  id: string;
  name: string;
  box: GeoBox;
  marker: [number, number];
}[];

export type RegionId = (typeof REGIONS)[number]["id"];

export function isRegionId(value: string | null): value is RegionId {
  return REGIONS.some((region) => region.id === value);
}
