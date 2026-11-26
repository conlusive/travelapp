// Напрямки з перевіреним ручним контентом, ключ — slug напрямку.
import type { DestinationContent } from "../../domain/content.ts";
import { antalya } from "./antalya.ts";
import { bangkok } from "./bangkok.ts";
import { lisbon } from "./lisbon.ts";
import { prague } from "./prague.ts";
import { tbilisi } from "./tbilisi.ts";

export const DESTINATION_CONTENT: Record<string, DestinationContent> = {
  antalya,
  bangkok,
  lisbon,
  prague,
  tbilisi,
};
