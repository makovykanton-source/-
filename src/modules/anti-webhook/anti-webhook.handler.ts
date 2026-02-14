const webhookCreate = new Map<string, number[]>();

export function webhookBurstDetected(guildId: string, ts: number, threshold = 3): boolean {
  const list = webhookCreate.get(guildId) ?? [];
  const current = list.filter((x) => ts - x <= 10_000);
  current.push(ts);
  webhookCreate.set(guildId, current);
  return current.length >= threshold;
}
