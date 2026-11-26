import { describe, expect, it } from "vitest";
import { ATTRACTION_CATEGORIES, ORIGINS, type Source } from "../../domain/content";
import { getCountry, getDestination, listDestinations } from "../catalog";
import { ENTRY_RULES } from "./entry-rules";
import { DESTINATION_CONTENT } from "./index";

const entries = Object.entries(DESTINATION_CONTENT);

function expectValidDate(value: string) {
  expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(Number.isNaN(Date.parse(value))).toBe(false);
}

function expectValidSource(source: Source, context: string) {
  expect(source.label.length, context).toBeGreaterThan(0);
  expect(() => new URL(source.url), context).not.toThrow();
  expect(new URL(source.url).protocol, context).toMatch(/^https?:$/);
}

describe("destination content", () => {
  it("belongs to existing destinations", () => {
    const slugs = new Set(listDestinations().map((d) => d.slug));
    for (const [slug] of entries) expect(slugs.has(slug), slug).toBe(true);
  });

  it.each(entries)("%s: has ten unique attractions with known categories", (_slug, content) => {
    expect(content.attractions).toHaveLength(10);
    expect(new Set(content.attractions.map((a) => a.name)).size).toBe(10);
    for (const attraction of content.attractions) {
      expect(Object.keys(ATTRACTION_CATEGORIES)).toContain(attraction.category);
      expect(attraction.visitMinutes).toBeGreaterThan(0);
    }
  });

  it.each(entries)("%s: sources every fact and dates the check", (slug, content) => {
    expectValidDate(content.verifiedAt);
    for (const a of content.attractions) {
      expectValidSource(a.source, `${slug} ${a.name}`);
      if (a.price) expect(a.price.source.reliability, a.name).toBe("official");
      if (a.warning) expectValidSource(a.warning.source, a.name);
    }
    for (const fact of [...content.fares, ...content.tips]) expectValidSource(fact.source, slug);
  });

  it.each(entries)("%s: describes a route from every origin", (_slug, content) => {
    for (const { id } of ORIGINS) expect(content.routes[id]?.length, id).toBeGreaterThan(0);
  });
});

describe("entry rules", () => {
  it("covers the country of every destination that has content", () => {
    for (const destination of listDestinations()) {
      if (!DESTINATION_CONTENT[destination.slug]) continue;
      expect(ENTRY_RULES[destination.countrySlug], destination.countrySlug).toBeDefined();
      expect(getDestination(destination.countrySlug, destination.slug)).not.toBeNull();
    }
  });

  it("refers to existing countries and sources every fact", () => {
    for (const [slug, rules] of Object.entries(ENTRY_RULES)) {
      expect(getCountry(slug), slug).not.toBeNull();
      expectValidDate(rules.verifiedAt);
      expect(rules.facts.length).toBeGreaterThan(0);
      for (const fact of rules.facts) expectValidSource(fact.source, slug);
    }
  });
});
