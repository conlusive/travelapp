import { describe, expect, it } from "vitest";
import { bookingSearchUrl, mapSearchUrl, numbeoUrl, rome2rioUrl } from "./links";

describe("external links", () => {
  it("encodes query parameters", () => {
    expect(bookingSearchUrl("Rio de Janeiro")).toBe(
      "https://www.booking.com/searchresults.html?ss=Rio+de+Janeiro",
    );
    expect(new URL(mapSearchUrl("Wat Pho & Arun, Bangkok")).searchParams.get("query")).toBe(
      "Wat Pho & Arun, Bangkok",
    );
  });

  it("replaces spaces in path segments and escapes unsafe characters", () => {
    expect(numbeoUrl("New York")).toBe("https://www.numbeo.com/cost-of-living/in/New-York");
    expect(rome2rioUrl("Warsaw", "a/b?c")).toBe("https://www.rome2rio.com/s/Warsaw/a%2Fb%3Fc");
  });
});
