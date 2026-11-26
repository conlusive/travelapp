import type { DestinationContent } from "../../domain/content.ts";
import { airspaceNotice, rome2rio, viaNeighbourAirport, viaPoland } from "./routes.ts";
import { official, wikivoyage } from "./sources.ts";

const guide = wikivoyage("Tbilisi");
const ukGuide = wikivoyage("Тбілісі", "uk");
const museum = official("Національний музей Грузії", "https://museum.ge/index.php?m=319");
const transport = official("Tbilisi Transport Company", "https://ttc.com.ge/ka/tariff/48");
const warsawRoute = rome2rio("Warsaw", "Tbilisi");

export const tbilisi: DestinationContent = {
  verifiedAt: "2026-11-27",
  attractions: [
    { name: "Старе місто (Кала)", localName: "Kala", category: "neighbourhood", visitMinutes: 120, source: guide },
    {
      name: "Фортеця Нарікала",
      localName: "Narikala",
      category: "landmark",
      visitMinutes: 60,
      source: guide,
      warning: { text: "Позначена тимчасово зачиненою (запис від травня 2024 р.), перевірте.", source: guide },
    },
    { name: "Сірчані лазні Абанотубані", localName: "Abanotubani", category: "landmark", visitMinutes: 90, source: guide },
    { name: "Собор Святої Трійці (Самеба)", localName: "Sameba Cathedral", category: "religious", visitMinutes: 45, source: guide },
    { name: "Церква Метехі", localName: "Metekhi Church", category: "religious", visitMinutes: 30, source: ukGuide },
    {
      name: "Національний музей Грузії",
      localName: "Simon Janashia Museum of Georgia",
      category: "museum",
      visitMinutes: 120,
      source: museum,
      price: { text: "40 ларі (дорослий іноземець; таблиця на сайті може бути давньою)", source: museum },
    },
    { name: "Етнографічний музей просто неба", localName: "Open Air Museum of Ethnography", category: "museum", visitMinutes: 150, source: guide },
    { name: "Гора Мтацмінда", localName: "Mtatsminda", category: "viewpoint", visitMinutes: 120, source: guide },
    { name: "Монумент «Мати Грузія»", localName: "Kartlis Deda", category: "landmark", visitMinutes: 30, source: guide },
    { name: "Черепахове озеро", localName: "Turtle Lake", category: "nature", visitMinutes: 120, source: guide },
  ],
  fares: [
    { label: "Проїзд, 90 хвилин пересадок (Metromoney або банківська картка)", price: "1 ларі", source: transport },
    { label: "Денний безліміт (лише абонементна картка)", price: "3 ларі", source: transport },
    { label: "Транспортна картка", price: "2 ларі", source: transport },
    { label: "Канатна дорога Ріке – Нарікала, в один бік", price: "2,5 ларі", source: transport },
  ],
  faresNote: "Сторінка тарифів на сайті перевізника датована 2019 роком.",
  tips: [
    { text: "В аеропорту не йдіть за таксистами, які підходять біля видачі багажу: ціна буде в рази вищою.", source: guide },
    { text: "У лазнях домовтеся про повну ціну наперед: після масажу її можуть подвоїти.", source: guide },
    { text: "У маршрутках з туристів інколи беруть більше: спитайте ціну в місцевих.", source: guide },
    { text: "Квитки в музеї є онлайн на biletebi.ge; останній квиток продають за 30 хвилин до закриття.", source: museum },
  ],
  routes: {
    kyiv: [airspaceNotice, viaNeighbourAirport],
    lviv: [airspaceNotice, viaPoland],
    warsaw: [
      { text: "Прямий рейс LOT, близько 3 год 40 хв, не щодня.", source: warsawRoute },
      { text: "З пересадкою у Відні чи Стамбулі, приблизно 6,5–8 год.", source: warsawRoute },
    ],
  },
};
