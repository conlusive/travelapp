import type { DestinationContent } from "../../domain/content.ts";
import { airspaceNotice, rome2rio, viaNeighbourAirport, viaPoland } from "./routes.ts";
import { official, secondary, wikivoyage } from "./sources.ts";

const guide = wikivoyage("Lisbon");
const metro = official("Metropolitano de Lisboa", "https://www.metrolisboa.pt/en/buy/");

export const lisbon: DestinationContent = {
  verifiedAt: "2026-11-27",
  attractions: [
    { name: "Замок Святого Георгія", localName: "Castelo de São Jorge", category: "landmark", visitMinutes: 90, source: guide },
    { name: "Алфама", localName: "Alfama", category: "neighbourhood", visitMinutes: 180, source: guide },
    { name: "Вежа Белен", localName: "Torre de Belém", category: "landmark", visitMinutes: 30, source: guide },
    { name: "Монастир Жеронімуш", localName: "Mosteiro dos Jerónimos", category: "religious", visitMinutes: 60, source: guide },
    { name: "Площа Комерції", localName: "Praça do Comércio", category: "landmark", visitMinutes: 20, source: guide },
    { name: "Байру-Алту", localName: "Bairro Alto", category: "neighbourhood", visitMinutes: 120, source: guide },
    { name: "Ліфт Санта-Жушта", localName: "Elevador de Santa Justa", category: "landmark", visitMinutes: 20, source: guide },
    {
      name: "Національний музей старовинного мистецтва",
      localName: "Museu Nacional de Arte Antiga",
      category: "museum",
      visitMinutes: 90,
      source: official("Visit Lisboa", "https://www.visitlisboa.com/en/places/national-ancient-art-museum"),
      warning: {
        text: "Зазначено, що зачинений на реставрацію з 29 вересня (рік не вказано).",
        source: official("Visit Lisboa", "https://www.visitlisboa.com/en/places/national-ancient-art-museum"),
      },
    },
    {
      name: "Музей Гульбенкяна",
      localName: "Museu Calouste Gulbenkian",
      category: "museum",
      visitMinutes: 120,
      source: official("Visit Lisboa", "https://www.visitlisboa.com/en/places/gulbenkian-museum"),
    },
    { name: "Океанаріум", localName: "Oceanário de Lisboa", category: "nature", visitMinutes: 90, source: guide },
  ],
  fares: [
    { label: "Квиток Carris/Metro на 60 хвилин", price: "1,90 €", source: metro },
    { label: "Квиток Carris/Metro на 24 години", price: "7,25 €", source: metro },
  ],
  tips: [
    { text: "У метро можна прикладати банківську картку прямо на турнікеті.", source: metro },
    { text: "Квиток за 1,90 € не діє для кількох поїздок у метро поспіль.", source: metro },
    { text: "У таксі просіть увімкнути лічильник ще до поїздки.", source: guide },
    { text: "Стережіться кишенькових крадіїв у метро та трамваї № 28.", source: guide },
    { text: "Фунікулер Глорія зазнав аварії у вересні 2025 р.: перевірте, чи він уже працює.", source: guide },
  ],
  routes: {
    kyiv: [
      airspaceNotice,
      viaNeighbourAirport,
      { text: "Є прямий автобус Київ – Лісабон, близько 2,5–3 діб, не щодня.", source: rome2rio("Kyiv", "Lisbon") },
    ],
    lviv: [airspaceNotice, viaPoland],
    warsaw: [
      {
        text: "Прямий рейс, близько 4 год 25 хв (TAP, LOT, Wizz Air; дні різняться).",
        source: rome2rio("Warsaw", "Lisbon"),
      },
      {
        text: "Також є прямі рейси з аеропорту Модлін у певні дні.",
        source: secondary("Rome2Rio: Warsaw – Lisbon", "https://www.rome2rio.com/s/Warsaw/Lisbon"),
      },
    ],
  },
};
