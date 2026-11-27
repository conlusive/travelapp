// Спільні елементи сторінок.
import type { ReactNode } from "react";
import type { SourcedFact } from "@/domain/content";
import { AnimatedTitle } from "./motion/AnimatedTitle";
import { Reveal } from "./motion/Reveal";
import { SourceLink } from "./SourceLink";

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <Reveal className="flex flex-col gap-4">
        <h2 id={`${id}-title`} className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <AnimatedTitle text={title} trigger="scroll" />
        </h2>
        <div className="reveal-fade flex flex-col gap-4">{children}</div>
      </Reveal>
    </section>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-border bg-surface p-5">{children}</div>;
}

export function Pending({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl border border-dashed border-border p-5 text-sm text-muted">
      {children}
    </p>
  );
}

export function FactList({ facts }: { facts: SourcedFact[] }) {
  return (
    <ul className="divide-y divide-border rounded-3xl border border-border bg-surface">
      {facts.map((fact) => (
        <li key={fact.text} className="flex flex-col gap-1 p-4">
          <p>{fact.text}</p>
          <SourceLink source={fact.source} />
        </li>
      ))}
    </ul>
  );
}

export function ExternalButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center self-start rounded-full border border-accent px-5 text-sm font-bold text-accent transition hover:bg-accent hover:text-on-accent"
    >
      {children} ↗
    </a>
  );
}
