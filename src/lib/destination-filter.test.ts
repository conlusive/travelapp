import { describe, expect, it } from "vitest";
import { verdictFor } from "../domain/season";
import { filterDestinations, parseMonth, type FilterableCard } from "./destination-filter";

function card(name: string, januaryScore: number, unreliable = false): FilterableCard {
  const months = Array.from({ length: 12 }, (_, i) => {
    const score = i === 0 ? januaryScore : 50;
    return { score, verdict: verdictFor(score) };
  });
  return { name, searchFields: [name], months, unreliable };
}

const cards = [card("Прага", 10), card("Дубай", 95), card("Лісабон", 99, true), card("Канкун", 95)];
const names = (list: FilterableCard[]) => list.map((c) => c.name);

describe("parseMonth", () => {
  it.each([
    ["1", 1],
    ["12", 12],
    ["04", 4],
  ])("accepts %s", (value, month) => {
    expect(parseMonth(value)).toBe(month);
  });

  it.each([null, "", "0", "13", "-1", "1.5", "abc", "1e1"])("rejects %j", (value) => {
    expect(parseMonth(value)).toBeNull();
  });
});

describe("filterDestinations", () => {
  it("keeps the original order without a month", () => {
    expect(names(filterDestinations(cards, "", null))).toEqual(names(cards));
  });

  it("ranks by the month score, breaking ties by name and putting unreliable data last", () => {
    expect(names(filterDestinations(cards, "", 1))).toEqual(["Дубай", "Канкун", "Прага", "Лісабон"]);
  });

  it("combines the text query with the month", () => {
    expect(names(filterDestinations(cards, "ду", 1))).toEqual(["Дубай"]);
  });

  it("does not mutate the input", () => {
    const before = names(cards);
    filterDestinations(cards, "", 1);
    expect(names(cards)).toEqual(before);
  });
});
