import type { PermissionType } from "./PermissionType.type";

export type RoleDefinition = {
  id: string;
  code: string;
  name: string;
  permissionType: PermissionType;
  isSystem: boolean;
};

export type CreateRoleDefinitionPayload = {
  name: string;
  permissionType: PermissionType;
};
