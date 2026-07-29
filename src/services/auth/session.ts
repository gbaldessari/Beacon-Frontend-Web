import type { PermissionType } from "./types/PermissionType.type";

let accessToken: string | null = null;
let logoutInProgress = false;

export const AUTH_PROFILE_UPDATED_EVENT = "auth-profile-updated";

const profileKeys = [
  "firstName",
  "lastName",
  "email",
  "role",
  "roleName",
  "permissionType",
] as const;

export type AuthProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  roleName?: string;
  permissionType?: PermissionType | string;
};

export const getAccessToken = () => accessToken;

export const hasAccessToken = () => Boolean(accessToken);

export const setAccessToken = (token: string | null) => {
  accessToken = token && token.trim().length > 0 ? token : null;
  if (accessToken) {
    logoutInProgress = false;
  }
  window.dispatchEvent(new Event("auth-session-refreshed"));
};

export const readPersistedAuthProfile = (): AuthProfile => ({
  firstName: localStorage.getItem("firstName") ?? "",
  lastName: localStorage.getItem("lastName") ?? "",
  email: localStorage.getItem("email") ?? "",
  role: localStorage.getItem("role") ?? "",
  roleName: localStorage.getItem("roleName") ?? "",
  permissionType: localStorage.getItem("permissionType") ?? "",
});

export const notifyAuthProfileUpdated = () => {
  window.dispatchEvent(new Event(AUTH_PROFILE_UPDATED_EVENT));
};

export const beginLogout = () => {
  logoutInProgress = true;
  window.dispatchEvent(new Event("auth-logout-started"));
};

export const isLogoutInProgress = () => logoutInProgress;

export const persistAuthProfile = (profile: AuthProfile) => {
  for (const key of profileKeys) {
    const value = profile[key];
    if (typeof value === "string" && value.length > 0) {
      localStorage.setItem(key, value);
    }
  }

  notifyAuthProfileUpdated();
};

export const clearAuthSession = () => {
  accessToken = null;
  profileKeys.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("auth-session-cleared"));
};
