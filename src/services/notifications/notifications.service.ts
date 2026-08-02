import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type {
  AppNotification,
  PushStatus,
  PushSubscribePayload,
  PushUnsubscribePayload,
} from "./types/Notification.type";

const PUSH_PREF_KEY = "beacon-push-enabled";

const parseErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
          error?: string;
        };
      };
    };

    const backendMessage = err.response?.data?.message;
    if (Array.isArray(backendMessage) && backendMessage.length > 0) {
      return backendMessage.join(", ");
    }
    if (typeof backendMessage === "string" && backendMessage.trim().length > 0) {
      return backendMessage;
    }
    const backendError = err.response?.data?.error;
    if (typeof backendError === "string" && backendError.trim().length > 0) {
      return backendError;
    }
    if (typeof err.message === "string" && err.message.trim().length > 0) {
      return err.message;
    }
  }
  return "Error de comunicación con el servidor.";
};

const isPushSupported = (): boolean =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const isIosDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
};

const isStandaloneDisplay = (): boolean => {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const safariStandalone = Boolean(
    (navigator as Navigator & { standalone?: boolean }).standalone,
  );
  return media || safariStandalone;
};

const getPushPreferenceEnabled = (): boolean => {
  try {
    return localStorage.getItem(PUSH_PREF_KEY) !== "false";
  } catch {
    return true;
  }
};

const setPushPreferenceEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(PUSH_PREF_KEY, enabled ? "true" : "false");
  } catch {
    // ignore storage errors
  }
};

export const listNotifications = async (
  limit = 30,
): Promise<ServiceResponse<AppNotification[]>> => {
  try {
    const response = await axiosInstance.get("/notifications", {
      params: { limit },
    });
    return { success: true, data: response.data as AppNotification[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const getUnreadNotificationCount = async (): Promise<
  ServiceResponse<{ count: number }>
> => {
  try {
    const response = await axiosInstance.get("/notifications/unread-count");
    return { success: true, data: response.data as { count: number } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const markNotificationRead = async (
  id: string,
): Promise<ServiceResponse<AppNotification>> => {
  try {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return { success: true, data: response.data as AppNotification };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const markAllNotificationsRead = async (): Promise<
  ServiceResponse<{ updated: number }>
> => {
  try {
    const response = await axiosInstance.patch("/notifications/read-all");
    return { success: true, data: response.data as { updated: number } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const getVapidPublicKey = async (): Promise<
  ServiceResponse<{ publicKey: string | null }>
> => {
  try {
    const response = await axiosInstance.get("/notifications/push/vapid-public-key");
    return { success: true, data: response.data as { publicKey: string | null } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const subscribePush = async (
  payload: PushSubscribePayload,
): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.post("/notifications/push/subscribe", payload);
    return { success: true, data: response.data as { success: boolean } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const unsubscribePush = async (
  payload: PushUnsubscribePayload,
): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.delete("/notifications/push/subscribe", {
      data: payload,
    });
    return { success: true, data: response.data as { success: boolean } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration> => {
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return registration;
};

export const getPushStatus = async (): Promise<PushStatus> => {
  if (!isPushSupported()) {
    return {
      supported: false,
      permission: "unsupported",
      subscribed: false,
      preferenceEnabled: getPushPreferenceEnabled(),
      iosNeedsHomeScreen: isIosDevice() && !isStandaloneDisplay(),
    };
  }

  let subscribed = false;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    subscribed = Boolean(subscription);
  } catch {
    subscribed = false;
  }

  return {
    supported: true,
    permission: Notification.permission,
    subscribed,
    preferenceEnabled: getPushPreferenceEnabled(),
    iosNeedsHomeScreen: isIosDevice() && !isStandaloneDisplay(),
  };
};

const subscribeCurrentDevice = async (): Promise<ServiceResponse<{ success: boolean }>> => {
  const registration = await getServiceWorkerRegistration();

  const vapid = await getVapidPublicKey();
  if (!vapid.success || !vapid.data?.publicKey) {
    return {
      success: false,
      error: vapid.error || "Las notificaciones push no están configuradas en el servidor.",
    };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.data.publicKey) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { success: false, error: "No se pudo crear la suscripción push." };
  }

  return subscribePush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  });
};

/**
 * Sincroniza la suscripción si el permiso ya fue concedido y la preferencia está activa.
 * No muestra el diálogo del navegador.
 */
export const ensurePushSubscription = async (): Promise<void> => {
  if (!isPushSupported()) return;
  if (!getPushPreferenceEnabled()) return;
  if (Notification.permission !== "granted") return;

  try {
    await subscribeCurrentDevice();
  } catch {
    // Push es opcional; no bloquear la app
  }
};

export const enablePushNotifications = async (): Promise<ServiceResponse<{ success: boolean }>> => {
  if (!isPushSupported()) {
    return {
      success: false,
      error: "Este navegador no soporta notificaciones push.",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushPreferenceEnabled(false);
      return {
        success: false,
        error:
          permission === "denied"
            ? "Permiso denegado. Actívalo en la configuración del navegador o del sistema."
            : "Se necesita permiso para recibir notificaciones.",
      };
    }

    const result = await subscribeCurrentDevice();
    if (result.success) {
      setPushPreferenceEnabled(true);
    }
    return result;
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const disablePushNotifications = async (): Promise<
  ServiceResponse<{ success: boolean }>
> => {
  setPushPreferenceEnabled(false);

  if (!isPushSupported()) {
    return { success: true, data: { success: true } };
  }

  try {
    const registration =
      (await navigator.serviceWorker.getRegistration("/sw.js")) ??
      (await getServiceWorkerRegistration());
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await unsubscribePush({ endpoint });
      await subscription.unsubscribe();
    }

    return { success: true, data: { success: true } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
