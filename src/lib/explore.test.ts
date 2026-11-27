import { describe, expect, it } from "vitest";
import { verdictFor } from "../domain/season";
import {
  filterBySelection,
  goodWeatherByMonth,
  parseSelection,
  seasonHighlights,
  suggest,
  type ExploreCountry,
  type ExplorePlace,
} from "./explore";

const countries: ExploreCountry[] = [
  { slug: "portugal", name: "Португалія", region: "europe" },
  { slug: "spain", name: "Іспанія", region: "europe" },
  { slug: "thailand", name: "Таїланд", region: "asia" },
];

const places: ExplorePlace[] = [
  { slug: "lisbon", name: "Лісабон", searchName: "Lisbon", countrySlug: "portugal", region: "europe" },
  { slug: "barcelona", name: "Барселона", searchName: "Barcelona", countrySlug: "spain", region: "europe" },
  { slug: "bangkok", name: "Бангкок", searchName: "Bangkok", countrySlug: "thailand", region: "asia" },
];

describe("parseSelection", () => {
  it("derives the region from a known country, ignoring a conflicting region", () => {
    expect(parseSelection("asia", "spain", countries)).toEqual({ region: "europe", country: "spain" });
  });

  it("keeps a valid region and drops unknown values", () => {
    expect(parseSelection("asia", "atlantis", countries)).toEqual({ region: "asia", country: null });
    expect(parseSelection("mars", null, countries)).toEqual({ region: null, country: null });
  });
});

describe("filterBySelection", () => {
  const slugs = (region: "europe" | "asia" | null, country: string | null) =>
    filterBySelection(places, { region, country }).map((p) => p.slug);

  it("narrows from world to region to country", () => {
    expect(slugs(null, null)).toHaveLength(3);
    expect(slugs("europe", null)).toEqual(["lisbon", "barcelona"]);
    expect(slugs("europe", "spain")).toEqual(["barcelona"]);
  });
});

describe("suggest", () => {
  const labels = (query: string) => suggest(query, countries, places).map((s) => s.label);

  it("returns nothing for an empty query", () => {
    expect(labels("  ")).toEqual([]);
  });

  it("finds regions, countries and cities", () => {
    expect(suggest("євро", countries, places)[0]).toMatchObject({ type: "region", id: "europe" });
    expect(suggest("порт", countries, places)[0]).toMatchObject({ type: "country", id: "portugal" });
    expect(suggest("lisb", countries, places)[0]).toMatchObject({ type: "destination", id: "lisbon" });
  });

  it("ranks matches at the start of a word before matches inside it", () => {
    const result = labels("ба");
    expect(result.slice(0, 2).sort()).toEqual(["Бангкок", "Барселона"]);
    expect(labels("банг")).toEqual(["Бангкок"]);
  });

  it("respects the limit", () => {
    expect(suggest("а", countries, places, 2)).toHaveLength(2);
  });
});

const card = (name: string, score: number, unreliable = false) => ({
  name,
  searchFields: [name],
  months: Array.from({ length: 12 }, () => ({ score, verdict: verdictFor(score) })),
  unreliable,
});

describe("seasonHighlights", () => {
  it("gives every season a different reliable destination", () => {
    const cards = [card("A", 90), card("B", 80), card("C", 99, true), card("D", 70), card("E", 60)];
    const result = seasonHighlights(cards);
    expect(result.map((r) => r.card.name)).toEqual(["A", "B", "D", "E"]);
    expect(result.map((r) => r.letter).join("")).toBe("КОЛИ");
    expect(result.map((r) => r.id)).toEqual(["winter", "spring", "summer", "autumn"]);
  });

  it("fails loudly when there are not enough destinations", () => {
    expect(() => seasonHighlights([card("A", 90)])).toThrow();
  });
});

describe("goodWeatherByMonth", () => {
  it("counts good and ideal months among reliable destinations only", () => {
    const result = goodWeatherByMonth([card("A", 90), card("B", 55), card("C", 54), card("D", 99, true)]);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ good: 2, total: 3 });
  });

  it("handles an empty selection", () => {
    expect(goodWeatherByMonth([])[5]).toEqual({ good: 0, total: 0 });
  });
});
