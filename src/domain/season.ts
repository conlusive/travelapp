// Єдине місце з формулою «вердикту сезону» (docs/phase-1/1-product.md).
import type { MonthlyClimate } from "./types.ts";

export type Verdict = "ideal" | "good" | "meh" | "avoid";

export const VERDICT_LABELS: Record<Verdict, string> = {
  ideal: "Ідеально",
  good: "Добре",
  meh: "Так собі",
  avoid: "Уникати",
};

const WEIGHTS = { weather: 0.4, crowd: 0.3, price: 0.3 } as const;
const VERDICT_THRESHOLDS = { ideal: 75, good: 55, meh: 35 } as const;

const TEMPERATURE = { zeroCold: 5, idealMin: 20, idealMax: 27, zeroHot: 38 } as const;
const RAIN_DAYS = { ideal: 4, zero: 18 } as const;
const TEMPERATURE_SHARE = 0.7;

/** Оцінки 0–100, де 100 — найкраще для мандрівника (мало людей, низькі ціни). */
export type SeasonInputs = {
  weather: number;
  crowd?: number;
  price?: number;
};

export type SeasonAssessment = {
  score: number;
  verdict: Verdict;
  /** true, якщо бракує натовпів або цін. */
  isPreliminary: boolean;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function temperatureScore(avgMaxC: number): number {
  const { zeroCold, idealMin, idealMax, zeroHot } = TEMPERATURE;
  if (avgMaxC < idealMin) return 100 * clamp01((avgMaxC - zeroCold) / (idealMin - zeroCold));
  if (avgMaxC > idealMax) return 100 * clamp01((zeroHot - avgMaxC) / (zeroHot - idealMax));
  return 100;
}

function rainScore(rainDays: number): number {
  const { ideal, zero } = RAIN_DAYS;
  return 100 * clamp01((zero - rainDays) / (zero - ideal));
}

export function weatherScore(climate: Pick<MonthlyClimate, "avgMaxC" | "rainDays">): number {
  const score =
    TEMPERATURE_SHARE * temperatureScore(climate.avgMaxC) +
    (1 - TEMPERATURE_SHARE) * rainScore(climate.rainDays);
  return Math.round(score);
}

export function verdictFor(score: number): Verdict {
  if (score >= VERDICT_THRESHOLDS.ideal) return "ideal";
  if (score >= VERDICT_THRESHOLDS.good) return "good";
  if (score >= VERDICT_THRESHOLDS.meh) return "meh";
  return "avoid";
}

export function assessSeason(inputs: SeasonInputs): SeasonAssessment {
  let total = 0;
  let weightSum = 0;
  for (const key of ["weather", "crowd", "price"] as const) {
    const value = inputs[key];
    if (value === undefined) continue;
    total += value * WEIGHTS[key];
    weightSum += WEIGHTS[key];
  }
  const score = Math.round(total / weightSum);

  return {
    score,
    verdict: verdictFor(score),
    isPreliminary: inputs.crowd === undefined || inputs.price === undefined,
  };
}
