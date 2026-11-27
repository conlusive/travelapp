import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimatedTitle } from "@/components/motion/AnimatedTitle";
import { SavedBoard } from "@/components/saved/SavedBoard";
import { listCompareItems } from "@/data/compare";

export const metadata: Metadata = {
  title: "Хочу поїхати",
  description: "Ваші збережені напрямки та порівняння погоди, транспорту й умов вʼїзду.",
};

export default function SavedPage() {
  return (
    <>
      <div className="rounded-b-[2rem] bg-ink px-4 pt-28 pb-12 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-7xl">
            <AnimatedTitle text="Хочу поїхати" />
          </h1>
          <p className="mt-4 max-w-2xl animate-rise text-white/75 [animation-delay:400ms]">
            Відберіть кілька місць і порівняйте їх поруч для того часу, коли у вас відпустка.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-8">
        <Suspense fallback={<p className="text-muted">Завантажуємо ваш список…</p>}>
          <SavedBoard items={listCompareItems()} />
        </Suspense>
      </main>
    </>
  );
}
