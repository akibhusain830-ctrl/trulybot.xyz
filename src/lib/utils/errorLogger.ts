
import { logger } from '@/lib/logger';

export function logSupabaseError(message: string, error: any) {
  logger.error(`[Supabase Error] ${message}:`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  });
}
