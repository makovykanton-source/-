export interface TrustProfile {
  guildId: string;
  userId: string;
  score: number;
  riskBand: "trusted" | "watch" | "danger";
  reasons: string[];
  updatedAt: Date;
}

export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function trustBand(score: number): TrustProfile["riskBand"] {
  if (score >= 75) return "trusted";
  if (score >= 45) return "watch";
  return "danger";
}
