import type { DestinationContent } from "../../domain/content.ts";
import { airspaceNotice, rome2rio, viaNeighbourAirport, viaPoland } from "./routes.ts";
import { official, wikivoyage } from "./sources.ts";

const guide = wikivoyage("Bangkok");
const ukGuide = wikivoyage("Бангкок", "uk");
const palace = official("The Grand Palace", "https://www.royalgrandpalace.th");
const boat = official("Chao Phraya Express Boat", "http://www.chaophrayaexpressboat.com/en/home/");
const warsawRoute = rome2rio("Warsaw", "Bangkok");

export const bangkok: DestinationContent = {
  verifiedAt: "2026-11-27",
  attractions: [
    {
      name: "Великий палац і Ват Пхра Кео",
      localName: "Grand Palace, Wat Phra Kaew",
      category: "landmark",
      visitMinutes: 150,
      source: palace,
      price: { text: "500 бат", source: palace },
    },
    { name: "Ват Пхо", localName: "Wat Pho", category: "religious", visitMinutes: 90, source: guide },
    { name: "Ват Арун", localName: "Wat Arun", category: "religious", visitMinutes: 60, source: guide },
    { name: "Національний музей Бангкока", localName: "Bangkok National Museum", category: "museum", visitMinutes: 120, source: guide },
    { name: "Будинок Джима Томпсона", localName: "Jim Thompson House", category: "museum", visitMinutes: 60, source: guide },
    { name: "Ринок вихідного дня Чатучак", localName: "Chatuchak Weekend Market", category: "market", visitMinutes: 180, source: guide },
    { name: "Вулиця Каосан", localName: "Khao San Road", category: "neighbourhood", visitMinutes: 90, source: guide },
    { name: "Яоварат (Чайнатаун)", localName: "Yaowarat", category: "neighbourhood", visitMinutes: 120, source: guide },
    {
      name: "Плавучий ринок Дамноен Садуак",
      localName: "Damnoen Saduak Floating Market",
      category: "market",
      visitMinutes: 180,
      source: ukGuide,
      warning: { text: "Далеко від міста, близько 100 км.", source: ukGuide },
    },
    { name: "Парк Лумпхіні", localName: "Lumphini Park", category: "nature", visitMinutes: 60, source: guide },
  ],
  fares: [
    { label: "Річковий трамвай Chao Phraya Express, за поїздку (залежно від лінії, пн–пт)", price: "16–35 бат", source: boat },
  ],
  faresNote: "Тарифи метро BTS і MRT підтвердити текстом не вдалося.",
  tips: [
    { text: "До Великого палацу закривайте плечі, торс і ноги: у шортах можуть не пустити.", source: guide },
    { text: "«Безкоштовна» поїздка на тук-туку може закінчитися в крамницях із навʼязливими продажами. Ціну узгоджуйте наперед.", source: guide },
    { text: "У таксі просіть увімкнути лічильник і уникайте машин, що чекають біля готелів та памʼяток.", source: guide },
    { text: "На мототаксі домовляйтеся про ціну наперед і вдягайте шолом: він обовʼязковий.", source: guide },
  ],
  routes: {
    kyiv: [airspaceNotice, viaNeighbourAirport],
    lviv: [airspaceNotice, viaPoland],
    warsaw: [
      { text: "Прямий рейс LOT, близько 10 год 20 хв, не щодня; сезонність перевіряйте.", source: warsawRoute },
      { text: "З пересадкою в Делі, близько 15 год.", source: warsawRoute },
    ],
  },
};
