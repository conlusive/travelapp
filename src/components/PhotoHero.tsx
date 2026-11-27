import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/data/photos";
import { AnimatedTitle } from "./motion/AnimatedTitle";
import { ScrollProgress } from "./ScrollProgress";

type Props = {
  photo: Pick<Photo, "src" | "blur">;
  alt: string;
  /** Хлібні крихти, мітки тощо над заголовком. */
  eyebrow?: ReactNode;
  title: string;
  children?: ReactNode;
};

export function PhotoHero({ photo, alt, eyebrow, title, children }: Props) {
  return (
    <ScrollProgress
      mode="exit"
      className="relative h-[78svh] max-h-[52rem] min-h-[30rem] overflow-hidden rounded-b-[2rem] bg-ink text-white"
    >
      <div className="parallax-media absolute inset-0">
        <Image
          src={photo.src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={photo.blur}
          className="animate-ken-burns object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/80" />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-6xl flex-col items-start gap-3 px-4 pb-12 sm:px-8">
        {eyebrow && <div className="flex animate-rise flex-wrap items-center gap-3 text-sm">{eyebrow}</div>}
        <h1 className="text-[clamp(2.75rem,9vw,7rem)] leading-[1.05] font-extrabold tracking-tight">
          <AnimatedTitle text={title} by="letters" />
        </h1>
        {children && <div className="max-w-2xl animate-rise text-white/85 [animation-delay:500ms]">{children}</div>}
      </div>
    </ScrollProgress>
  );
}
