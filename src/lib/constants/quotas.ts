// Quota & usage constants - SOFT CAPS (show upgrade prompts, don't block)
// Soft caps show toast notifications encouraging upgrades

export interface PlanQuota {
  id: 'free' | 'basic' | 'pro' | 'enterprise';
  monthlyUploadLimit: number; // soft cap - shows toast when reached
  perUploadWordLimit: number; // no limit = 999999
  totalWordCap?: number;      // soft cap - shows toast when reached
  fairUseSoft?: number;       // not used
  fairUseHard?: number;       // not used
  monthlyConversationCap?: number; // conversation limits (hard cap)
}

export const PLAN_QUOTAS: Record<string, PlanQuota> = {
  free: {
    id: 'free',
    monthlyUploadLimit: 10,     // Soft cap - show upgrade toast
    perUploadWordLimit: 999999, // No per-upload limit
    totalWordCap: 2000,         // Soft cap - show upgrade toast
    monthlyConversationCap: 300,
  },
  basic: {
    id: 'basic',
    monthlyUploadLimit: 20,     // Soft cap - show upgrade toast
    perUploadWordLimit: 999999, // No per-upload limit
    totalWordCap: 5000,         // Soft cap - show upgrade toast
    monthlyConversationCap: 1000,
  },
  pro: {
    id: 'pro',
    monthlyUploadLimit: 50,     // Soft cap - show upgrade toast
    perUploadWordLimit: 999999, // No per-upload limit
    totalWordCap: 15000,        // Soft cap - show upgrade toast
    monthlyConversationCap: 3000,
  },
  enterprise: {
    id: 'enterprise',
    monthlyUploadLimit: 100,    // Soft cap - show upgrade toast
    perUploadWordLimit: 999999, // No per-upload limit
    totalWordCap: 30000,        // Soft cap - show upgrade toast
    monthlyConversationCap: 15000,
  }
};

export function getPlanQuota(tier: string): PlanQuota | undefined {
  return PLAN_QUOTAS[tier];
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2,'0')}`;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
