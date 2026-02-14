import { detectRaid } from "../../modules/anti-raid/anti-raid.handler.js";
import { TrustScoreService } from "../../modules/trust-score/trust-score.service.js";
import { DetectThreatUseCase } from "./detect-threat.use-case.js";

export interface MemberJoinInput {
  guildId: string;
  userId: string;
  accountAgeDays: number;
  punishmentHistory: number;
  suspiciousActions24h: number;
  sharedIpRisk: number;
  isWhitelisted: boolean;
  ts: number;
  raidThreshold: number;
}

export interface MemberJoinDecision {
  trustScore: number;
  riskBand: "trusted" | "watch" | "danger";
  shouldKick: boolean;
  shouldRequireVerification: boolean;
  reasons: string[];
}

export class ProcessMemberJoinUseCase {
  constructor(
    private readonly trustService: TrustScoreService,
    private readonly detectThreat: DetectThreatUseCase
  ) {}

  async execute(input: MemberJoinInput): Promise<MemberJoinDecision> {
    const reasons: string[] = [];

    const score = this.trustService.calculate({
      ageDays: input.accountAgeDays,
      isWhitelisted: input.isWhitelisted,
      punishmentHistory: input.punishmentHistory,
      suspiciousActions24h: input.suspiciousActions24h,
      sharedIpRisk: input.sharedIpRisk
    });

    const band = this.trustService.riskBand(score);
    const raid = detectRaid(input.guildId, input.ts, input.raidThreshold);

    let shouldKick = false;
    let shouldRequireVerification = false;

    if (raid) {
      reasons.push("raid_burst_detected");
      shouldRequireVerification = true;

      await this.detectThreat.execute({
        guildId: input.guildId,
        actorId: input.userId,
        threatType: "ANTI_RAID",
        severity: "CRITICAL",
        summary: "Mass join threshold exceeded",
        payload: {
          raidThreshold: input.raidThreshold,
          joinedAt: input.ts
        }
      });
    }

    if (band === "danger") {
      reasons.push("low_trust_profile");
      shouldRequireVerification = true;
      if (!input.isWhitelisted && score < 20) {
        shouldKick = true;
      }

      await this.detectThreat.execute({
        guildId: input.guildId,
        actorId: input.userId,
        threatType: "ANOMALY",
        severity: "HIGH",
        summary: "Danger-level trust profile joined server",
        payload: {
          trustScore: score,
          riskBand: band,
          accountAgeDays: input.accountAgeDays
        }
      });
    }

    if (input.accountAgeDays < 2) {
      reasons.push("fresh_account");
      shouldRequireVerification = true;
    }

    return {
      trustScore: score,
      riskBand: band,
      shouldKick,
      shouldRequireVerification,
      reasons
    };
  }
}
