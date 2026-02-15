const webhookCreate = new Map();
export function webhookBurstDetected(guildId, ts, threshold = 3) {
    const list = webhookCreate.get(guildId) ?? [];
    const current = list.filter((x) => ts - x <= 10_000);
    current.push(ts);
    webhookCreate.set(guildId, current);
    return current.length >= threshold;
}
