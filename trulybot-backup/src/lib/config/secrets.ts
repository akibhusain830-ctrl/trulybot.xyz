// Centralized configuration & environment variable validation
// Provides a single typed source of truth for server-side config.

import { logger } from '../logger';

// We keep validation lightweight (no zod dependency) to avoid bundle bloat.
// If any required variable is missing at runtime we throw (fail fast) for critical secrets.
// For public (NEXT_PUBLIC_*) values we allow undefined only if not used server-side.

type RequiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
};

type OptionalEnv = {
  RATE_LIMIT_GLOBAL_PER_MINUTE?: number; // numeric override
  RATE_LIMIT_UPLOADS_PER_MINUTE?: number;
  RATE_LIMIT_CHAT_PER_MINUTE?: number;
  NODE_ENV?: string;
};

function mustGet(name: keyof RequiredEnv): string {
  const v = process.env[name];
  if (!v) {
    logger.error(`Missing required environment variable: ${name}`);
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

function parseNumber(name: keyof OptionalEnv, fallback: number): number {
  const raw = process.env[name as string];
  if (!raw) return fallback;
  const n = Number(raw);
  if (Number.isNaN(n) || n <= 0) {
    logger.warn(`Invalid numeric env for ${name}: ${raw} (using fallback ${fallback})`);
    return fallback;
  }
  return n;
}

export const config = {
  env: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  supabase: {
    url: mustGet('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: mustGet('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: mustGet('SUPABASE_SERVICE_ROLE_KEY'),
  },
  openai: {
    apiKey: mustGet('OPENAI_API_KEY'),
    embeddingModel: 'text-embedding-3-small',
    embeddingDimensions: 1536,
  },
  rateLimit: {
    globalPerMinute: parseNumber('RATE_LIMIT_GLOBAL_PER_MINUTE', 300),
    uploadsPerMinute: parseNumber('RATE_LIMIT_UPLOADS_PER_MINUTE', 10),
    chatPerMinute: parseNumber('RATE_LIMIT_CHAT_PER_MINUTE', 30),
  },
  flags: {
    strictSchemaCheck: true,
  }
};

export type AppConfig = typeof config;
