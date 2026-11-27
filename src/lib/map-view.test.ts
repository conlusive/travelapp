import { describe, expect, it } from "vitest";
import {
  MIN_VIEW_WIDTH,
  clampView,
  fitBounds,
  interpolateView,
  panBy,
  toPercent,
  visibleLabels,
  zoomAt,
} from "./map-view";

const world = { width: 2000, height: 1000 };
const whole = { x: 0, y: 0, width: 2000, height: 1000 };

describe("fitBounds", () => {
  it("keeps the container aspect ratio and contains the bounds", () => {
    const view = fitBounds([900, 400, 1000, 600], 2, world, 0);
    expect(view.width / view.height).toBeCloseTo(2);
    expect(view.height).toBeCloseTo(200);
    expect(view.x + view.width / 2).toBeCloseTo(950);
    expect(view.y).toBeCloseTo(400);
  });

  it("stays inside the world for bounds at the edge", () => {
    const view = fitBounds([1950, 950, 2000, 1000], 2, world);
    expect(view.x + view.width).toBeLessThanOrEqual(2000);
    expect(view.y + view.height).toBeLessThanOrEqual(1000);
  });

  it("never zooms past the minimum width", () => {
    expect(fitBounds([500, 500, 500, 500], 2, world).width).toBe(MIN_VIEW_WIDTH);
  });

  it("centres the world when the container is much taller than it", () => {
    const view = fitBounds([0, 0, 2000, 1000], 0.5, world, 0);
    expect(view.width).toBe(2000);
    expect(view.y).toBeLessThan(0);
    expect(view.y + view.height / 2).toBeCloseTo(500);
  });
});

describe("zoomAt and panBy", () => {
  it("keeps the anchored point in place while zooming in", () => {
    const view = zoomAt(whole, 0.5, world, { x: 0.25, y: 0.75 });
    expect(view.width).toBe(1000);
    expect(view.x + 0.25 * view.width).toBeCloseTo(500);
    expect(view.y + 0.75 * view.height).toBeCloseTo(750);
  });

  it("cannot zoom out beyond the world", () => {
    expect(zoomAt(whole, 4, world)).toEqual(whole);
  });

  it("pans in view fractions and stops at the border", () => {
    const view = { x: 500, y: 250, width: 500, height: 250 };
    expect(panBy(view, 0.1, 0, world).x).toBe(450);
    expect(panBy(view, 100, 100, world)).toMatchObject({ x: 0, y: 0 });
  });

  it("leaves a valid view unchanged", () => {
    const view = { x: 100, y: 100, width: 400, height: 200 };
    expect(clampView(view, world)).toEqual(view);
  });
});

describe("interpolateView", () => {
  const to = { x: 900, y: 400, width: 200, height: 100 };

  it("returns the endpoints", () => {
    expect(interpolateView(whole, to, 0)).toEqual(whole);
    const end = interpolateView(whole, to, 1);
    expect(end.x).toBeCloseTo(to.x);
    expect(end.width).toBeCloseTo(to.width);
  });

  it("scales geometrically in the middle", () => {
    expect(interpolateView(whole, to, 0.5).width).toBeCloseTo(Math.sqrt(2000 * 200));
  });
});

describe("toPercent", () => {
  it("maps view corners to 0 and 100 percent", () => {
    const view = { x: 10, y: 20, width: 100, height: 50 };
    expect(toPercent(view, 10, 20)).toEqual({ left: 0, top: 0 });
    expect(toPercent(view, 110, 70)).toEqual({ left: 100, top: 100 });
  });
});

describe("visibleLabels", () => {
  const point = (id: string, left: number, top: number) => ({ id, left, top, text: "Місто" });

  it("shows labels that do not collide", () => {
    expect(visibleLabels([point("a", 0, 0), point("b", 300, 0)])).toEqual(new Set(["a", "b"]));
  });

  it("gives priority to the earlier point when labels overlap", () => {
    expect(visibleLabels([point("a", 0, 0), point("b", 20, 4)]).has("b")).toBe(true);
    expect(visibleLabels([point("a", 0, 0), point("b", 20, 4)]).has("a")).toBe(false);
    expect(visibleLabels([point("a", 0, 0), point("b", -30, 4)])).toEqual(new Set(["a"]));
  });
});
