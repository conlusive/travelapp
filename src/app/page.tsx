import { SeasonCalendarPreview } from "@/components/SeasonCalendarPreview";
import { SubscribeForm } from "@/components/SubscribeForm";

const FEATURES = [
  {
    title: "Коли їхати",
    text: "Календар на 12 місяців із вердиктом: погода, натовпи й ціни разом, а не окремо.",
  },
  {
    title: "Скільки коштує",
    text: "Орієнтовні діапазони цін на ночівлю, їжу й транспорт на місці, з датою перевірки.",
  },
  {
    title: "Як дістатися",
    text: "Дорога з Києва, Львова чи Варшави: способи, час і приблизна вартість.",
  },
  {
    title: "Візи для українців",
    text: "Безвіз чи віза, коротко й українською, з посиланням на офіційне джерело.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20">
      <header className="flex flex-col items-start gap-6">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">SeasonWise</p>
        <h1 className="max-w-3xl text-4xl leading-tight font-bold sm:text-5xl">
          Коли їхати, скільки це коштує і як дістатися: усе в одному місці
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Обираєте країну чи місто й одразу бачите найкращий сезон, ціни, дорогу з вашого міста та
          візові умови. Українською, без п’яти відкритих вкладок.
        </p>
        <SubscribeForm />
      </header>

      <SeasonCalendarPreview />

      <section aria-labelledby="features-title" className="flex flex-col gap-6">
        <h2 id="features-title" className="text-2xl font-bold">
          Що буде в сервісі
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border pt-6 text-sm text-muted">
        Ціни й дати в сервісі будуть орієнтовними: перед поїздкою перевіряйте їх на офіційних
        сайтах.
      </footer>
    </main>
  );
}
