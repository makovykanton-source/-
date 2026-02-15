const BLOCKED = ["discord-nitro-free", "bit.ly/free", "grabify", "iplogger"];

export function hasBlockedLink(content: string): boolean {
  const lc = content.toLowerCase();
  return BLOCKED.some((d) => lc.includes(d));
}
