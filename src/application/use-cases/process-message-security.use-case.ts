import { hasBlockedLink } from "../../modules/anti-link/anti-link.handler.js";
import { isSpamKey } from "../../modules/anti-spam/anti-spam.handler.js";
import { DetectThreatUseCase } from "./detect-threat.use-case.js";

export interface MessageSecurityInput {
  guildId: string;
  channelId: string;
  messageId: string;
  userId: string;
  content: string;
  ts: number;
  maxRatePer10s: number;
}

export interface MessageSecurityDecision {
  shouldDelete: boolean;
  shouldTimeout: boolean;
  reasons: string[];
}

export class ProcessMessageSecurityUseCase {
  constructor(private readonly detectThreat: DetectThreatUseCase) {}

  async execute(input: MessageSecurityInput): Promise<MessageSecurityDecision> {
    const reasons: string[] = [];
    let shouldDelete = false;
    let shouldTimeout = false;

    const spam = isSpamKey(`${input.guildId}:${input.userId}`, input.ts, input.maxRatePer10s);
    if (spam) {
      reasons.push("spam_burst_detected");
      shouldDelete = true;
      shouldTimeout = true;

      await this.detectThreat.execute({
        guildId: input.guildId,
        actorId: input.userId,
        threatType: "ANTI_SPAM",
        severity: "MEDIUM",
        summary: "Message spam threshold exceeded",
        payload: {
          channelId: input.channelId,
          messageId: input.messageId,
          maxRatePer10s: input.maxRatePer10s
        }
      });
    }

    const blockedLink = hasBlockedLink(input.content);
    if (blockedLink) {
      reasons.push("blocked_link_detected");
      shouldDelete = true;

      await this.detectThreat.execute({
        guildId: input.guildId,
        actorId: input.userId,
        threatType: "ANTI_LINK",
        severity: "HIGH",
        summary: "Blocked phishing or malicious link detected",
        payload: {
          channelId: input.channelId,
          messageId: input.messageId,
          contentSample: input.content.slice(0, 140)
        }
      });
    }

    if (!spam && !blockedLink && this.looksLikeObfuscatedLink(input.content)) {
      reasons.push("suspicious_obfuscated_link");
      shouldDelete = true;

      await this.detectThreat.execute({
        guildId: input.guildId,
        actorId: input.userId,
        threatType: "ANOMALY",
        severity: "LOW",
        summary: "Potentially obfuscated malicious link",
        payload: {
          messageId: input.messageId,
          indicator: "obfuscation"
        }
      });
    }

    return { shouldDelete, shouldTimeout, reasons };
  }

  private looksLikeObfuscatedLink(content: string): boolean {
    const suspiciousPatterns = [
      /h\s*t\s*t\s*p/i,
      /d[i1]sc[o0]rd\s*[-_.]?\s*g[i1]ft/i,
      /(?:xn--|punycode)/i,
      /(?:free\s*nitro|gift\s*claim)/i
    ];

    return suspiciousPatterns.some((r) => r.test(content));
  }
}
