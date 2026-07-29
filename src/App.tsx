/**
 * Componente principal de la aplicación React.
 *
 * @remarks
 * - Gestiona la autenticación del usuario y el refresco automático de tokens.
 * - Controla la pantalla de carga durante las transiciones de ruta.
 * - Define las rutas principales de la aplicación utilizando React Router.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import LoginWindow from "./pages/login/LoginWindow";
import LoadingScreen from "./commons/components/LoadingScreen";
import { validateRefreshToken, validateToken } from "./services/auth/auth.service";
import HomeWindow from "./pages/home/HomeWindow";
import HomeWelcomeWindow from "./pages/home/views/home-welcome/HomeWelcomeWindow";
import AdminWindow from "./pages/home/views/admin/AdminWindow";
import TasksWindow from "./pages/home/views/tasks/TasksWindow";
import ResetPasswordWindow from "./pages/reset/ResetPasswordWindow";
import RecoverPasswordWindow from "./pages/recover/RecoverPasswordWindow";
import { HomeRouteConfig, ProtectedPaths } from "./commons/utils/protectedPaths";
import { ProtectedRoute } from "./commons/utils/ProtectedRoute";
import { getDefaultAuthenticatedPath } from "./commons/utils/roleNavigation";
import type { PermissionType } from "./services/auth/types/PermissionType.type";
import { clearAuthSession, getAccessToken, setAccessToken } from "./services/auth/session";
import { syncCurrentRole } from "./services/auth/authRole";


/**
 * Componente funcional que representa la aplicación principal.
 * 
 * - Controla la autenticación y el refresco de tokens.
 * - Gestiona la pantalla de carga durante los cambios de ruta.
 * - Define las rutas principales de la aplicación.
 */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);

  const isProtectedPath = (pathname: string) => {
    for (const protectedPath of Object.values(ProtectedPaths)) {
      if (pathname.startsWith(protectedPath)) {
        return true;
      }
    }
    return false;
  };

  const shouldRedirectToHome = (pathname: string) => {
    return !isProtectedPath(pathname);
  };

  const resolveCurrentPermissionType = async () => {
    const accessToken = getAccessToken() || "";

    if (!accessToken) {
      return null;
    }

    const currentRole = await syncCurrentRole();
    return currentRole?.permissionType ?? null;
  };

  const clearSessionTokens = () => {
    clearAuthSession();
  };

  const refreshSession = async (): Promise<boolean> => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const runRefresh = async () => {
      const refreshValidation = await validateRefreshToken({});
      if (!refreshValidation.success || !refreshValidation.data?.accessToken) {
        clearSessionTokens();
        return false;
      }

      setAccessToken(refreshValidation.data.accessToken);
      return true;
    };

    refreshInFlightRef.current = runRefresh().finally(() => {
      refreshInFlightRef.current = null;
    });

    return refreshInFlightRef.current;
  };

  // Muestra pantalla de carga al cambiar de ruta
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Verifica autenticación y redirige según corresponda
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      setAuthChecking(true);

      try {
        const accessToken = getAccessToken();

        if (!accessToken && !isProtectedPath(location.pathname)) {
          const refreshed = await refreshSession();
          if (refreshed) {
            const permissionType = await resolveCurrentPermissionType();
            navigate(getDefaultAuthenticatedPath(permissionType));
          }
          return;
        }

        if (accessToken) {
          const tokenValidation = await validateToken(accessToken);
          if (tokenValidation.success) {
            await resolveCurrentPermissionType();
            if (shouldRedirectToHome(location.pathname)) {
              const permissionType = localStorage.getItem("permissionType");
              navigate(getDefaultAuthenticatedPath(permissionType as PermissionType | null));
            }
            return;
          }
        }

        const refreshed = await refreshSession();
        if (refreshed) {
          await resolveCurrentPermissionType();
          if (shouldRedirectToHome(location.pathname)) {
            const permissionType = localStorage.getItem("permissionType");
            navigate(getDefaultAuthenticatedPath(permissionType as PermissionType | null));
          }
          return;
        }

        if (isProtectedPath(location.pathname)) {
          navigate("/login");
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    };
    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, location.pathname]);

  // Revisa periódicamente el vencimiento y refresca la sesión antes de que expire.
  useEffect(() => {
    const ensureFreshSession = async () => {
      if (authChecking) {
        return;
      }

      const accessToken = getAccessToken();
      if (!accessToken) {
        return;
      }

      const tokenValidation = await validateToken(accessToken);
      if (!tokenValidation.success) {
        setAuthChecking(true);
        const refreshed = await refreshSession();
        try {
          if (refreshed) {
            await resolveCurrentPermissionType();
          } else if (isProtectedPath(location.pathname)) {
            navigate("/login");
          }
        } finally {
          setAuthChecking(false);
        }
        return;
      }

      const expiresAtStr = tokenValidation.data?.expiresAt;
      const expiresAt = expiresAtStr ? new Date(expiresAtStr).getTime() : 0;
      const shouldRefreshSoon = expiresAt - Date.now() <= 60000;

      if (shouldRefreshSoon) {
        setAuthChecking(true);
        const refreshed = await refreshSession();
        try {
          if (refreshed) {
            await resolveCurrentPermissionType();
          } else if (isProtectedPath(location.pathname)) {
            navigate("/login");
          }
        } finally {
          setAuthChecking(false);
        }
      }
    };

    void ensureFreshSession();
    const intervalId = window.setInterval(() => {
      void ensureFreshSession();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authChecking, location.pathname, navigate]);

  return (
    <>
      {/* Pantalla de carga durante transiciones */}
      {(loading || authChecking) && <LoadingScreen />}
      {!authChecking && (
        <Routes>
          <Route path="/" element={<LoginWindow />} />
          <Route path="/login" element={<LoginWindow />} />
          <Route path="/home/*" element={<HomeWindow />}>
            <Route
              path={HomeRouteConfig.WELCOME.routePath}
              element={(
                <ProtectedRoute
                  allowedPermissionTypes={HomeRouteConfig.WELCOME.allowedPermissionTypes}
                  fallbackPath={HomeRouteConfig.WELCOME.fallbackPath}
                >
                  <HomeWelcomeWindow />
                </ProtectedRoute>
              )}
            />
            <Route
              path={HomeRouteConfig.TASKS.routePath}
              element={(
                <ProtectedRoute
                  allowedPermissionTypes={HomeRouteConfig.TASKS.allowedPermissionTypes}
                  fallbackPath={HomeRouteConfig.TASKS.fallbackPath}
                >
                  <TasksWindow />
                </ProtectedRoute>
              )}
            />
            <Route
              path={HomeRouteConfig.PROFILE.routePath}
              element={(
                <ProtectedRoute
                  allowedPermissionTypes={HomeRouteConfig.PROFILE.allowedPermissionTypes}
                  fallbackPath={HomeRouteConfig.PROFILE.fallbackPath}
                >
                  <AdminWindow />
                </ProtectedRoute>
              )}
            />
          </Route>
          <Route path="/recover-password" element={<RecoverPasswordWindow />} />
          <Route path="/reset-password" element={<ResetPasswordWindow />} />
        </Routes>
      )}
    </>
  );
}

export default App;
