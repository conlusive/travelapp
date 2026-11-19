type Verdict = "ideal" | "good" | "meh" | "avoid";

const MONTHS: { label: string; verdict: Verdict }[] = [
  { label: "Січ", verdict: "avoid" },
  { label: "Лют", verdict: "avoid" },
  { label: "Бер", verdict: "meh" },
  { label: "Кві", verdict: "good" },
  { label: "Тра", verdict: "ideal" },
  { label: "Чер", verdict: "good" },
  { label: "Лип", verdict: "meh" },
  { label: "Сер", verdict: "meh" },
  { label: "Вер", verdict: "ideal" },
  { label: "Жов", verdict: "good" },
  { label: "Лис", verdict: "meh" },
  { label: "Гру", verdict: "avoid" },
];

const VERDICTS: Record<Verdict, { name: string; className: string }> = {
  ideal: { name: "Ідеально", className: "bg-verdict-ideal" },
  good: { name: "Добре", className: "bg-verdict-good" },
  meh: { name: "Так собі", className: "bg-verdict-meh" },
  avoid: { name: "Уникати", className: "bg-verdict-avoid" },
};

export function SeasonCalendarPreview() {
  return (
    <figure className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <ul className="grid grid-cols-6 gap-2 sm:grid-cols-12" aria-label="Приклад календаря сезонів">
        {MONTHS.map(({ label, verdict }) => (
          <li key={label} className="flex flex-col items-center gap-1.5">
            <span
              className={`h-12 w-full rounded-lg ${VERDICTS[verdict].className}`}
              title={VERDICTS[verdict].name}
            />
            <span className="text-xs text-muted">{label}</span>
            <span className="sr-only">{VERDICTS[verdict].name}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {Object.values(VERDICTS).map(({ name, className }) => (
          <li key={name} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />
            {name}
          </li>
        ))}
      </ul>
      <figcaption className="mt-3 text-xs text-muted">
        Ілюстрація: так виглядатиме календар сезонів. Кольори тут умовні, не реальні дані.
      </figcaption>
    </figure>
  );
}
