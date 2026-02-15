const joinWindows = new Map();
export function detectRaid(guildId, joinedAtMs, threshold, windowMs = 15_000) {
    const history = joinWindows.get(guildId) ?? [];
    const active = history.filter((ts) => joinedAtMs - ts <= windowMs);
    active.push(joinedAtMs);
    joinWindows.set(guildId, active);
    return active.length >= threshold;
}
