export interface LockdownDecision {
  shouldLockdown: boolean;
  reason: string;
}

export function decideLockdown(threatsLastMinute: number): LockdownDecision {
  if (threatsLastMinute >= 10) return { shouldLockdown: true, reason: "Threat spike" };
  return { shouldLockdown: false, reason: "Normal" };
}
