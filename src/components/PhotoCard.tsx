import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Photo } from "@/data/photos";
import { SaveButton } from "./saved/SaveButton";

type Props = {
  slug: string;
  href: string;
  title: string;
  text: string;
  photo: Pick<Photo, "src" | "blur">;
  /** Мітка над назвою, наприклад вердикт сезону. */
  badge?: ReactNode;
};

export function PhotoCard({ slug, href, title, text, photo, badge }: Props) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 text-white"
      >
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          placeholder="blur"
          blurDataURL={photo.blur}
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition duration-500 group-hover:from-black/95" />
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-lg text-black transition duration-300 group-hover:rotate-45"
        >
          ↗
        </span>
        {badge && <span className="relative mb-3 self-start">{badge}</span>}
        <span className="relative text-3xl font-extrabold transition duration-500 group-hover:-translate-y-1">
          {title}
        </span>
        {/* Лінія, що виростає під назвою під курсором. */}
        <span className="relative my-2 block h-0.5 w-10 rounded bg-white/60 transition-all duration-500 group-hover:w-full" />
        <span className="relative text-sm text-white/80">{text}</span>
      </Link>
      <SaveButton slug={slug} name={title} className="absolute top-4 left-4" />
    </div>
  );
}
