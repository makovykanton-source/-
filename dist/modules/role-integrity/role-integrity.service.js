export function permissionsDrifted(baseline, current) {
    const a = [...baseline.allow].sort().join(",");
    const b = [...current.allow].sort().join(",");
    return a !== b;
}
