/**
 * Componente de bienvenida para la vista principal.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdCheckCircleOutline,
  MdChecklist,
  MdNotificationsActive,
  MdPerson,
  MdRadioButtonUnchecked,
  MdSettings,
} from "react-icons/md";
import "./homeWelcomeWindow.css";
import { useCurrentRole } from "../../../../services/auth/authRole";
import { HomeRouteConfig, hasRouteAccess } from "../../../../commons/utils/protectedPaths";
import {
  listUpcomingReminders,
  setReminderCompletion,
} from "../../../../services/reminders/reminders.service";
import type { UpcomingReminder } from "../../../../services/reminders/types/Reminder.type";
import { AppAlert, AppButton } from "../../../../commons/components";

function formatUpcomingWhen(reminder: UpcomingReminder): string {
  if (reminder.isDueToday) {
    if (reminder.timeMode === "all_day") {
      return "Hoy · Todo el día";
    }
    if (reminder.timeMode === "range" && reminder.startTime && reminder.endTime) {
      return `Hoy · ${reminder.startTime}–${reminder.endTime}`;
    }
    return `Hoy · ${reminder.startTime ?? ""}`;
  }

  if (!reminder.nextOccurrenceAt) {
    return "Sin próxima fecha";
  }

  const date = new Date(reminder.nextOccurrenceAt);
  const dateLabel = date.toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (reminder.timeMode === "all_day") {
    return `${dateLabel} · Todo el día`;
  }

  if (reminder.timeMode === "range" && reminder.startTime && reminder.endTime) {
    return `${dateLabel} · ${reminder.startTime}–${reminder.endTime}`;
  }

  return `${dateLabel} · ${reminder.startTime ?? ""}`;
}

function statusLabel(reminder: UpcomingReminder): string | null {
  if (reminder.isOverdue) {
    return "Vencido";
  }
  if (reminder.isNotifyActive) {
    return "Aviso activo";
  }
  if (reminder.isDueToday) {
    return "Hoy";
  }
  return null;
}

function HomeWelcomeWindow() {
  const navigate = useNavigate();
  const { roleName, permissionType, isAdmin, loading } = useCurrentRole();
  const [upcoming, setUpcoming] = useState<UpcomingReminder[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const handleNavigateToProfile = () => {
    navigate(HomeRouteConfig.PROFILE.navigatePath);
  };

  const handleNavigateToTasks = () => {
    navigate(HomeRouteConfig.TASKS.navigatePath);
  };

  const roleDescription = isAdmin
    ? "Gestiona usuarios y perfiles para que Beacon siga claro y bajo control."
    : "Revisa tu cuenta y mantén tus datos al día para navegar con confianza.";

  const canAccessProfile = hasRouteAccess(
    permissionType,
    loading,
    HomeRouteConfig.PROFILE.allowedPermissionTypes,
  );
  const canAccessTasks = hasRouteAccess(
    permissionType,
    loading,
    HomeRouteConfig.TASKS.allowedPermissionTypes,
  );

  const loadUpcoming = async () => {
    setUpcomingLoading(true);
    const response = await listUpcomingReminders();
    if (response.success && response.data) {
      setUpcoming(response.data.slice(0, 8));
    }
    setUpcomingLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setUpcomingLoading(true);
      const response = await listUpcomingReminders();
      if (!cancelled && response.success && response.data) {
        setUpcoming(response.data.slice(0, 8));
      }
      if (!cancelled) {
        setUpcomingLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleComplete = async (reminder: UpcomingReminder) => {
    setCompletingId(reminder.id);
    const response = await setReminderCompletion(reminder.id, true);
    setCompletingId(null);

    if (!response.success) {
      setError(response.error || "No se pudo completar la tarea.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2200);
      return;
    }

    setUpcoming((current) => current.filter((item) => item.id !== reminder.id));
    void loadUpcoming();
  };

  return (
    <div className="home-welcome-container">
      <AppAlert type="error" message={error} show={showError} />
      <div className="welcome-content">
        <h2 className="welcome-title">¿Qué quieres hacer ahora?</h2>
        <p className="welcome-subtitle">
          Empieza por tu rutina o tu cuenta. Más herramientas de finanzas llegarán pronto.
        </p>

        <section className="welcome-upcoming" aria-label="Tareas de hoy y avisos">
          <div className="welcome-upcoming-header">
            <div>
              <h3>Hoy y avisos</h3>
              <p>Pendientes de hoy y recordatorios con aviso activo.</p>
            </div>
            {canAccessTasks && (
              <AppButton variant="ghost" onClick={handleNavigateToTasks}>
                Ver todas
              </AppButton>
            )}
          </div>

          {upcomingLoading ? (
            <p className="welcome-upcoming-empty">Cargando tareas…</p>
          ) : upcoming.length === 0 ? (
            <div className="welcome-upcoming-empty-card">
              <MdNotificationsActive size={22} aria-hidden="true" />
              <p>No hay pendientes para hoy ni avisos activos.</p>
            </div>
          ) : (
            <ul className="welcome-upcoming-list">
              {upcoming.map((reminder) => {
                const label = statusLabel(reminder);
                return (
                  <li
                    key={reminder.id}
                    className={`welcome-upcoming-item ${reminder.isOverdue ? "is-overdue" : ""} ${reminder.isNotifyActive ? "is-notify" : ""} ${reminder.isDueToday ? "is-today" : ""}`}
                  >
                    <button
                      type="button"
                      className="welcome-upcoming-complete"
                      aria-label={`Marcar ${reminder.title} como completada`}
                      disabled={completingId === reminder.id}
                      onClick={() => void handleComplete(reminder)}
                    >
                      {completingId === reminder.id ? (
                        <MdCheckCircleOutline size={24} />
                      ) : (
                        <MdRadioButtonUnchecked size={24} />
                      )}
                    </button>

                    <div className="welcome-upcoming-body">
                      <strong>{reminder.title}</strong>
                      <span>{formatUpcomingWhen(reminder)}</span>
                    </div>

                    {label && <em>{label}</em>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="applications-grid">
          {canAccessTasks && (
            <button
              type="button"
              className="application-card tasks-application"
              onClick={handleNavigateToTasks}
            >
              <div className="application-icon" aria-hidden="true">
                <MdChecklist size={36} />
              </div>
              <h3>Tareas y recordatorios</h3>
              <p>Crea rutinas, define horarios y recibe avisos previos.</p>
            </button>
          )}

          {canAccessProfile && (
            <button
              type="button"
              className="application-card profile-application"
              onClick={handleNavigateToProfile}
            >
              <div className="application-icon" aria-hidden="true">
                {isAdmin ? <MdSettings size={36} /> : <MdPerson size={36} />}
              </div>
              <h3>{isAdmin ? "Administración" : "Mi cuenta"}</h3>
              <p>{roleDescription}</p>
            </button>
          )}
        </div>

        <div className="user-permissions-info">
          <p>
            <strong>Rol activo:</strong> {roleName || "Sin asignar"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeWelcomeWindow;
