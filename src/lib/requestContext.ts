// Lightweight request ID + meta helpers for logging context
import { randomUUID } from 'crypto';

export function createRequestId(): string {
  try {
    return randomUUID();
  } catch {
    return Math.random().toString(36).slice(2, 12);
  }
}

export type RequestMeta = { reqId: string; [k: string]: any };

export function attachMeta(reqId: string, data?: Record<string, any>): RequestMeta {
  return { reqId, ...(data || {}) };
}
