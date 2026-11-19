import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "SeasonWise: коли їхати, скільки коштує, як дістатися",
  description:
    "Сезонний планувальник подорожей українською: найкращий час для поїздки, орієнтовні ціни, дорога з вашого міста та візи для українців. Залишіть email, щоб отримати ранній доступ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
