import type { Source } from "@/domain/content";

export function SourceLink({ source }: { source: Source }) {
  return (
    <span className="text-xs text-muted">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-accent"
      >
        {source.label}
      </a>
      {" · "}
      {source.reliability === "official" ? "офіційне джерело" : "неофіційне джерело"}
    </span>
  );
}
