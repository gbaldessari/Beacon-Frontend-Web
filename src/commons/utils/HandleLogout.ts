import { logout } from "../../services/auth/auth.service";
import { beginLogout, clearAuthSession, getAccessToken } from "../../services/auth/session";
import { setAuthProfile } from "../../services/auth/useAuthProfile";

/**
 * Limpia credenciales y datos de usuario almacenados en el navegador.
 */
const clearSession = () => {
  setAuthProfile(null);
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
