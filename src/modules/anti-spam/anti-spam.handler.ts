const msgWindows = new Map<string, number[]>();

export function isSpamKey(key: string, ts: number, maxPer10s: number): boolean {
  const list = msgWindows.get(key) ?? [];
  const current = list.filter((x) => ts - x <= 10_000);
  current.push(ts);
  msgWindows.set(key, current);
  return current.length > maxPer10s;
}
