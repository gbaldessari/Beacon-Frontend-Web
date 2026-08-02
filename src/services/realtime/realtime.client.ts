import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../auth/session";
import { getUserIdFromAccessToken } from "../auth/jwt";

export const RealtimeEvents = {
  CALENDAR_SYNC: "calendar:sync",
  FINANCE_SYNC: "finance:sync",
  USER_CALENDARS: "user:calendars",
  USER_SPACES: "user:spaces",
  USER_REMINDERS: "user:reminders",
} as const;

export type CalendarSyncPayload = {
  calendarId: string;
  reason: string;
  actorId?: string;
};

export type FinanceSyncPayload = {
  spaceId: string;
  reason: string;
  actorId?: string;
};

export type UserListSyncPayload = {
  reason: string;
};

type CalendarSyncListener = (payload: CalendarSyncPayload) => void;
type FinanceSyncListener = (payload: FinanceSyncPayload) => void;
type UserListListener = (payload: UserListSyncPayload) => void;

const calendarSyncListeners = new Set<CalendarSyncListener>();
const financeSyncListeners = new Set<FinanceSyncListener>();
const userCalendarsListeners = new Set<UserListListener>();
const userSpacesListeners = new Set<UserListListener>();
const userRemindersListeners = new Set<UserListListener>();

let socket: Socket | null = null;
let joinedCalendars = new Set<string>();
let joinedSpaces = new Set<string>();

const resolveRealtimeUrl = (): string => {
  const base = (import.meta.env.VITE_BACK_URL as string | undefined) ?? "";
  return base.replace(/\/$/, "");
};

const shouldIgnoreOwnEvent = (actorId?: string): boolean => {
  if (!actorId) return false;
  const selfId = getUserIdFromAccessToken(getAccessToken());
  return Boolean(selfId && selfId === actorId);
};

const bindSocketHandlers = (instance: Socket) => {
  instance.on(RealtimeEvents.CALENDAR_SYNC, (payload: CalendarSyncPayload) => {
    if (shouldIgnoreOwnEvent(payload?.actorId)) return;
    calendarSyncListeners.forEach((listener) => listener(payload));
  });

  instance.on(RealtimeEvents.FINANCE_SYNC, (payload: FinanceSyncPayload) => {
    if (shouldIgnoreOwnEvent(payload?.actorId)) return;
    financeSyncListeners.forEach((listener) => listener(payload));
  });

  instance.on(RealtimeEvents.USER_CALENDARS, (payload: UserListSyncPayload) => {
    userCalendarsListeners.forEach((listener) => listener(payload));
  });

  instance.on(RealtimeEvents.USER_SPACES, (payload: UserListSyncPayload) => {
    userSpacesListeners.forEach((listener) => listener(payload));
  });

  instance.on(RealtimeEvents.USER_REMINDERS, (payload: UserListSyncPayload) => {
    userRemindersListeners.forEach((listener) => listener(payload));
  });

  instance.on("connect", () => {
    // Rejoin rooms after reconnect.
    for (const calendarId of joinedCalendars) {
      instance.emit("calendar:join", { calendarId });
    }
    for (const spaceId of joinedSpaces) {
      instance.emit("finance:join", { spaceId });
    }
  });
};

/** Conecta el socket realtime si hay access token. */
export const connectRealtime = (): void => {
  const token = getAccessToken();
  if (!token) {
    return;
  }

  if (socket?.connected) {
    return;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return;
  }

  const url = resolveRealtimeUrl();
  if (!url) {
    return;
  }

  socket = io(`${url}/realtime`, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  bindSocketHandlers(socket);
};

/** Actualiza el token de auth y reconecta si hace falta. */
export const refreshRealtimeAuth = (): void => {
  const token = getAccessToken();
  if (!token) {
    disconnectRealtime();
    return;
  }

  if (!socket) {
    connectRealtime();
    return;
  }

  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectRealtime = (): void => {
  joinedCalendars = new Set();
  joinedSpaces = new Set();
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const joinCalendarRoom = (calendarId: string): void => {
  if (!calendarId) return;
  joinedCalendars.add(calendarId);
  socket?.emit("calendar:join", { calendarId });
};

export const leaveCalendarRoom = (calendarId: string): void => {
  if (!calendarId) return;
  joinedCalendars.delete(calendarId);
  socket?.emit("calendar:leave", { calendarId });
};

export const syncCalendarRooms = (calendarIds: string[]): void => {
  const next = new Set(calendarIds.filter(Boolean));
  for (const id of joinedCalendars) {
    if (!next.has(id)) {
      leaveCalendarRoom(id);
    }
  }
  for (const id of next) {
    if (!joinedCalendars.has(id)) {
      joinCalendarRoom(id);
    }
  }
};

export const joinFinanceRoom = (spaceId: string): void => {
  if (!spaceId) return;
  joinedSpaces.add(spaceId);
  socket?.emit("finance:join", { spaceId });
};

export const leaveFinanceRoom = (spaceId: string): void => {
  if (!spaceId) return;
  joinedSpaces.delete(spaceId);
  socket?.emit("finance:leave", { spaceId });
};

export const syncFinanceRoom = (spaceId: string | null): void => {
  const next = spaceId ? new Set([spaceId]) : new Set<string>();
  for (const id of joinedSpaces) {
    if (!next.has(id)) {
      leaveFinanceRoom(id);
    }
  }
  for (const id of next) {
    if (!joinedSpaces.has(id)) {
      joinFinanceRoom(id);
    }
  }
};

export const onCalendarSync = (listener: CalendarSyncListener): (() => void) => {
  calendarSyncListeners.add(listener);
  return () => {
    calendarSyncListeners.delete(listener);
  };
};

export const onFinanceSync = (listener: FinanceSyncListener): (() => void) => {
  financeSyncListeners.add(listener);
  return () => {
    financeSyncListeners.delete(listener);
  };
};

export const onUserCalendarsSync = (
  listener: UserListListener,
): (() => void) => {
  userCalendarsListeners.add(listener);
  return () => {
    userCalendarsListeners.delete(listener);
  };
};

export const onUserSpacesSync = (listener: UserListListener): (() => void) => {
  userSpacesListeners.add(listener);
  return () => {
    userSpacesListeners.delete(listener);
  };
};

export const onUserRemindersSync = (
  listener: UserListListener,
): (() => void) => {
  userRemindersListeners.add(listener);
  return () => {
    userRemindersListeners.delete(listener);
  };
};
