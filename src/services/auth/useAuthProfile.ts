import { useEffect, useState } from "react";
import {
  AUTH_PROFILE_UPDATED_EVENT,
  readPersistedAuthProfile,
} from "./session";

type CurrentAuthProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleName: string;
  permissionType: string;
  fullName: string;
};

const readCurrentAuthProfile = (): CurrentAuthProfile => {
  const profile = readPersistedAuthProfile();
  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();

  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    email: profile.email ?? "",
    role: profile.role ?? "",
    roleName: profile.roleName ?? "",
    permissionType: String(profile.permissionType ?? ""),
    fullName,
  };
};

export function useAuthProfile(): CurrentAuthProfile {
  const [profile, setProfile] = useState<CurrentAuthProfile>(readCurrentAuthProfile);

  useEffect(() => {
    const syncProfile = () => {
      setProfile(readCurrentAuthProfile());
    };

    window.addEventListener(AUTH_PROFILE_UPDATED_EVENT, syncProfile);
    window.addEventListener("auth-session-refreshed", syncProfile);
    window.addEventListener("auth-session-cleared", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener(AUTH_PROFILE_UPDATED_EVENT, syncProfile);
      window.removeEventListener("auth-session-refreshed", syncProfile);
      window.removeEventListener("auth-session-cleared", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  return profile;
}
