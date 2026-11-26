import type { DestinationContent } from "../../domain/content.ts";
import { airspaceNotice, rome2rio, viaNeighbourAirport, viaPoland } from "./routes.ts";
import { official, wikivoyage } from "./sources.ts";

const guide = wikivoyage("Antalya");
const antalyaMuseum = official("muze.gov.tr", "https://muze.gov.tr/muze-detay?SectionId=ANT01&DistId=ANT");
const perge = official("muze.gov.tr", "https://muze.gov.tr/muze-detay?SectionId=PRG01&DistId=PRG");
const card = official("Antalyakart", "http://www.antalyakart.com.tr/Page/KartCesitleri");

export const antalya: DestinationContent = {
  verifiedAt: "2026-11-27",
  attractions: [
    { name: "Старе місто Калеїчі", localName: "Kaleiçi", category: "neighbourhood", visitMinutes: 120, source: guide },
    { name: "Ворота Адріана", localName: "Hadrian's Gate", category: "landmark", visitMinutes: 20, source: guide },
    { name: "Мечеть із мінаретом Ївлі", localName: "Yivli Minare", category: "religious", visitMinutes: 20, source: guide },
    {
      name: "Археологічний музей Анталії",
      localName: "Antalya Müzesi",
      category: "museum",
      visitMinutes: 120,
      source: antalyaMuseum,
      price: { text: "15 €", source: antalyaMuseum },
      warning: { text: "Під час перевірки сайт показував «зачинено». Уточніть перед візитом.", source: antalyaMuseum },
    },
    { name: "Вежа Хидирлик", localName: "Hıdırlık Kulesi", category: "landmark", visitMinutes: 20, source: guide },
    { name: "Водоспади Дюден", localName: "Düden Şelalesi", category: "nature", visitMinutes: 60, source: guide },
    {
      name: "Античне місто Перге",
      localName: "Perge",
      category: "landmark",
      visitMinutes: 120,
      source: perge,
      price: { text: "11 €", source: perge },
    },
    { name: "Аспендос", localName: "Aspendos", category: "landmark", visitMinutes: 120, source: guide },
    {
      name: "Гора Тюнектепе",
      localName: "Tünektepe",
      category: "viewpoint",
      visitMinutes: 60,
      source: guide,
      warning: { text: "Канатну дорогу позначено зачиненою після аварії у квітні 2024 р.", source: guide },
    },
    { name: "Водоспад Куршунлу", localName: "Kurşunlu Şelalesi", category: "nature", visitMinutes: 60, source: guide },
  ],
  fares: [{ label: "Картка Antalyakart (сама картка, без поїздок)", price: "100 TL", source: card }],
  faresNote: "Вартість разової поїздки на офіційних сторінках підтвердити не вдалося.",
  tips: [
    { text: "В автобусах і трамваях можна платити безконтактною банківською карткою.", source: card },
    { text: "В аеропорту не вірте зазивалам, які кажуть, що автобуси не ходять.", source: guide },
    { text: "На морські прогулянки не погоджуйтеся на першу названу ціну й час.", source: guide },
  ],
  routes: {
    kyiv: [airspaceNotice, viaNeighbourAirport],
    lviv: [airspaceNotice, viaPoland],
    warsaw: [
      {
        text: "Прямі рейси близько 3 год (Pegasus, SunExpress, Corendon) у певні дні; сезонність перевіряйте.",
        source: rome2rio("Warsaw", "Antalya"),
      },
    ],
  },
};
