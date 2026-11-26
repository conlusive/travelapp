// Зовнішні пошукові посилання без партнерських параметрів (партнерки — Фаза 5 плану).

export function bookingSearchUrl(city: string): string {
  return `https://www.booking.com/searchresults.html?${new URLSearchParams({ ss: city })}`;
}

function slugForPath(city: string): string {
  return encodeURIComponent(city.replaceAll(" ", "-"));
}

export function numbeoUrl(city: string): string {
  return `https://www.numbeo.com/cost-of-living/in/${slugForPath(city)}`;
}

export function rome2rioUrl(from: string, to: string): string {
  return `https://www.rome2rio.com/s/${slugForPath(from)}/${slugForPath(to)}`;
}

export function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query })}`;
}
