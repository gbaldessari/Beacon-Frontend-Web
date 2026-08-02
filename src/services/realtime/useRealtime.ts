import { useEffect, useRef } from "react";
import { getAccessToken } from "../auth/session";
import {
  connectRealtime,
  disconnectRealtime,
  onCalendarSync,
  onFinanceSync,
  onUserCalendarsSync,
  onUserRemindersSync,
  onUserSpacesSync,
  refreshRealtimeAuth,
  syncCalendarRooms,
  syncFinanceRoom,
  type CalendarSyncPayload,
  type FinanceSyncPayload,
} from "./realtime.client";

const DEBOUNCE_MS = 350;

/**
 * Mantiene la conexión Socket.IO alineada con la sesión HTTP.
 */
export const useRealtimeSession = (): void => {
  useEffect(() => {
    const syncConnection = () => {
      if (getAccessToken()) {
        connectRealtime();
      } else {
        disconnectRealtime();
      }
    };

    const onRefreshed = () => {
      if (getAccessToken()) {
        refreshRealtimeAuth();
      } else {
        disconnectRealtime();
      }
    };

    syncConnection();

    window.addEventListener("auth-session-refreshed", onRefreshed);
    window.addEventListener("auth-session-cleared", syncConnection);
    window.addEventListener("auth-logout-started", syncConnection);

    return () => {
      window.removeEventListener("auth-session-refreshed", onRefreshed);
      window.removeEventListener("auth-session-cleared", syncConnection);
      window.removeEventListener("auth-logout-started", syncConnection);
      disconnectRealtime();
    };
  }, []);
};

/**
 * Une salas de calendario y refresca al recibir sync (debounced).
 */
export const useCalendarRealtime = (
  calendarIds: string[],
  onSync: (payload: CalendarSyncPayload) => void,
  onMembershipChange?: () => void,
): void => {
  const onSyncRef = useRef(onSync);
  const onMembershipRef = useRef(onMembershipChange);
  onSyncRef.current = onSync;
  onMembershipRef.current = onMembershipChange;

  const idsKey = calendarIds.join(",");

  useEffect(() => {
    syncCalendarRooms(calendarIds);
  }, [idsKey]);

  useEffect(() => {
    let timer: number | null = null;
    const flush = (payload: CalendarSyncPayload) => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        timer = null;
        onSyncRef.current(payload);
      }, DEBOUNCE_MS);
    };

    const unsubSync = onCalendarSync(flush);
    const unsubMembership = onUserCalendarsSync(() => {
      onMembershipRef.current?.();
    });

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      unsubSync();
      unsubMembership();
      syncCalendarRooms([]);
    };
  }, []);
};

/**
 * Une la sala del espacio de finanzas y refresca al recibir sync.
 */
export const useFinanceRealtime = (
  spaceId: string | null,
  onSync: (payload: FinanceSyncPayload) => void,
  onMembershipChange?: () => void,
): void => {
  const onSyncRef = useRef(onSync);
  const onMembershipRef = useRef(onMembershipChange);
  onSyncRef.current = onSync;
  onMembershipRef.current = onMembershipChange;
  const spaceIdRef = useRef(spaceId);
  spaceIdRef.current = spaceId;

  useEffect(() => {
    syncFinanceRoom(spaceId);
  }, [spaceId]);

  useEffect(() => {
    let timer: number | null = null;
    const flush = (payload: FinanceSyncPayload) => {
      const currentSpaceId = spaceIdRef.current;
      if (currentSpaceId && payload.spaceId !== currentSpaceId) {
        return;
      }
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        timer = null;
        onSyncRef.current(payload);
      }, DEBOUNCE_MS);
    };

    const unsubSync = onFinanceSync(flush);
    const unsubMembership = onUserSpacesSync(() => {
      onMembershipRef.current?.();
    });

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      unsubSync();
      unsubMembership();
      syncFinanceRoom(null);
    };
  }, []);
};

/** Escucha pings de recordatorios en la sala del usuario (p. ej. home). */
export const useRemindersRealtimeRefresh = (onRefresh: () => void): void => {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    let timer: number | null = null;
    const schedule = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        timer = null;
        onRefreshRef.current();
      }, DEBOUNCE_MS);
    };

    const unsubRoom = onCalendarSync(schedule);
    const unsubUser = onUserRemindersSync(schedule);
    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      unsubRoom();
      unsubUser();
    };
  }, []);
};
