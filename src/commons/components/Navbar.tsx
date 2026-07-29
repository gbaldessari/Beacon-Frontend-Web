import type { MouseEvent } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultAuthenticatedPath } from "../utils/roleNavigation";
import type { PermissionType } from "../../services/auth/types/PermissionType.type";
import { hasAccessToken } from "../../services/auth/session";
import "./Navbar.css";

const ROUTE_HISTORY_KEY = "app:route-history";
const MAX_HISTORY_SIZE = 40;
const PUBLIC_ROUTES = new Set(["/", "/login", "/recover-password", "/reset-password"]);

const normalizePath = (path: string): string => {
  if (!path) {
    return "/";
  }

  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
};

const readRouteHistory = (): string[] => {
  try {
    const rawHistory = sessionStorage.getItem(ROUTE_HISTORY_KEY);
    if (!rawHistory) {
      return [];
    }

    const parsedHistory = JSON.parse(rawHistory);
    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory
      .filter((item): item is string => typeof item === "string")
      .map((item) => normalizePath(item));
  } catch {
    return [];
  }
};

const writeRouteHistory = (history: string[]) => {
  const cappedHistory = history.slice(-MAX_HISTORY_SIZE);
  sessionStorage.setItem(ROUTE_HISTORY_KEY, JSON.stringify(cappedHistory));
};

const isProtectedRoute = (path: string) => {
  const normalizedPath = normalizePath(path);
  return normalizedPath.startsWith("/home");
};

const isPublicRoute = (path: string) => PUBLIC_ROUTES.has(normalizePath(path));

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = normalizePath(location.pathname);
  const isAuthenticated = hasAccessToken();
  const fallbackPath = isAuthenticated
    ? getDefaultAuthenticatedPath(localStorage.getItem("permissionType") as PermissionType | null)
    : "/login";

  useEffect(() => {
    const history = readRouteHistory();
    const lastPath = history[history.length - 1];

    if (lastPath !== currentPath) {
      history.push(currentPath);
      writeRouteHistory(history);
    }
  }, [currentPath]);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const reachedBoundary = isAuthenticated
      ? currentPath === "/home"
      : currentPath === "/login" || currentPath === "/";

    if (reachedBoundary) {
      writeRouteHistory([fallbackPath]);
      navigate(fallbackPath, { replace: true });
      return;
    }

    const history = readRouteHistory();

    while (history.length > 0 && history[history.length - 1] === currentPath) {
      history.pop();
    }

    const previousPath = history[history.length - 1];
    writeRouteHistory(history);

    if (!previousPath) {
      navigate(fallbackPath, { replace: true });
      return;
    }

    const previousPathAllowed = isAuthenticated
      ? isProtectedRoute(previousPath)
      : isPublicRoute(previousPath);

    if (!previousPathAllowed) {
      navigate(fallbackPath, { replace: true });
      return;
    }

    navigate(previousPath);
  };

  return (
    <div className="navbar-wrapper">
      <header className="navbar-ppal">
        <div className="nav-container">
          <a
            className="brand"
            href={fallbackPath}
            aria-label="Beacon"
            onClick={handleLogoClick}
          >
            <img
              src="/assets/logo-beacon.png"
              alt="Beacon"
              className="nav-logo"
              width={100}
              height={100}
            />
          </a>
        </div>
      </header>
    </div>
  );
};
