
export interface TrialInfo {
  isActive: boolean;
  daysRemaining: number;
  endDate: string | null;
  status: 'active' | 'expired' | 'not_started';
}

export function calculateTrialInfo(trialEndDate: string | null): TrialInfo {
  if (!trialEndDate) {
    return {
      isActive: false,
      daysRemaining: 0,
      endDate: null,
      status: 'not_started'
    };
  }

  const endDate = new Date(trialEndDate);
  const now = new Date();
  const timeDiff = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (24 * 60 * 60 * 1000)));

  return {
    isActive: daysRemaining > 0,
    daysRemaining,
    endDate: trialEndDate,
    status: daysRemaining > 0 ? 'active' : 'expired'
  };
}

export function formatTrialStatus(trialInfo: TrialInfo): string {
  if (trialInfo.status === 'not_started') {
    return 'No trial started';
  }
  
  if (trialInfo.status === 'expired') {
    return 'Trial expired';
  }
  
  if (trialInfo.daysRemaining === 0) {
    return 'Trial expires today';
  }
  
  return `${trialInfo.daysRemaining} day${trialInfo.daysRemaining === 1 ? '' : 's'} remaining`;
}
