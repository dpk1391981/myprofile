/**
 * Minimal in-memory fixed-window rate limiter for the admin login.
 *
 * Deliberately not backed by a store: on serverless each instance keeps its own
 * counter, so this slows credential stuffing rather than stopping it outright.
 * That is the right trade here — the real defence is the scrypt password hash
 * and the signed session — but an unthrottled login endpoint is still free
 * guesses, and this removes them at zero infrastructure cost.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Bound the map so a flood of distinct IPs cannot grow it without limit. */
const MAX_TRACKED = 5000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED) {
    buckets.forEach((b, k) => {
      if (b.resetAt <= now) buckets.delete(k);
    });
    if (buckets.size > MAX_TRACKED) buckets.clear();
  }

  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowSeconds * 1000 };

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/** Clear a key's window — called after a successful login. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
