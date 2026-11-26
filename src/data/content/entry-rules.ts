// Візи та вʼїзд для громадян України з біометричним паспортом, коротка туристична поїздка.
// Переглядати щоквартала (крок 4.3 плану).
import type { EntryRules } from "../../domain/content.ts";
import { official, secondary } from "./sources.ts";

const VERIFIED_AT = "2026-11-27";

const euRegulation = official(
  "EUR-Lex, Регламент (ЄС) 2018/1806",
  "https://eur-lex.europa.eu/eli/reg/2018/1806/oj",
);

const schengen: EntryRules = {
  verifiedAt: VERIFIED_AT,
  facts: [
    {
      text: "Віза для короткої поїздки не потрібна власникам біометричного паспорта України.",
      source: euRegulation,
    },
    {
      text: "Дозволено до 90 днів у будь-якому 180-денному періоді, разом по всій Шенгенській зоні.",
      source: euRegulation,
    },
    {
      text: "На кордоні діє система EES (з 10 квітня 2026 р.): знімають відбитки й фото.",
      source: secondary("Wikipedia: Entry/Exit System", "https://en.wikipedia.org/wiki/Entry/Exit_System"),
    },
    {
      text: "Онлайн-дозвіл ETIAS на дату перевірки ще не запроваджено. Перед поїздкою перевірте, чи це не змінилося.",
      source: secondary(
        "Travel to Europe (за пошуковою видачею)",
        "https://travel-europe.europa.eu/etias/how-to-apply/what-you-need-to-apply",
      ),
    },
  ],
};

const turkishMfa = official(
  "МЗС Туреччини",
  "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa",
);

export const ENTRY_RULES: Record<string, EntryRules> = {
  portugal: schengen,
  czechia: schengen,
  georgia: {
    verifiedAt: VERIFIED_AT,
    facts: [
      {
        text: "Віза не потрібна, перебувати можна до 1 року.",
        source: secondary(
          "Wikipedia: Visa policy of Georgia",
          "https://en.wikipedia.org/wiki/Visa_policy_of_Georgia",
        ),
      },
      {
        text: "З 1 січня 2026 р. туристам обовʼязкове страхування здоровʼя та від нещасних випадків на весь термін, покриття щонайменше 30 000 ларі. Поліс можуть перевірити на кордоні.",
        source: official(
          "Постанова уряду Грузії № 602 (грузинською)",
          "https://matsne.gov.ge/ka/document/view/6728816?publication=0",
        ),
      },
    ],
  },
  turkey: {
    verifiedAt: VERIFIED_AT,
    facts: [
      { text: "Віза не потрібна для поїздок до 90 днів.", source: turkishMfa },
      {
        text: "Радять паспорт, чинний щонайменше 6 місяців від дати прибуття; за законом він має діяти ще мінімум 60 днів після запланованого перебування.",
        source: turkishMfa,
      },
    ],
  },
  thailand: {
    verifiedAt: VERIFIED_AT,
    facts: [
      {
        text: "Без візи до 30 днів із можливістю продовжити ще на 30. Раніше термін був довшим, тому старі поради про 60 днів неактуальні.",
        source: secondary(
          "Wikipedia: Visa policy of Thailand",
          "https://en.wikipedia.org/wiki/Visa_policy_of_Thailand",
        ),
      },
      {
        text: "Перед прибуттям потрібно заповнити онлайн-карту прибуття (TDAC).",
        source: secondary(
          "Wikipedia: Visa policy of Thailand",
          "https://en.wikipedia.org/wiki/Visa_policy_of_Thailand",
        ),
      },
    ],
  },
};
