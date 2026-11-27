import Link from "next/link";
import { ClimateAttribution } from "./ClimateAttribution";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 sm:px-8">
        <p className="font-extrabold">SeasonWise.</p>
        <p className="text-xs text-muted">
          Ціни, розклади й правила вʼїзду змінюються: перевіряйте їх перед поїздкою.
        </p>
        <ClimateAttribution />
        <p className="text-xs text-muted">
          Карта: Natural Earth.{" "}
          <Link href="/credits" className="underline underline-offset-2">
            Автори фото та ліцензії
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
