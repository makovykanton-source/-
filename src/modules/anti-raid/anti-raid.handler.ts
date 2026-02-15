const joinWindows = new Map<string, number[]>();

export function detectRaid(guildId: string, joinedAtMs: number, threshold: number, windowMs = 15_000): boolean {
  const history = joinWindows.get(guildId) ?? [];
  const active = history.filter((ts) => joinedAtMs - ts <= windowMs);
  active.push(joinedAtMs);
  joinWindows.set(guildId, active);
  return active.length >= threshold;
}
