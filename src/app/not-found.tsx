import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70svh] flex-1 flex-col items-start justify-end gap-5 rounded-b-[2rem] bg-ink px-4 pt-28 pb-16 text-white sm:px-16">
      <p aria-hidden="true" className="text-8xl font-extrabold text-white/20 sm:text-9xl">
        404
      </p>
      <h1 className="text-3xl font-extrabold sm:text-5xl">Такої сторінки немає</h1>
      <p className="text-white/65">Можливо, цей напрямок ще не додано.</p>
      <Link href="/#map" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-bold text-black">
        До карти напрямків
      </Link>
    </main>
  );
}
