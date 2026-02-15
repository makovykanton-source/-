const msgWindows = new Map();
export function isSpamKey(key, ts, maxPer10s) {
    const list = msgWindows.get(key) ?? [];
    const current = list.filter((x) => ts - x <= 10_000);
    current.push(ts);
    msgWindows.set(key, current);
    return current.length > maxPer10s;
}
