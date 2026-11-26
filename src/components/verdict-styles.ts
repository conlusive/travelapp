import type { Verdict } from "@/domain/season";

export const VERDICT_BACKGROUND: Record<Verdict, string> = {
  ideal: "bg-verdict-ideal",
  good: "bg-verdict-good",
  meh: "bg-verdict-meh",
  avoid: "bg-verdict-avoid",
};
