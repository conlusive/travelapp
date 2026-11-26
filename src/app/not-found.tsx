import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">Такої сторінки немає</h1>
      <p className="text-muted">Можливо, цей напрямок ще не додано.</p>
      <Link href="/" className="font-semibold text-accent hover:underline">
        До списку напрямків
      </Link>
    </main>
  );
}
