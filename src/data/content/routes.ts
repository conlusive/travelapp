// Спільні фрагменти маршрутів. Тривалості — оцінки агрегатора, не розклад перевізника.
import type { RouteOption } from "../../domain/content.ts";
import { secondary } from "./sources.ts";

export const airspaceNotice: RouteOption = {
  text: "Цивільні рейси з України не виконуються: спершу наземний переїзд за кордон.",
  source: secondary(
    "Rome2Rio: поїздки з України",
    "https://help.rome2rio.com/en/support/solutions/articles/22000271866-information-on-international-travel-from-ukraine",
  ),
};

export const viaPoland: RouteOption = {
  text: "Автобусом або поїздом до Польщі, далі літаком (див. вкладку «Варшава»). Закладайте запас часу на кордон.",
};

export const viaNeighbourAirport: RouteOption = {
  text: "Поїздом або автобусом до аеропорту сусідньої країни (Польща, Молдова), далі літаком. Закладайте запас часу на кордон.",
};

export function rome2rio(from: string, to: string) {
  return secondary(`Rome2Rio: ${from} – ${to}`, `https://www.rome2rio.com/s/${from}/${to}`);
}
