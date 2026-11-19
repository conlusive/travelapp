export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

type Bucket = { count: number; resetAt: number };

/**
 * Фіксоване вікно в памʼяті процесу. На serverless кожен інстанс має свій лічильник,
 * тож це захист «краще, ніж нічого» від простого спаму; жорсткий ліміт — на рівні платформи.
 */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string): RateLimitResult {
    const time = now();

    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt <= time) buckets.delete(k);
    }

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= time) {
      buckets.set(key, { count: 1, resetAt: time + windowMs });
      return { allowed: true };
    }
    if (bucket.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - time) / 1000) };
    }
    bucket.count += 1;
    return { allowed: true };
  };
}
