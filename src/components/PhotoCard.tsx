import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/data/photos";

type Props = {
  href: string;
  title: string;
  text: string;
  photo: Pick<Photo, "src" | "blur" | "author" | "license">;
};

export function PhotoCard({ href, title, text, photo }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 text-white"
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
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-lg text-black transition group-hover:rotate-45"
      >
        ↗
      </span>
      <span className="relative text-3xl font-extrabold">{title}</span>
      <span className="relative mt-2 text-sm text-white/80">{text}</span>
      <span className="relative mt-3 text-[10px] text-white/45">
        {photo.author} · {photo.license}
      </span>
    </Link>
  );
}
