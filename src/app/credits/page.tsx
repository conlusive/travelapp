import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listDestinations } from "@/data/catalog";
import { getPhoto } from "@/data/photos";

export const metadata: Metadata = {
  title: "Джерела та автори фото",
  description: "Автори фотографій, ліцензії та джерела даних SeasonWise.",
};

export default function CreditsPage() {
  return (
    <>
      <div className="rounded-b-[2rem] bg-ink px-4 pt-28 pb-12 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Джерела</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Фото з Wikimedia Commons: ми змінили їхній розмір і стиснули. Контури карти — Natural
            Earth. Джерела фактів вказано біля кожного з них.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listDestinations().map((destination) => {
            const photo = getPhoto(destination.slug);
            return (
              <li key={destination.slug} className="flex gap-4 rounded-3xl border border-border p-3">
                <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={photo.src} alt="" fill sizes="96px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-col gap-1 text-sm">
                  <strong>{destination.name}</strong>
                  <span className="break-words text-muted">{photo.author}</span>
                  <span className="flex flex-wrap gap-x-3">
                    {photo.licenseUrl ? (
                      <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        {photo.license}
                      </a>
                    ) : (
                      <span>{photo.license}</span>
                    )}
                    <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      Оригінал
                    </a>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <Link href="/#map" className="mt-10 inline-block font-bold underline underline-offset-4">
          До карти напрямків
        </Link>
      </main>
    </>
  );
}
