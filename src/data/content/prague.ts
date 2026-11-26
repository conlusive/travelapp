import type { DestinationContent } from "../../domain/content.ts";
import { airspaceNotice, rome2rio, viaNeighbourAirport } from "./routes.ts";
import { official, wikivoyage } from "./sources.ts";

const guide = wikivoyage("Prague");
const dpp = official("DPP (транспорт Праги)", "https://www.dpp.cz/en/fares/fare-pricelist");
const oldTownHall = official(
  "Prague City Tourism",
  "https://prague.eu/en/objevujte/old-town-hall-with-astronomical-clock-staromestska-radnice-s-orlojem/",
);
const petrin = official(
  "Prague City Tourism",
  "https://prague.eu/en/objevujte/petrin-tower-petrinska-rozhledna/",
);
const lvivRoute = rome2rio("Lviv", "Prague");
const warsawRoute = rome2rio("Warsaw", "Prague");

export const prague: DestinationContent = {
  verifiedAt: "2026-11-27",
  attractions: [
    { name: "Празький град", localName: "Pražský hrad", category: "landmark", visitMinutes: 180, source: guide },
    { name: "Собор святого Віта", localName: "Katedrála sv. Víta", category: "religious", visitMinutes: 60, source: guide },
    {
      name: "Карлів міст",
      localName: "Karlův most",
      category: "landmark",
      visitMinutes: 30,
      source: official("Prague City Tourism", "https://prague.eu/en/objevujte/charles-bridge-karluv-most/"),
    },
    {
      name: "Староміська ратуша з курантами",
      localName: "Staroměstská radnice s orlojem",
      category: "landmark",
      visitMinutes: 60,
      source: oldTownHall,
      price: { text: "350 Kč (дорослий)", source: oldTownHall },
    },
    { name: "Йозефов (єврейський квартал)", localName: "Josefov", category: "neighbourhood", visitMinutes: 120, source: guide },
    {
      name: "Петршинська оглядова вежа",
      localName: "Petřínská rozhledna",
      category: "viewpoint",
      visitMinutes: 45,
      source: petrin,
      price: { text: "250 Kč (дорослий)", source: petrin },
    },
    { name: "Мала Страна", localName: "Malá Strana", category: "neighbourhood", visitMinutes: 120, source: guide },
    { name: "Вацлавська площа", localName: "Václavské náměstí", category: "landmark", visitMinutes: 20, source: guide },
    { name: "Національний музей", localName: "Národní muzeum", category: "museum", visitMinutes: 90, source: guide },
    { name: "Танцюючий дім", localName: "Tančící dům", category: "landmark", visitMinutes: 15, source: guide },
  ],
  fares: [
    { label: "Квиток на 90 хвилин", price: "50 Kč (у застосунку 46 Kč)", source: dpp },
    { label: "Квиток на 24 години", price: "150 Kč (у застосунку 140 Kč)", source: dpp },
    { label: "Квиток на 72 години", price: "350 Kč (у застосунку 340 Kč)", source: dpp },
  ],
  tips: [
    { text: "Квитки до ратуші купуйте лише в Prague City Tourism: куплені деінде можуть бути недійсними.", source: oldTownHall },
    { text: "Квиток у застосунку починає діяти за хвилину після активації, тож купуйте до посадки.", source: guide },
    { text: "Не сідайте в таксі на стоянці біля головного вокзалу: викликайте через застосунок.", source: guide },
    { text: "Кишенькові крадії працюють біля метро, на Карловому мосту, Вацлавській і Староміській площах.", source: guide },
  ],
  routes: {
    kyiv: [airspaceNotice, viaNeighbourAirport],
    lviv: [
      airspaceNotice,
      { text: "Прямий автобус, близько 8–9 год без урахування черг на кордоні.", source: lvivRoute },
      { text: "Поїздом до Перемишля, далі поїздом до Праги: разом близько 11 год.", source: lvivRoute },
    ],
    warsaw: [
      { text: "Прямий рейс LOT, близько 1 год 20 хв.", source: warsawRoute },
      { text: "Поїзд (PKP Intercity, Leo Express), близько 8,5–9 год.", source: warsawRoute },
      { text: "Автобус RegioJet, близько 9 год 20 хв.", source: warsawRoute },
    ],
  },
};
