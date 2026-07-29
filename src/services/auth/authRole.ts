import { useEffect, useState } from "react";
import { isAdminRole } from "../../commons/utils/permissionUtils";
import { getRole } from "./auth.service";
import { getAccessToken } from "./session";
import type { PermissionType } from "./types/PermissionType.type";
import type { UserRole } from "./types/UserRole.type";

type UseCurrentRoleResult = {
  role: string | null;
  roleName: string | null;
  permissionType: PermissionType | null;
  isAdmin: boolean;
  loading: boolean;
};

type RoleListener = () => void;

const roleListeners = new Set<RoleListener>();
let cachedUserRole: UserRole | null = null;
let roleSyncInFlight: Promise<UserRole | null> | null = null;

const readPersistedRole = (): UserRole | null => {
  const role = localStorage.getItem("role");
  const roleName = localStorage.getItem("roleName");
  const permissionType = localStorage.getItem("permissionType") as PermissionType | null;

  if (!role || !roleName || !permissionType) {
    return null;
  }

  return {
    code: role,
    name: roleName,
    permissionType,
  };
};

const persistUserRole = (userRole: UserRole | null) => {
  if (!userRole) {
    localStorage.removeItem("role");
    localStorage.removeItem("roleName");
    localStorage.removeItem("permissionType");
    return;
  }

  localStorage.setItem("role", userRole.code);
  localStorage.setItem("roleName", userRole.name);
  localStorage.setItem("permissionType", userRole.permissionType);
};

const notifyRoleListeners = () => {
  roleListeners.forEach((listener) => listener());
};

const setCachedUserRole = (userRole: UserRole | null) => {
  cachedUserRole = userRole;
  persistUserRole(userRole);
  notifyRoleListeners();
};

const subscribeToRoleChanges = (listener: RoleListener) => {
  roleListeners.add(listener);

  return () => {
    roleListeners.delete(listener);
  };
};

cachedUserRole = readPersistedRole();

export const syncCurrentRole = async (): Promise<UserRole | null> => {
  const accessToken = getAccessToken() || "";

  if (!accessToken) {
    setCachedUserRole(null);
    return null;
  }

  if (roleSyncInFlight) {
    return roleSyncInFlight;
  }

  roleSyncInFlight = getRole(accessToken)
    .then((response) => {
      const nextUserRole = response.success && response.data ? response.data : null;
      setCachedUserRole(nextUserRole);
      return nextUserRole;
    })
    .finally(() => {
      roleSyncInFlight = null;
    });

  return roleSyncInFlight;
};

export const requestCurrentRoleRefresh = () => {
  void syncCurrentRole();
};

export function useCurrentRole(): UseCurrentRoleResult {
  const [userRole, setUserRole] = useState<UserRole | null>(cachedUserRole);
  const [loading, setLoading] = useState<boolean>(() => Boolean(getAccessToken() && !cachedUserRole));

  useEffect(() => {
    let cancelled = false;

    const updateFromCache = () => {
      if (!cancelled) {
        setUserRole(cachedUserRole);
      }
    };

    const syncRole = async () => {
      if (!getAccessToken()) {
        setCachedUserRole(null);
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!cachedUserRole && !cancelled) {
        setLoading(true);
      }

      await syncCurrentRole();

      if (!cancelled) {
        setLoading(false);
      }
    };

    const unsubscribe = subscribeToRoleChanges(updateFromCache);

    if (getAccessToken() && !cachedUserRole) {
      void syncRole();
    } else {
      setLoading(false);
    }

    window.addEventListener("auth-session-refreshed", syncRole);

    const handleSessionCleared = () => {
      setCachedUserRole(null);
      setLoading(false);
    };

    window.addEventListener("auth-session-cleared", handleSessionCleared);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("auth-session-refreshed", syncRole);
      window.removeEventListener("auth-session-cleared", handleSessionCleared);
    };
  }, []);

  const permissionType = userRole?.permissionType ?? null;

  return {
    role: userRole?.code ?? null,
    roleName: userRole?.name ?? null,
    permissionType,
    isAdmin: isAdminRole(userRole?.code),
    loading,
  };
}
