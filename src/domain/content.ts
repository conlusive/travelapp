// Типи ручного контенту (крок 4.1 плану). Кожен факт має джерело.

/** official — сайт установи чи оператора; secondary — довідник, агрегатор або ЗМІ. */
export type Reliability = "official" | "secondary";

export type Source = {
  url: string;
  label: string;
  reliability: Reliability;
};

export type SourcedFact = {
  text: string;
  source: Source;
};

export const ATTRACTION_CATEGORIES = {
  landmark: "Памʼятки",
  museum: "Музеї",
  religious: "Святині",
  neighbourhood: "Райони",
  viewpoint: "Види",
  nature: "Природа",
  market: "Ринки",
} as const;

export type AttractionCategory = keyof typeof ATTRACTION_CATEGORIES;

export type Attraction = {
  name: string;
  /** Назва латиницею — для пошуку на місці й на карті. */
  localName: string;
  category: AttractionCategory;
  /** Орієнтовна оцінка редакції, не з джерела. */
  visitMinutes: number;
  source: Source;
  /** Лише ціни з офіційного сайту. */
  price?: { text: string; source: Source };
  warning?: SourcedFact;
};

export type Fare = {
  label: string;
  price: string;
  source: Source;
};

export const ORIGINS = [
  { id: "kyiv", name: "Київ", searchName: "Kyiv" },
  { id: "lviv", name: "Львів", searchName: "Lviv" },
  { id: "warsaw", name: "Варшава", searchName: "Warsaw" },
] as const;

export type OriginId = (typeof ORIGINS)[number]["id"];

export type RouteOption = {
  text: string;
  /** Без джерела — загальна порада, а не перевірений рейс. */
  source?: Source;
};

export type DestinationContent = {
  /** YYYY-MM-DD */
  verifiedAt: string;
  attractions: Attraction[];
  fares: Fare[];
  faresNote?: string;
  tips: SourcedFact[];
  routes: Partial<Record<OriginId, RouteOption[]>>;
};

export type EntryRules = {
  /** YYYY-MM-DD */
  verifiedAt: string;
  facts: SourcedFact[];
};
