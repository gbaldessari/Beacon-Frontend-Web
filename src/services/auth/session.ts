let accessToken: string | null = null;
let logoutInProgress = false;

/** Claves antiguas de sesión; se limpian al arrancar y al cerrar sesión. */
const legacySessionKeys = [
  "firstName",
  "lastName",
  "email",
  "role",
  "roleName",
  "permissionType",
] as const;

export const getAccessToken = () => accessToken;

export const hasAccessToken = () => Boolean(accessToken);

export const setAccessToken = (token: string | null) => {
  accessToken = token && token.trim().length > 0 ? token : null;
  if (accessToken) {
    logoutInProgress = false;
  }
  window.dispatchEvent(new Event("auth-session-refreshed"));
};

export const beginLogout = () => {
  logoutInProgress = true;
  window.dispatchEvent(new Event("auth-logout-started"));
};

export const isLogoutInProgress = () => logoutInProgress;

/** Elimina datos de auth heredados que pudieran quedar en localStorage. */
export const clearLegacyAuthStorage = () => {
  legacySessionKeys.forEach((key) => localStorage.removeItem(key));
};

clearLegacyAuthStorage();

export const clearAuthSession = () => {
  accessToken = null;
  clearLegacyAuthStorage();
  window.dispatchEvent(new Event("auth-session-cleared"));
};
