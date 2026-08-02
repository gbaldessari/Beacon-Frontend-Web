export type AppNotification = {
  id: string;
  type: "reminder" | "calendar_invite" | "finance_invite" | "system";
  title: string;
  body: string;
  link: string | null;
  payload: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type PushSubscribePayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
};

export type PushUnsubscribePayload = {
  endpoint: string;
};

export type PushPermissionState = NotificationPermission | "unsupported";

export type PushStatus = {
  supported: boolean;
  permission: PushPermissionState;
  subscribed: boolean;
  preferenceEnabled: boolean;
  /** iOS Safari solo entrega push si la PWA está en pantalla de inicio. */
  iosNeedsHomeScreen: boolean;
};
