import { isAdminRole } from "./permissionUtils";
import type { PermissionType } from "../../services/auth/types/PermissionType.type";

/**
 * Decide la primera ruta autenticada según el tipo de permiso del usuario.
 */
export const getDefaultAuthenticatedPath = (
  permissionType: PermissionType | null | undefined,
): string => {
  if (isAdminRole(permissionType)) {
    return "/home";
  }

  return "/home";
};
