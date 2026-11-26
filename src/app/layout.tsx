import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "SeasonWise: коли й куди поїхати",
    template: "%s — SeasonWise",
  },
  description:
    "Сезонний планувальник подорожей українською: у які місяці найкомфортніше їхати в обране місце.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex w-full max-w-5xl items-center px-4 py-4 sm:px-6">
            <Link href="/" className="font-bold tracking-wide text-accent uppercase">
              SeasonWise
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
