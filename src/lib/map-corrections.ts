// Natural Earth (world-atlas) малює Крим у складі Росії «за фактичним контролем».
// За міжнародним правом Крим — Україна (резолюція ГА ООН 68/262), тому виправляємо це до побудови карти.
import { geoBounds } from "d3-geo";
import { feature, mergeArcs } from "topojson-client";
import type { GeometryCollection, MultiPolygon, Polygon, Topology } from "topojson-specification";

const UKRAINE = "804";
const RUSSIA = "643";
/** Прямокутник, у якому цілком лежать Крим і прилеглі острови: [захід, південь, схід, північ]. */
const CRIMEA_BOX = [32.3, 44.2, 36.75, 46.35] as const;

type Country = (Polygon | MultiPolygon) & { id?: string | number };

function arcsOf(geometry: Country): Polygon["arcs"][] {
  return geometry.type === "Polygon" ? [geometry.arcs] : geometry.arcs;
}

/** Переносить кримські полігони з Росії до України та прибирає лінію на перешийку. */
export function restoreCrimea(topology: Topology): Topology {
  const collection = topology.objects.countries as GeometryCollection;
  const geometries = collection.geometries as Country[];
  const russia = geometries.find((geometry) => String(geometry.id) === RUSSIA);
  const ukraine = geometries.find((geometry) => String(geometry.id) === UKRAINE);
  if (!russia || !ukraine) throw new Error("World atlas has no Russia or Ukraine");

  const insideCrimea = (arcs: Polygon["arcs"]) => {
    const [[west, south], [east, north]] = geoBounds(feature(topology, { type: "Polygon", arcs }));
    const [minLng, minLat, maxLng, maxLat] = CRIMEA_BOX;
    return west >= minLng && south >= minLat && east <= maxLng && north <= maxLat;
  };

  const crimea = arcsOf(russia).filter(insideCrimea);
  if (crimea.length === 0) return topology;

  const merged = mergeArcs(topology, [
    ukraine as MultiPolygon,
    { type: "MultiPolygon", arcs: crimea },
  ]);
  const corrected = geometries.map((geometry) => {
    if (geometry === ukraine) return { ...geometry, type: "MultiPolygon" as const, arcs: merged.arcs };
    if (geometry === russia) {
      const rest = arcsOf(russia).filter((arcs) => !crimea.includes(arcs));
      return { ...geometry, type: "MultiPolygon" as const, arcs: rest };
    }
    return geometry;
  });

  return {
    ...topology,
    objects: { ...topology.objects, countries: { ...collection, geometries: corrected } },
  };
}
