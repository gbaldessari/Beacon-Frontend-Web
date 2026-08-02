/**
 * Componente de bienvenida para la vista principal.
 */
import { useEffect, useState } from "react";
import { useRemindersRealtimeRefresh } from "../../../../services/realtime/useRealtime";
import { useNavigate } from "react-router-dom";
import {
  MdCheckCircleOutline,
  MdChecklist,
  MdChevronRight,
  MdNotes,
  MdNotificationsActive,
  MdPayments,
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
import { AppAlert, AppButton, ListSkeleton, PageSkeleton } from "../../../../commons/components";

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

  const handleNavigateToFinance = () => {
    navigate(HomeRouteConfig.FINANCE.navigatePath);
  };

  const handleNavigateToNotes = () => {
    navigate(HomeRouteConfig.NOTES.navigatePath);
  };

  const roleDescription = isAdmin
    ? "Tu perfil y la gente del sistema."
    : "Tu nombre, correo y contraseña.";

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
  const canAccessFinance = hasRouteAccess(
    permissionType,
    loading,
    HomeRouteConfig.FINANCE.allowedPermissionTypes,
  );
  const canAccessNotes = hasRouteAccess(
    permissionType,
    loading,
    HomeRouteConfig.NOTES.allowedPermissionTypes,
  );

  const overdueCount = upcoming.filter((item) => item.isOverdue).length;
  const todayCount = upcoming.filter((item) => item.isDueToday && !item.isOverdue).length;
  const previewLimit = 5;

  const loadUpcoming = async () => {
    setUpcomingLoading(true);
    const response = await listUpcomingReminders();
    if (response.success && response.data) {
      setUpcoming(response.data.slice(0, 8));
    }
    setUpcomingLoading(false);
  };

  useRemindersRealtimeRefresh(() => {
    void loadUpcoming();
  });

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

  if (loading) {
    return <PageSkeleton variant="welcome" />;
  }

  return (
    <div className="home-welcome-container">
      <AppAlert type="error" message={error} show={showError} />
      <div className="welcome-content">
        <header className="welcome-header">
          <h2 className="welcome-title">¿Qué quieres hacer?</h2>
        </header>

        <section className="welcome-menu" aria-label="Menú principal">

          <div className="applications-grid">
            {canAccessTasks && (
              <button
                type="button"
                className="application-card tasks-application"
                onClick={handleNavigateToTasks}
              >
                <div className="application-icon" aria-hidden="true">
                  <MdChecklist size={28} />
                </div>
                <div className="application-copy">
                  <h3>Tareas</h3>
                  <p>Lo pendiente y lo que se repite.</p>
                  {!upcomingLoading && upcoming.length > 0 && (
                    <span className="application-meta">
                      {upcoming.length} pendiente{upcoming.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <MdChevronRight className="application-chevron" size={22} aria-hidden="true" />
              </button>
            )}

            {canAccessFinance && (
              <button
                type="button"
                className="application-card finance-application"
                onClick={handleNavigateToFinance}
              >
                <div className="application-icon" aria-hidden="true">
                  <MdPayments size={28} />
                </div>
                <div className="application-copy">
                  <h3>Finanzas</h3>
                  <p>Gastos, ingresos y metas.</p>
                </div>
                <MdChevronRight className="application-chevron" size={22} aria-hidden="true" />
              </button>
            )}

            {canAccessNotes && (
              <button
                type="button"
                className="application-card notes-application"
                onClick={handleNavigateToNotes}
              >
                <div className="application-icon" aria-hidden="true">
                  <MdNotes size={28} />
                </div>
                <div className="application-copy">
                  <h3>Notas</h3>
                  <p>Ideas, listas y etiquetas.</p>
                </div>
                <MdChevronRight className="application-chevron" size={22} aria-hidden="true" />
              </button>
            )}

            {canAccessProfile && (
              <button
                type="button"
                className="application-card profile-application"
                onClick={handleNavigateToProfile}
              >
                <div className="application-icon" aria-hidden="true">
                  {isAdmin ? <MdSettings size={28} /> : <MdPerson size={28} />}
                </div>
                <div className="application-copy">
                  <h3>{isAdmin ? "Administración" : "Mi cuenta"}</h3>
                  <p>{roleDescription}</p>
                </div>
                <MdChevronRight className="application-chevron" size={22} aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        <section className="welcome-upcoming" aria-label="Tareas de hoy y avisos">
          <div className="welcome-upcoming-header">
            <div>
              <div className="welcome-section-label welcome-section-label--inline">
                <span>Hoy</span>
                {!upcomingLoading && upcoming.length > 0 && (
                  <span className="welcome-count-badge" aria-label={`${upcoming.length} pendientes`}>
                    {upcoming.length}
                  </span>
                )}
              </div>
              <h3>Pendientes y avisos</h3>
              <p>
                {upcomingLoading
                  ? "Preparando pendientes…"
                  : overdueCount > 0
                    ? `${overdueCount} vencido${overdueCount === 1 ? "" : "s"}${todayCount > 0 ? ` · ${todayCount} para hoy` : ""}`
                    : todayCount > 0
                      ? `${todayCount} para hoy`
                      : "Sin urgencias por ahora"}
              </p>
            </div>
            {canAccessTasks && (
              <AppButton variant="ghost" onClick={handleNavigateToTasks}>
                Ver todas
              </AppButton>
            )}
          </div>

          {upcomingLoading ? (
            <ListSkeleton count={3} />
          ) : upcoming.length === 0 ? (
            <div className="welcome-upcoming-empty-card">
              <MdNotificationsActive size={22} aria-hidden="true" />
              <p>No hay pendientes para hoy ni avisos activos.</p>
            </div>
          ) : (
            <ul className="welcome-upcoming-list">
              {upcoming.slice(0, previewLimit).map((reminder) => {
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

          {!upcomingLoading && upcoming.length > previewLimit && canAccessTasks && (
            <button
              type="button"
              className="welcome-upcoming-more"
              onClick={handleNavigateToTasks}
            >
              Ver {upcoming.length - previewLimit} más
              <MdChevronRight size={18} aria-hidden="true" />
            </button>
          )}
        </section>

        {isAdmin &&
          <div className="user-permissions-info">
            <p>
              Rol activo · <strong>{roleName || "Sin asignar"}</strong>
            </p>
          </div>
        }
      </div>
    </div>
  );
}

export default HomeWelcomeWindow;
