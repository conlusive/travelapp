import { describe, expect, it } from "vitest";
import { verdictFor } from "../domain/season";
import { filterDestinations, type FilterableCard } from "./destination-filter";

function card(name: string, januaryScore: number, unreliable = false): FilterableCard {
  const months = Array.from({ length: 12 }, (_, i) => {
    const score = i === 0 ? januaryScore : 50;
    return { score, verdict: verdictFor(score) };
  });
  return { name, searchFields: [name], months, unreliable };
}

const cards = [card("Прага", 10), card("Дубай", 95), card("Лісабон", 99, true), card("Канкун", 95)];
const names = (list: FilterableCard[]) => list.map((c) => c.name);

const january = { kind: "month", month: 1 } as const;

describe("filterDestinations", () => {
  it("keeps the original order without a period", () => {
    expect(names(filterDestinations(cards, "", null))).toEqual(names(cards));
  });

  it("ranks by the month score, breaking ties by name and putting unreliable data last", () => {
    expect(names(filterDestinations(cards, "", january))).toEqual(["Дубай", "Канкун", "Прага", "Лісабон"]);
  });

  it("ranks by the season average", () => {
    // Січневі оцінки різні, решта однакові: зимовий порядок повторює січневий.
    const winter = filterDestinations(cards, "", { kind: "season", season: "winter" });
    expect(names(winter)).toEqual(["Дубай", "Канкун", "Прага", "Лісабон"]);
  });

  it("combines the text query with the month", () => {
    expect(names(filterDestinations(cards, "ду", january))).toEqual(["Дубай"]);
  });

  it("does not mutate the input", () => {
    const before = names(cards);
    filterDestinations(cards, "", january);
    expect(names(cards)).toEqual(before);
  });
});
