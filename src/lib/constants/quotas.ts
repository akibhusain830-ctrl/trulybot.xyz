// Quota & usage constants (word & upload caps per plan)
// These limits implement the product decision: Basic capped; Pro & Ultra unlimited conversations except Basic 1k convs.

export interface PlanQuota {
  id: 'free' | 'basic' | 'pro' | 'ultra';
  monthlyUploadLimit: number; // uploads per calendar month
  perUploadWordLimit: number; // hard word cap per upload
  totalWordCap?: number;      // hard stored word cap (undefined => use fair use model)
  fairUseSoft?: number;       // soft threshold for warnings
  fairUseHard?: number;       // hard stop for "unlimited" style plan
  monthlyConversationCap?: number; // Free and Basic have conversation caps
}

export const PLAN_QUOTAS: Record<string, PlanQuota> = {
  free: {
    id: 'free',
    monthlyUploadLimit: 1, // only 1 upload for free
    perUploadWordLimit: 500, // max 500 words per upload
    totalWordCap: 500, // total 500 words maximum
    monthlyConversationCap: 100, // 100 conversations per month
  },
  basic: {
    id: 'basic',
    monthlyUploadLimit: 4, // updated: max 4 uploads
    perUploadWordLimit: 1000, // per upload limit clarified
    totalWordCap: 2000, // corrected total stored cap
    monthlyConversationCap: 1000,
  },
  pro: {
    id: 'pro',
    monthlyUploadLimit: 10, // unchanged per user spec
    perUploadWordLimit: 5000, // updated per upload limit
    totalWordCap: 15000, // adjusted total stored cap per new request
  },
  ultra: {
    id: 'ultra',
    monthlyUploadLimit: 25,
    perUploadWordLimit: 10000, // clarified spec
    totalWordCap: 50000, // fixed hard cap (no fair use model now)
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
