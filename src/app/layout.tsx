import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
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
    <html lang="uk" data-scroll-behavior="smooth" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
