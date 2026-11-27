/** [захід, південь, схід, північ] у градусах. */
export type GeoBox = [number, number, number, number];

export const REGIONS = [
  { id: "europe", name: "Європа", box: [-25, 34, 32, 67] },
  { id: "middle-east", name: "Кавказ і Близький Схід", box: [24, 20, 62, 45] },
  { id: "asia", name: "Азія", box: [66, -12, 148, 46] },
  { id: "africa", name: "Африка", box: [-20, 12, 50, 38] },
  { id: "oceania", name: "Океанія", box: [110, -45, 180, -8] },
  { id: "americas", name: "Америка", box: [-128, -36, -30, 52] },
] as const satisfies readonly { id: string; name: string; box: GeoBox }[];

export type RegionId = (typeof REGIONS)[number]["id"];

export function isRegionId(value: string | null): value is RegionId {
  return REGIONS.some((region) => region.id === value);
}
