export interface PermissionSnapshot {
  roleId: string;
  allow: string[];
  deny: string[];
  capturedAt: string;
}
