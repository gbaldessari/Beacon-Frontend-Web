export const PermissionType = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type PermissionType = typeof PermissionType[keyof typeof PermissionType];
