import Link from "next/link";

// На телефоні лишаємо тільки карту: «Джерела» є в підвалі.
const LINKS = [
  { href: "/#map", label: "Карта", className: "" },
  { href: "/credits", label: "Джерела", className: "max-sm:hidden" },
];

/** Шапка лежить поверх темної обкладинки, яка є на кожній сторінці. */
export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-4 sm:gap-6 sm:px-8">
        <Link href="/" className="mr-auto text-xl font-extrabold tracking-tight">
          SeasonWise.
        </Link>
        <nav aria-label="Головне меню">
          <ul className="flex items-center gap-1 sm:gap-4">
            {LINKS.map((link) => (
              <li key={link.href} className={link.className}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-white/80 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/#subscribe"
          className="inline-flex min-h-11 items-center rounded-full border border-white/15 bg-black px-4 text-sm font-bold transition hover:bg-white hover:text-black max-[360px]:hidden sm:px-5"
        >
          Підписатися
        </Link>
      </div>
    </header>
  );
}
