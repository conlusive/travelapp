import { describe, expect, it } from "vitest";
import { getCountry, getDestination, getSeason, listCountries, listDestinations } from "./catalog";

describe("catalog integrity", () => {
  const countries = listCountries();
  const destinations = listDestinations();

  it("has unique country and destination slugs", () => {
    expect(new Set(countries.map((c) => c.slug)).size).toBe(countries.length);
    expect(new Set(destinations.map((d) => d.slug)).size).toBe(destinations.length);
  });

  it("links every destination to a country and every country to a destination", () => {
    for (const destination of destinations) {
      expect(getCountry(destination.countrySlug), destination.slug).not.toBeNull();
    }
    for (const country of countries) {
      expect(listDestinations(country.slug).length, country.slug).toBeGreaterThan(0);
    }
  });

  it("has twelve ordered months of plausible climate for every destination", () => {
    for (const { slug } of destinations) {
      const season = getSeason(slug);
      expect(season.map((m) => m.climate.month), slug).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      for (const { climate } of season) {
        expect(climate.avgMaxC, slug).toBeGreaterThanOrEqual(climate.avgMinC);
        expect(climate.rainDays, slug).toBeLessThanOrEqual(31);
        expect(climate.precipitationMm, slug).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("lookups", () => {
  it("finds a destination only inside its own country", () => {
    expect(getDestination("portugal", "lisbon")?.name).toBe("Лісабон");
    expect(getDestination("spain", "lisbon")).toBeNull();
    expect(getDestination("portugal", "missing")).toBeNull();
  });

  it("throws for a destination without climate data", () => {
    expect(() => getSeason("atlantis")).toThrow(/atlantis/);
  });
});
