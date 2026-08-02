import { useEffect, useState } from "react";
import { getProfile } from "./auth.service";
import { getAccessToken } from "./session";
import type { GetProfileResponse } from "./types/GetProfile.type";

type CurrentAuthProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleName: string;
  permissionType: string;
  fullName: string;
  loading: boolean;
};

type ProfileListener = () => void;

const emptyProfile = (): Omit<CurrentAuthProfile, "loading"> => ({
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  roleName: "",
  permissionType: "",
  fullName: "",
});

const toCurrentProfile = (
  profile: GetProfileResponse | null,
): Omit<CurrentAuthProfile, "loading"> => {
  if (!profile) {
    return emptyProfile();
  }

  const firstName = profile.firstName ?? "";
  const lastName = profile.lastName ?? "";

  return {
    firstName,
    lastName,
    email: profile.email ?? "",
    role: profile.role ?? "",
    roleName: profile.roleName ?? "",
    permissionType: String(profile.permissionType ?? ""),
    fullName: `${firstName} ${lastName}`.trim(),
  };
};

const profileListeners = new Set<ProfileListener>();
let cachedAuthProfile: GetProfileResponse | null = null;
let profileSyncInFlight: Promise<GetProfileResponse | null> | null = null;

const notifyProfileListeners = () => {
  profileListeners.forEach((listener) => listener());
};

const setCachedAuthProfile = (profile: GetProfileResponse | null) => {
  cachedAuthProfile = profile;
  notifyProfileListeners();
};

const subscribeToProfileChanges = (listener: ProfileListener) => {
  profileListeners.add(listener);
  return () => {
    profileListeners.delete(listener);
  };
};

/**
 * Actualiza el perfil en memoria (p. ej. tras login o edición de nombre).
 * No persiste datos personales en localStorage.
 */
export const setAuthProfile = (
  profile: Partial<GetProfileResponse> | null,
) => {
  if (!profile) {
    setCachedAuthProfile(null);
    return;
  }

  setCachedAuthProfile({
    firstName: profile.firstName ?? cachedAuthProfile?.firstName ?? "",
    lastName: profile.lastName ?? cachedAuthProfile?.lastName ?? "",
    email: profile.email ?? cachedAuthProfile?.email ?? "",
    role: profile.role ?? cachedAuthProfile?.role ?? "",
    roleName: profile.roleName ?? cachedAuthProfile?.roleName ?? "",
    permissionType:
      profile.permissionType ?? cachedAuthProfile?.permissionType ?? "",
  });
};

/**
 * Obtiene el perfil personal del usuario autenticado desde el servidor.
 */
export const syncCurrentAuthProfile = async (): Promise<GetProfileResponse | null> => {
  const accessToken = getAccessToken() || "";

  if (!accessToken) {
    setCachedAuthProfile(null);
    return null;
  }

  if (profileSyncInFlight) {
    return profileSyncInFlight;
  }

  profileSyncInFlight = getProfile(accessToken)
    .then((response) => {
      const nextProfile =
        response.success && response.data ? response.data : null;
      setCachedAuthProfile(nextProfile);
      return nextProfile;
    })
    .finally(() => {
      profileSyncInFlight = null;
    });

  return profileSyncInFlight;
};

export function useAuthProfile(): CurrentAuthProfile {
  const [profile, setProfile] = useState<Omit<CurrentAuthProfile, "loading">>(
    () => toCurrentProfile(cachedAuthProfile),
  );
  const [loading, setLoading] = useState<boolean>(
    () => Boolean(getAccessToken() && !cachedAuthProfile),
  );

  useEffect(() => {
    let cancelled = false;

    const updateFromCache = () => {
      if (!cancelled) {
        setProfile(toCurrentProfile(cachedAuthProfile));
      }
    };

    const syncProfile = async () => {
      if (!getAccessToken()) {
        setCachedAuthProfile(null);
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!cachedAuthProfile && !cancelled) {
        setLoading(true);
      }

      await syncCurrentAuthProfile();

      if (!cancelled) {
        setLoading(false);
      }
    };

    const unsubscribe = subscribeToProfileChanges(updateFromCache);

    if (getAccessToken()) {
      void syncProfile();
    } else {
      setLoading(false);
    }

    window.addEventListener("auth-session-refreshed", syncProfile);

    const handleSessionCleared = () => {
      setCachedAuthProfile(null);
      setLoading(false);
    };

    window.addEventListener("auth-session-cleared", handleSessionCleared);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("auth-session-refreshed", syncProfile);
      window.removeEventListener("auth-session-cleared", handleSessionCleared);
    };
  }, []);

  return {
    ...profile,
    loading,
  };
}
