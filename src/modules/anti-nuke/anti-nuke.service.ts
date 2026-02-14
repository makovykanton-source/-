export interface DestructiveActionRecord {
  guildId: string;
  actorId: string;
  action: "CHANNEL_DELETE" | "ROLE_DELETE";
  ts: number;
}

export interface AntiNukePolicy {
  channelDeleteThreshold: number;
  roleDeleteThreshold: number;
  windowSeconds: number;
}

const counters = new Map<string, number[]>();

export function evaluateAntiNuke(record: DestructiveActionRecord, policy: AntiNukePolicy): {
  triggered: boolean;
  count: number;
  threshold: number;
} {
  const key = `${record.guildId}:${record.actorId}:${record.action}`;
  const list = counters.get(key) ?? [];
  const nowWindow = list.filter((ts) => record.ts - ts <= policy.windowSeconds * 1000);
  nowWindow.push(record.ts);
  counters.set(key, nowWindow);

  const threshold = record.action === "CHANNEL_DELETE" ? policy.channelDeleteThreshold : policy.roleDeleteThreshold;
  return {
    triggered: nowWindow.length >= threshold,
    count: nowWindow.length,
    threshold
  };
}
