export function decideLockdown(threatsLastMinute) {
    if (threatsLastMinute >= 10)
        return { shouldLockdown: true, reason: "Threat spike" };
    return { shouldLockdown: false, reason: "Normal" };
}
