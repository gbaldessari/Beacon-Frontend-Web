import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppAlert, PageSkeleton, type PageSkeletonVariant } from "../components";
import { useCurrentRole } from "../../services/auth/authRole";
import type { PermissionType } from "../../services/auth/types/PermissionType.type";
import { isLogoutInProgress } from "../../services/auth/session";
import { ProtectedPaths } from "./protectedPaths";

interface ProtectedRouteProps {
  /** Contenido que se renderiza solo si el usuario cumple los permisos. */
  children: ReactNode;
  /** Tipos de permiso aceptados para la ruta; si se omite, basta con sesión válida. */
  allowedPermissionTypes?: readonly PermissionType[];
  /** Ruta destino cuando el usuario no tiene permisos. */
  fallbackPath?: string;
}

function skeletonVariantForPath(pathname: string): PageSkeletonVariant {
  if (pathname.startsWith(ProtectedPaths.HOME_TASKS)) {
    return "tasks";
  }
  if (pathname.startsWith(ProtectedPaths.HOME_FINANCE)) {
    return "finance";
  }
  if (pathname.startsWith(ProtectedPaths.HOME_PROFILE)) {
    return "admin";
  }
  if (pathname.startsWith(ProtectedPaths.HOME)) {
    return "welcome";
  }
  return "content";
}

/**
 * Wrapper de autorización para rutas protegidas.
 *
 * Consulta el rol/permisos actuales, muestra una alerta breve si el usuario no
 * puede acceder y luego redirige a la ruta de respaldo.
 */
export function ProtectedRoute({
  children,
  allowedPermissionTypes,
  fallbackPath = "/home",
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { permissionType, loading } = useCurrentRole();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    const hasAccess = !!permissionType && (!allowedPermissionTypes || allowedPermissionTypes.includes(permissionType));
    if (hasAccess) {
      setShowAlert(false);
      return;
    }

    if (isLogoutInProgress()) {
      setShowAlert(false);
      navigate("/login", { replace: true });
      return;
    }

    setShowAlert(true);
    const timeoutId = window.setTimeout(() => {
      setShowAlert(false);
      navigate(fallbackPath);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [allowedPermissionTypes, fallbackPath, loading, navigate, permissionType]);

  if (loading) {
    return <PageSkeleton variant={skeletonVariantForPath(pathname)} />;
  }

  const hasAccess = !!permissionType && (!allowedPermissionTypes || allowedPermissionTypes.includes(permissionType));
  if (!hasAccess) {
    if (isLogoutInProgress()) {
      return null;
    }

    return (
      <AppAlert
        type="error"
        message="No tienes acceso a esta sección. Contacta al administrador."
        show={showAlert}
      />
    );
  }

  return <>{children}</>;
}
