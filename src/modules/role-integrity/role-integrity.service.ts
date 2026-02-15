import { PermissionSnapshot } from "../../domain/value-objects/permission-snapshot.js";

export function permissionsDrifted(baseline: PermissionSnapshot, current: PermissionSnapshot): boolean {
  const a = [...baseline.allow].sort().join(",");
  const b = [...current.allow].sort().join(",");
  return a !== b;
}
