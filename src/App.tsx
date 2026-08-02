/**
 * Componente principal de la aplicación React.
 *
 * @remarks
 * - Gestiona la autenticación del usuario y el refresco automático de tokens.
 * - LoadingScreen solo en el bootstrap inicial; los cambios de ventana usan skeletons.
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
import FinanceWindow from "./pages/home/views/finance/FinanceWindow";
import NotesWindow from "./pages/home/views/notes/NotesWindow";
import InviteAcceptWindow from "./pages/invite/InviteAcceptWindow";
import ResetPasswordWindow from "./pages/reset/ResetPasswordWindow";
import RecoverPasswordWindow from "./pages/recover/RecoverPasswordWindow";
import { HomeRouteConfig, ProtectedPaths } from "./commons/utils/protectedPaths";
import { ProtectedRoute } from "./commons/utils/ProtectedRoute";
import { getDefaultAuthenticatedPath } from "./commons/utils/roleNavigation";
import { clearAuthSession, getAccessToken, setAccessToken } from "./services/auth/session";
import { syncCurrentRole } from "./services/auth/authRole";
import { ensurePushSubscription } from "./services/notifications/notifications.service";
import { useRealtimeSession } from "./services/realtime/useRealtime";


/**
 * Componente funcional que representa la aplicación principal.
 * 
 * - Controla la autenticación y el refresco de tokens.
 * - Define las rutas principales de la aplicación.
 */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bootstrapping, setBootstrapping] = useState(true);
  const bootstrappedRef = useRef(false);
  const refreshInFlightRef = useRef<Promise<boolean> | null>(null);

  useRealtimeSession();

  const isProtectedPath = (pathname: string) => {
    for (const protectedPath of Object.values(ProtectedPaths)) {
      if (pathname.startsWith(protectedPath)) {
        return true;
      }
    }
    return false;
  };

  const isInvitePath = (pathname: string) => pathname.startsWith("/invite/");

  const shouldRedirectToHome = (pathname: string) => {
    if (isInvitePath(pathname)) {
      return false;
    }
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

  // Verifica autenticación al montar y al cambiar de ruta (sin tapar la UI tras el bootstrap).
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const isInitialBootstrap = !bootstrappedRef.current;
      if (isInitialBootstrap) {
        setBootstrapping(true);
      }

      try {
        const accessToken = getAccessToken();

        if (!accessToken && !isProtectedPath(location.pathname)) {
          const refreshed = await refreshSession();
          if (refreshed && shouldRedirectToHome(location.pathname)) {
            const permissionType = await resolveCurrentPermissionType();
            navigate(getDefaultAuthenticatedPath(permissionType));
          }
          return;
        }

        if (accessToken) {
          const tokenValidation = await validateToken(accessToken);
          if (tokenValidation.success) {
            const permissionType = await resolveCurrentPermissionType();
            if (shouldRedirectToHome(location.pathname)) {
              navigate(getDefaultAuthenticatedPath(permissionType));
            }
            return;
          }
        }

        const refreshed = await refreshSession();
        if (refreshed) {
          const permissionType = await resolveCurrentPermissionType();
          if (shouldRedirectToHome(location.pathname)) {
            navigate(getDefaultAuthenticatedPath(permissionType));
          }
          return;
        }

        if (isProtectedPath(location.pathname)) {
          navigate("/login");
        }
      } finally {
        if (!cancelled) {
          bootstrappedRef.current = true;
          setBootstrapping(false);
        }
      }
    };
    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, location.pathname]);

  // Revisa periódicamente el vencimiento y refresca la sesión en segundo plano.
  useEffect(() => {
    if (bootstrapping) {
      return;
    }

    const ensureFreshSession = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return;
      }

      const tokenValidation = await validateToken(accessToken);
      if (!tokenValidation.success) {
        const refreshed = await refreshSession();
        if (refreshed) {
          await resolveCurrentPermissionType();
        } else if (isProtectedPath(location.pathname)) {
          navigate("/login");
        }
        return;
      }

      const expiresAtStr = tokenValidation.data?.expiresAt;
      const expiresAt = expiresAtStr ? new Date(expiresAtStr).getTime() : 0;
      const shouldRefreshSoon = expiresAt - Date.now() <= 60000;

      if (shouldRefreshSoon) {
        const refreshed = await refreshSession();
        if (refreshed) {
          await resolveCurrentPermissionType();
        } else if (isProtectedPath(location.pathname)) {
          navigate("/login");
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
  }, [bootstrapping, location.pathname, navigate]);

  useEffect(() => {
    if (bootstrapping) {
      return;
    }
    if (!getAccessToken()) {
      return;
    }
    void ensurePushSubscription();
  }, [bootstrapping, location.pathname]);

  return (
    <>
      {bootstrapping && <LoadingScreen />}
      {!bootstrapping && (
        <Routes>
          <Route path="/" element={<LoginWindow />} />
          <Route path="/login" element={<LoginWindow />} />
          <Route path="/invite/:kind/:token" element={<InviteAcceptWindow />} />
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
              path={HomeRouteConfig.FINANCE.routePath}
              element={(
                <ProtectedRoute
                  allowedPermissionTypes={HomeRouteConfig.FINANCE.allowedPermissionTypes}
                  fallbackPath={HomeRouteConfig.FINANCE.fallbackPath}
                >
                  <FinanceWindow />
                </ProtectedRoute>
              )}
            />
            <Route
              path={HomeRouteConfig.NOTES.routePath}
              element={(
                <ProtectedRoute
                  allowedPermissionTypes={HomeRouteConfig.NOTES.allowedPermissionTypes}
                  fallbackPath={HomeRouteConfig.NOTES.fallbackPath}
                >
                  <NotesWindow />
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
