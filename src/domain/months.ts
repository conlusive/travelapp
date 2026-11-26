export const MONTH_NAMES = [
  { short: "Січ", full: "Січень" },
  { short: "Лют", full: "Лютий" },
  { short: "Бер", full: "Березень" },
  { short: "Кві", full: "Квітень" },
  { short: "Тра", full: "Травень" },
  { short: "Чер", full: "Червень" },
  { short: "Лип", full: "Липень" },
  { short: "Сер", full: "Серпень" },
  { short: "Вер", full: "Вересень" },
  { short: "Жов", full: "Жовтень" },
  { short: "Лис", full: "Листопад" },
  { short: "Гру", full: "Грудень" },
] as const;

/** month: 1–12 */
export function monthName(month: number) {
  const name = MONTH_NAMES[month - 1];
  if (!name) throw new Error(`Invalid month: ${month}`);
  return name;
}
