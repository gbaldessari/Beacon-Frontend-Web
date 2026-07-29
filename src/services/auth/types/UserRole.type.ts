import type { PermissionType } from "./PermissionType.type";

export type UserRole = {
  code: string;
  name: string;
  permissionType: PermissionType;
};
