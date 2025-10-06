// Simple in-memory token bucket / fixed window hybrid limiter.
// NOTE: This will not scale across multiple server instances; replace with Redis for horizontal scale.

import { config } from '../config/secrets';

interface BucketKeyConfig {
  limit: number;
  windowMs: number;
}

interface BucketState {
  count: number;
  resetAt: number; // epoch ms
}

const buckets = new Map<string, BucketState>();

function keyFor(kind: string, id: string) {
  return `${kind}:${id}`;
}

export function rateLimit(kind: string, id: string, cfg: BucketKeyConfig) {
  const k = keyFor(kind, id);
  const now = Date.now();
  let b = buckets.get(k);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + cfg.windowMs };
    buckets.set(k, b);
  }
  b.count += 1;
  const remaining = Math.max(0, cfg.limit - b.count);
  const limited = b.count > cfg.limit;
  return { limited, remaining, resetAt: b.resetAt };
}

export function limitIp(request: Request, kind: 'global'|'upload'|'chat') {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const perMinute = kind === 'upload' ? config.rateLimit.uploadsPerMinute
    : kind === 'chat' ? config.rateLimit.chatPerMinute
    : config.rateLimit.globalPerMinute;
  return rateLimit(kind, ip, { limit: perMinute, windowMs: 60_000 });
}
