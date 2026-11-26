export type Country = {
  slug: string;
  name: string;
  currency: string;
  language: string;
};

export type DestinationType = "city" | "resort" | "nature";

export type Destination = {
  slug: string;
  countrySlug: string;
  name: string;
  /** Назва англійською для пошукових посилань. */
  searchName: string;
  type: DestinationType;
  lat: number;
  lng: number;
  /** Кліматичні дані помітно розходяться з еталоном (docs/phase-1/climate-accuracy.md). */
  climateCaveat?: boolean;
};

/** Багаторічні середні за один календарний місяць. */
export type MonthlyClimate = {
  /** 1–12 */
  month: number;
  /** Середній денний максимум, °C */
  avgMaxC: number;
  /** Середній денний мінімум, °C */
  avgMinC: number;
  /** Середня сума опадів за місяць, мм */
  precipitationMm: number;
  /** Середня кількість днів з опадами ≥ 1 мм */
  rainDays: number;
};
