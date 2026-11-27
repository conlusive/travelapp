import { access } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import mapBounds from "./map-bounds.json" with { type: "json" };
import { listCountries, listDestinations } from "./catalog";
import { getPhoto } from "./photos";

describe("photos", () => {
  it("has an attributed local photo for every destination", async () => {
    for (const { slug } of listDestinations()) {
      const photo = getPhoto(slug);
      expect(photo.author.length, slug).toBeGreaterThan(0);
      expect(photo.license, slug).toMatch(/^(CC0|Public domain|CC BY)/);
      expect(photo.sourceUrl, slug).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      await expect(access(new URL(`../../public${photo.src}`, import.meta.url))).resolves.toBeUndefined();
    }
  });

  it("fails for an unknown destination", () => {
    expect(() => getPhoto("atlantis")).toThrow(/atlantis/);
  });
});

describe("map data", () => {
  it("has map bounds for every country", () => {
    const bounds: Record<string, number[]> = mapBounds;
    for (const { slug } of listCountries()) expect(bounds[slug], slug).toHaveLength(4);
  });
});
