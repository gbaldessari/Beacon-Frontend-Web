import { Role } from "../../services/auth/types/Role.type";

export const isAdminRole = (roleCode: string | null | undefined): boolean => {
  return roleCode === Role.ADMIN;
};
