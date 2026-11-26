import { VERDICT_LABELS, type Verdict } from "@/domain/season";
import { VERDICT_BACKGROUND } from "./verdict-styles";

export function VerdictLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {(Object.keys(VERDICT_LABELS) as Verdict[]).map((verdict) => (
        <li key={verdict} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${VERDICT_BACKGROUND[verdict]}`} />
          {VERDICT_LABELS[verdict]}
        </li>
      ))}
    </ul>
  );
}
