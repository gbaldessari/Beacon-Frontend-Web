import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdNotificationsNone } from "react-icons/md";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notifications/notifications.service";
import type { AppNotification } from "../../services/notifications/types/Notification.type";
import "./NotificationBell.css";

const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshCount = async () => {
    const res = await getUnreadNotificationCount();
    if (res.success && res.data) {
      setUnread(res.data.count);
    }
  };

  const refreshList = async () => {
    setLoading(true);
    const res = await listNotifications(20);
    if (res.success && res.data) {
      setItems(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    void refreshCount();
    const id = window.setInterval(() => {
      void refreshCount();
    }, 60000);

    const onFocus = () => {
      void refreshCount();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    void refreshList();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleOpenItem = async (item: AppNotification) => {
    if (!item.readAt) {
      await markNotificationRead(item.id);
      setUnread((prev) => Math.max(0, prev - 1));
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row,
        ),
      );
    }
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setUnread(0);
    setItems((prev) =>
      prev.map((row) => ({
        ...row,
        readAt: row.readAt ?? new Date().toISOString(),
      })),
    );
  };

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="notif-bell-trigger"
        aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : "Notificaciones"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MdNotificationsNone size={22} />
        {unread > 0 && <span className="notif-bell-badge">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className="notif-bell-panel" role="dialog" aria-label="Bandeja de notificaciones">
          <div className="notif-bell-header">
            <strong>Avisos</strong>
            {unread > 0 && (
              <button type="button" className="notif-bell-mark-all" onClick={() => void handleMarkAll()}>
                Marcar leídos
              </button>
            )}
          </div>
          <div className="notif-bell-list">
            {loading && <p className="notif-bell-empty">Cargando…</p>}
            {!loading && items.length === 0 && (
              <p className="notif-bell-empty">No hay avisos todavía.</p>
            )}
            {!loading &&
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notif-bell-item${item.readAt ? "" : " is-unread"}`}
                  onClick={() => void handleOpenItem(item)}
                >
                  <span className="notif-bell-item-title">{item.title}</span>
                  <span className="notif-bell-item-body">{item.body}</span>
                  <span className="notif-bell-item-meta">{formatRelative(item.createdAt)}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
