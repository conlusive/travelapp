import type { Source } from "../../domain/content.ts";

export function official(label: string, url: string): Source {
  return { label, url, reliability: "official" };
}

export function secondary(label: string, url: string): Source {
  return { label, url, reliability: "secondary" };
}

export function wikivoyage(page: string, language: "en" | "uk" = "en"): Source {
  return secondary(
    "Wikivoyage",
    `https://${language}.wikivoyage.org/wiki/${encodeURIComponent(page)}`,
  );
}
