/**
 * In-memory rate limiter — per-IP sliding window.
 * Note: resets on server restart and doesn't scale across instances.
 * For production, replace with Upstash Redis or Vercel KV.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 3;

export function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number } = { max: MAX_REQUESTS, windowMs: WINDOW_MS },
): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  if (buckets.size > 10_000) pruneExpired(now);
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (bucket.count >= opts.max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

/** 만료된 버킷 정리. 지운 개수를 돌려준다. */
export function pruneExpired(now: number = Date.now()): number {
  let n = 0;
  for (const [k, b] of buckets) {
    if (now > b.resetAt) {
      buckets.delete(k);
      n++;
    }
  }
  return n;
}
