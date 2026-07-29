import { logout } from "../../services/auth/auth.service";
import { beginLogout, clearAuthSession, getAccessToken } from "../../services/auth/session";

/**
 * Claves de sesión persistidas durante la autenticación.
 */
const sessionKeys = [
  "firstName",
  "lastName",
  "email",
  "role",
];

/**
 * Limpia credenciales y datos de usuario almacenados en el navegador.
 */
const clearSession = () => {
  sessionKeys.forEach((key) => localStorage.removeItem(key));
  clearAuthSession();
};

/**
 * Cierra sesión en backend y siempre limpia la sesión local.
 */
export const handleLogout = async () => {
  beginLogout();
  const token = getAccessToken() || "";
  const response = await logout(token);

  if (response.success) {
    setTimeout(() => {
      clearSession();
      window.location.reload();
    }, 2000);
  } else {
    clearSession();
    window.location.reload();
  }
};