"use client";

import { memo } from "react";
import type { MapCountry } from "@/data/explorer";
import type { Selection } from "@/lib/explore";
import type { View } from "@/lib/map-view";

export type CountryShape = { id: string | null; d: string };

type ShapesProps = {
  shapes: CountryShape[];
  countries: MapCountry[];
  selection: Selection;
  onSelectCountry: (slug: string) => void;
  onHoverCountry: (slug: string | null) => void;
};

// Контурів сотні, тому вони не перемальовуються під час зуму: міняється лише viewBox.
const Shapes = memo(function Shapes({
  shapes,
  countries,
  selection,
  onSelectCountry,
  onHoverCountry,
}: ShapesProps) {
  const byMapId = new Map(countries.map((country) => [country.mapId, country]));

  return shapes.map((shape, index) => {
    const country = shape.id ? byMapId.get(shape.id) : undefined;
    let fill = "fill-[#1b1f24]";
    if (country) {
      fill = "cursor-pointer fill-[#3a424c] hover:fill-[#66717f]";
      if (selection.region === country.region) fill = "cursor-pointer fill-[#56616d] hover:fill-[#7b8794]";
      if (selection.country === country.slug) fill = "cursor-pointer fill-[#8d99a6]";
    }
    return (
      <path
        key={shape.id ?? `shape-${index}`}
        d={shape.d}
        data-country={country?.slug}
        className={`stroke-[#0b0d10] transition-[fill] duration-300 ${fill}`}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        onClick={country ? () => onSelectCountry(country.slug) : undefined}
        onPointerEnter={country ? () => onHoverCountry(country.slug) : undefined}
        onPointerLeave={country ? () => onHoverCountry(null) : undefined}
      />
    );
  });
});

export function WorldMap({ view, ...props }: ShapesProps & { view: View }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      className="absolute inset-0 size-full"
    >
      <Shapes {...props} />
    </svg>
  );
}
