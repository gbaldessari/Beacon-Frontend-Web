import { useEffect, useState } from "react";
import { AppButton, DotSpinner } from "../../../../../commons/components";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushStatus,
} from "../../../../../services/notifications/notifications.service";
import type { PushStatus } from "../../../../../services/notifications/types/Notification.type";

type NotificationsSectionProps = {
  onShowAlert: (type: "success" | "error", message: string) => void;
};

function statusLabel(status: PushStatus | null): string {
  if (!status) return "Comprobando…";
  if (!status.supported) {
    return "Este navegador no soporta notificaciones push.";
  }
  if (status.iosNeedsHomeScreen) {
    return "En iPhone/iPad, agrega Beacon a la pantalla de inicio para recibir avisos.";
  }
  if (status.permission === "denied") {
    return "Bloqueadas en el navegador. Actívalas en la configuración del sitio o del sistema.";
  }
  if (status.subscribed && status.preferenceEnabled) {
    return "Activas en este dispositivo.";
  }
  if (status.permission === "granted" && !status.preferenceEnabled) {
    return "Desactivadas en Beacon (el permiso del navegador sigue concedido).";
  }
  return "Desactivadas. Actívalas para recibir avisos aunque la app esté cerrada.";
}

export function NotificationsSection({ onShowAlert }: NotificationsSectionProps) {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const next = await getPushStatus();
    setStatus(next);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const enabled = Boolean(
    status?.supported &&
      status.preferenceEnabled &&
      status.subscribed &&
      status.permission === "granted",
  );

  const canToggle =
    Boolean(status?.supported) &&
    status?.permission !== "denied" &&
    !status?.iosNeedsHomeScreen;

  const handleToggle = async () => {
    if (!status || busy) return;
    setBusy(true);

    if (enabled) {
      const result = await disablePushNotifications();
      if (result.success) {
        onShowAlert("success", "Notificaciones desactivadas en este dispositivo.");
      } else {
        onShowAlert("error", result.error || "No se pudieron desactivar.");
      }
    } else {
      const result = await enablePushNotifications();
      if (result.success) {
        onShowAlert("success", "Notificaciones activadas en este dispositivo.");
      } else {
        onShowAlert("error", result.error || "No se pudieron activar.");
      }
    }

    await refresh();
    setBusy(false);
  };

  return (
    <div className="admin-window-minimal-section">
      <h2>Notificaciones</h2>
      <p className="admin-window-action-description">
        Avisos del sistema (recordatorios e invitaciones) aunque Beacon esté cerrada.
      </p>
      <p className="admin-window-notifications-status" role="status">
        {loading ? "Comprobando…" : statusLabel(status)}
      </p>
      <AppButton
        variant={enabled ? "secondary" : "primary"}
        className="admin-window-submit-button admin-window-action-trigger"
        onClick={() => {
          void handleToggle();
        }}
        disabled={loading || busy || !canToggle}
      >
        {busy || loading ? (
          <DotSpinner compact />
        ) : enabled ? (
          "Desactivar avisos"
        ) : (
          "Activar avisos"
        )}
      </AppButton>
    </div>
  );
}
