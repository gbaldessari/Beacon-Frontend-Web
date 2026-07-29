import { useEffect, useMemo, useState } from "react";
import { MdAdd, MdCheckCircleOutline, MdDeleteOutline, MdRadioButtonUnchecked } from "react-icons/md";
import {
  AppAlert,
  AppButton,
  AppCheckbox,
  AppInput,
  AppModal,
  AppSelect,
  AppTextarea,
} from "../../../../commons/components";
import {
  createReminder,
  deleteReminder,
  listReminders,
  setReminderCompletion,
} from "../../../../services/reminders/reminders.service";
import type {
  CreateReminderPayload,
  Reminder,
  ReminderRecurrence,
  ReminderTimeMode,
} from "../../../../services/reminders/types/Reminder.type";
import "./tasksWindow.css";

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Lun", full: "Lunes" },
  { value: 2, label: "Mar", full: "Martes" },
  { value: 3, label: "Mié", full: "Miércoles" },
  { value: 4, label: "Jue", full: "Jueves" },
  { value: 5, label: "Vie", full: "Viernes" },
  { value: 6, label: "Sáb", full: "Sábado" },
  { value: 0, label: "Dom", full: "Domingo" },
] as const;

const MONTH_OPTIONS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
] as const;

const RECURRENCE_LABELS: Record<Exclude<ReminderRecurrence, "none">, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

type FilterTab = "all" | "pending" | "completed";

const todayIsoDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toYearlyDateValue = (monthOfYear: number, dayOfMonth: number) => {
  const year = new Date().getFullYear();
  const maxDay = new Date(year, monthOfYear, 0).getDate();
  const safeDay = Math.min(Math.max(dayOfMonth, 1), maxDay);
  return `${year}-${String(monthOfYear).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
};

const emptyForm = {
  title: "",
  description: "",
  repeats: true,
  recurrenceType: "weekly" as Exclude<ReminderRecurrence, "none">,
  scheduledDate: todayIsoDate(),
  weekdays: [1, 2, 3, 4, 5] as number[],
  dayOfMonth: 1,
  monthOfYear: 1,
  timeMode: "all_day" as ReminderTimeMode,
  startTime: "09:00",
  endTime: "10:00",
  notifyEnabled: false,
  notifyValue: 1,
  notifyUnit: "hours" as "hours" | "days",
};

function formatTimeLabel(reminder: Reminder): string {
  if (reminder.timeMode === "all_day") {
    return "Todo el día";
  }
  if (reminder.timeMode === "range" && reminder.startTime && reminder.endTime) {
    return `${reminder.startTime} – ${reminder.endTime}`;
  }
  return reminder.startTime || "Hora";
}

function formatSchedule(reminder: Reminder): string {
  const timeLabel = formatTimeLabel(reminder);
  let schedule = "";

  if (!reminder.repeats && reminder.scheduledDate) {
    schedule = reminder.scheduledDate.split("-").reverse().join("/");
  } else if (reminder.recurrenceType === "weekly" && reminder.weekdays?.length) {
    const labels = WEEKDAY_OPTIONS.filter((day) => reminder.weekdays?.includes(day.value)).map(
      (day) => day.label,
    );
    schedule = labels.join(" · ");
  } else if (reminder.recurrenceType === "monthly" && reminder.dayOfMonth) {
    schedule = `Día ${reminder.dayOfMonth}`;
  } else if (
    reminder.recurrenceType === "yearly" &&
    reminder.dayOfMonth &&
    reminder.monthOfYear
  ) {
    const month = MONTH_OPTIONS.find((item) => item.value === reminder.monthOfYear);
    schedule = `${reminder.dayOfMonth} de ${month?.label ?? ""}`;
  }

  const notify =
    reminder.notifyEnabled && reminder.notifyValue && reminder.notifyUnit
      ? ` · Aviso ${reminder.notifyValue} ${reminder.notifyUnit === "hours" ? "h" : "d"} antes`
      : "";

  return `${schedule}${schedule ? " · " : ""}${timeLabel}${notify}`;
}

function TasksWindow() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const flashError = (message: string) => {
    setError(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 2400);
  };

  const flashSuccess = (message: string) => {
    setSuccess(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1800);
  };

  const loadReminders = async () => {
    setLoading(true);
    const response = await listReminders();
    if (response.success && response.data) {
      setReminders(response.data);
    } else {
      flashError(response.error || "No se pudieron cargar los recordatorios.");
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadReminders();
  }, []);

  const filteredReminders = useMemo(() => {
    if (filter === "pending") {
      return reminders.filter((item) => !item.completed);
    }
    if (filter === "completed") {
      return reminders.filter((item) => item.completed);
    }
    return reminders;
  }, [filter, reminders]);

  const pendingCount = reminders.filter((item) => !item.completed).length;
  const completedCount = reminders.filter((item) => item.completed).length;

  const openCreateModal = () => {
    setForm({ ...emptyForm, scheduledDate: todayIsoDate() });
    setModalOpen(true);
  };

  const toggleWeekday = (day: number) => {
    setForm((current) => {
      const exists = current.weekdays.includes(day);
      if (exists && current.weekdays.length === 1) {
        return current;
      }
      return {
        ...current,
        weekdays: exists
          ? current.weekdays.filter((value) => value !== day)
          : [...current.weekdays, day].sort((a, b) => {
              const order = [1, 2, 3, 4, 5, 6, 0];
              return order.indexOf(a) - order.indexOf(b);
            }),
      };
    });
  };

  const buildPayload = (): CreateReminderPayload | null => {
    const title = form.title.trim();
    if (title.length < 2) {
      flashError("El título debe tener al menos 2 caracteres.");
      return null;
    }

    const payload: CreateReminderPayload = {
      title,
      description: form.description.trim() || undefined,
      repeats: form.repeats,
      timeMode: form.timeMode,
      notifyEnabled: form.notifyEnabled,
    };

    if (!form.repeats) {
      payload.scheduledDate = form.scheduledDate;
    } else {
      payload.recurrenceType = form.recurrenceType;
      if (form.recurrenceType === "weekly") {
        if (form.weekdays.length === 0) {
          flashError("Selecciona al menos un día.");
          return null;
        }
        payload.weekdays = form.weekdays;
      }
      if (form.recurrenceType === "monthly") {
        payload.dayOfMonth = form.dayOfMonth;
      }
      if (form.recurrenceType === "yearly") {
        payload.dayOfMonth = form.dayOfMonth;
        payload.monthOfYear = form.monthOfYear;
      }
    }

    if (form.timeMode === "time" || form.timeMode === "range") {
      payload.startTime = form.startTime;
    }
    if (form.timeMode === "range") {
      payload.endTime = form.endTime;
    }

    if (form.notifyEnabled) {
      payload.notifyValue = form.notifyValue;
      payload.notifyUnit = form.notifyUnit;
    }

    return payload;
  };

  const handleCreate = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setSaving(true);
    const response = await createReminder(payload);
    setSaving(false);

    if (!response.success || !response.data) {
      flashError(response.error || "No se pudo crear el recordatorio.");
      return;
    }

    setReminders((current) => [response.data as Reminder, ...current]);
    setModalOpen(false);
    flashSuccess("Recordatorio creado.");
  };

  const handleToggleCompletion = async (reminder: Reminder) => {
    const response = await setReminderCompletion(reminder.id, !reminder.completed);
    if (!response.success || !response.data) {
      flashError(response.error || "No se pudo actualizar el estado.");
      return;
    }

    setReminders((current) =>
      current.map((item) => (item.id === reminder.id ? (response.data as Reminder) : item)),
    );
  };

  const handleDelete = async (reminder: Reminder) => {
    const confirmed = window.confirm(`¿Eliminar "${reminder.title}"?`);
    if (!confirmed) {
      return;
    }

    const response = await deleteReminder(reminder.id);
    if (!response.success) {
      flashError(response.error || "No se pudo eliminar el recordatorio.");
      return;
    }

    setReminders((current) => current.filter((item) => item.id !== reminder.id));
    flashSuccess("Recordatorio eliminado.");
  };

  return (
    <div className="tasks-window">
      <AppAlert type="error" message={error} show={showError} />
      <AppAlert type="success" message={success} show={showSuccess} />

      <div className="tasks-window-header">
        <div>
          <h2 className="tasks-window-title">Recordatorios y tareas</h2>
          <p className="tasks-window-subtitle">
            Define fechas, horarios y avisos. Repite por semana, mes o año cuando lo necesites.
          </p>
        </div>
        <AppButton className="tasks-window-create" onClick={openCreateModal}>
          <MdAdd size={20} />
          Nueva tarea
        </AppButton>
      </div>

      <div className="tasks-window-tabs" role="tablist" aria-label="Filtro de tareas">
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          className={`tasks-window-tab ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todas ({reminders.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "pending"}
          className={`tasks-window-tab ${filter === "pending" ? "is-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pendientes ({pendingCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "completed"}
          className={`tasks-window-tab ${filter === "completed" ? "is-active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Hechas ({completedCount})
        </button>
      </div>

      {loading ? (
        <p className="tasks-window-empty">Cargando recordatorios…</p>
      ) : filteredReminders.length === 0 ? (
        <div className="tasks-window-empty-state">
          <p className="tasks-window-empty">
            {filter === "completed"
              ? "Aún no hay tareas completadas en este periodo."
              : filter === "pending"
                ? "No tienes tareas pendientes. ¡Buen trabajo!"
                : "Crea tu primer recordatorio para mantener el rumbo."}
          </p>
          {filter === "all" && (
            <AppButton variant="secondary" onClick={openCreateModal}>
              <MdAdd size={18} />
              Crear recordatorio
            </AppButton>
          )}
        </div>
      ) : (
        <ul className="tasks-window-list">
          {filteredReminders.map((reminder) => (
            <li
              key={reminder.id}
              className={`tasks-window-item ${reminder.completed ? "is-completed" : ""}`}
            >
              <button
                type="button"
                className="tasks-window-complete"
                aria-label={reminder.completed ? "Marcar como pendiente" : "Marcar como completada"}
                onClick={() => void handleToggleCompletion(reminder)}
              >
                {reminder.completed ? (
                  <MdCheckCircleOutline size={26} />
                ) : (
                  <MdRadioButtonUnchecked size={26} />
                )}
              </button>

              <div className="tasks-window-item-body">
                <div className="tasks-window-item-top">
                  <h3>{reminder.title}</h3>
                  <span className="tasks-window-badge">
                    {reminder.repeats
                      ? RECURRENCE_LABELS[reminder.recurrenceType as Exclude<ReminderRecurrence, "none">]
                      : "Única"}
                  </span>
                </div>
                {reminder.description && <p>{reminder.description}</p>}
                <span className="tasks-window-schedule">{formatSchedule(reminder)}</span>
              </div>

              <button
                type="button"
                className="tasks-window-delete"
                aria-label={`Eliminar ${reminder.title}`}
                onClick={() => void handleDelete(reminder)}
              >
                <MdDeleteOutline size={22} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="tasks-window-fab"
        aria-label="Nueva tarea"
        onClick={openCreateModal}
      >
        <MdAdd size={28} />
      </button>

      <AppModal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Nueva tarea"
        subtitle="Fecha u horario, repetición y aviso previo."
        className="tasks-window-modal"
      >
        <div className="tasks-window-form">
          <label className="tasks-window-field">
            <span>Título</span>
            <AppInput
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ej. Revisar gastos"
              maxLength={160}
            />
          </label>

          <label className="tasks-window-field">
            <span>Notas (opcional)</span>
            <AppTextarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Detalle breve"
              maxLength={500}
              rows={3}
            />
          </label>

          <fieldset className="tasks-window-fieldset">
            <legend>¿Se repite?</legend>
            <div className="tasks-window-segmented">
              <button
                type="button"
                className={!form.repeats ? "is-active" : ""}
                onClick={() => setForm((current) => ({ ...current, repeats: false }))}
              >
                No
              </button>
              <button
                type="button"
                className={form.repeats ? "is-active" : ""}
                onClick={() => setForm((current) => ({ ...current, repeats: true }))}
              >
                Sí
              </button>
            </div>
          </fieldset>

          {!form.repeats ? (
            <label className="tasks-window-field">
              <span>Fecha</span>
              <AppInput
                type="date"
                value={form.scheduledDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, scheduledDate: event.target.value }))
                }
              />
            </label>
          ) : (
            <>
              <label className="tasks-window-field">
                <span>Repetición</span>
                <AppSelect
                  value={form.recurrenceType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      recurrenceType: event.target.value as Exclude<ReminderRecurrence, "none">,
                    }))
                  }
                >
                  <option value="weekly">Semanal (elige días)</option>
                  <option value="monthly">Mensual (un día del mes)</option>
                  <option value="yearly">Anual (un día del año)</option>
                </AppSelect>
              </label>

              {form.recurrenceType === "weekly" && (
                <fieldset className="tasks-window-fieldset">
                  <legend>Días de la semana</legend>
                  <div className="tasks-window-day-grid">
                    {WEEKDAY_OPTIONS.map((day) => {
                      const checked = form.weekdays.includes(day.value);
                      return (
                        <label
                          key={day.value}
                          className={`tasks-window-day-chip ${checked ? "is-selected" : ""}`}
                        >
                          <AppCheckbox
                            checked={checked}
                            onChange={() => toggleWeekday(day.value)}
                            aria-label={day.full}
                          />
                          <span>{day.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {form.recurrenceType === "monthly" && (
                <fieldset className="tasks-window-fieldset">
                  <legend>Día del mes</legend>
                  <p className="tasks-window-helper">
                    Selecciona el día en que se repetirá cada mes.
                  </p>
                  <div className="tasks-window-month-calendar" role="listbox" aria-label="Día del mes">
                    {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => {
                      const selected = form.dayOfMonth === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={`tasks-window-month-day ${selected ? "is-selected" : ""}`}
                          onClick={() =>
                            setForm((current) => ({ ...current, dayOfMonth: day }))
                          }
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <p className="tasks-window-helper tasks-window-helper--emphasis">
                    Cada mes el día {form.dayOfMonth}
                  </p>
                </fieldset>
              )}

              {form.recurrenceType === "yearly" && (
                <label className="tasks-window-field">
                  <span>Fecha del año</span>
                  <AppInput
                    type="date"
                    value={toYearlyDateValue(form.monthOfYear, form.dayOfMonth)}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) {
                        return;
                      }
                      const [, month, day] = value.split("-").map(Number);
                      setForm((current) => ({
                        ...current,
                        monthOfYear: month,
                        dayOfMonth: day,
                      }));
                    }}
                  />
                  <span className="tasks-window-helper">
                    Se repetirá cada{" "}
                    {MONTH_OPTIONS.find((item) => item.value === form.monthOfYear)?.label ?? ""}{" "}
                    {form.dayOfMonth}. El año del calendario solo sirve para elegir el día.
                  </span>
                </label>
              )}
            </>
          )}

          <fieldset className="tasks-window-fieldset">
            <legend>Horario</legend>
            <div className="tasks-window-segmented tasks-window-segmented--3">
              <button
                type="button"
                className={form.timeMode === "all_day" ? "is-active" : ""}
                onClick={() => setForm((current) => ({ ...current, timeMode: "all_day" }))}
              >
                Todo el día
              </button>
              <button
                type="button"
                className={form.timeMode === "time" ? "is-active" : ""}
                onClick={() => setForm((current) => ({ ...current, timeMode: "time" }))}
              >
                Hora
              </button>
              <button
                type="button"
                className={form.timeMode === "range" ? "is-active" : ""}
                onClick={() => setForm((current) => ({ ...current, timeMode: "range" }))}
              >
                Rango
              </button>
            </div>
          </fieldset>

          {(form.timeMode === "time" || form.timeMode === "range") && (
            <div className={`tasks-window-year-row ${form.timeMode === "time" ? "is-single" : ""}`}>
              <label className="tasks-window-field">
                <span>{form.timeMode === "range" ? "Desde" : "Hora"}</span>
                <AppInput
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startTime: event.target.value }))
                  }
                />
              </label>
              {form.timeMode === "range" && (
                <label className="tasks-window-field">
                  <span>Hasta</span>
                  <AppInput
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, endTime: event.target.value }))
                    }
                  />
                </label>
              )}
            </div>
          )}

          <label className="tasks-window-toggle-row">
            <AppCheckbox
              checked={form.notifyEnabled}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notifyEnabled: event.target.checked,
                }))
              }
            />
            <span>Agregar aviso previo</span>
          </label>

          {form.notifyEnabled && (
            <div className="tasks-window-year-row">
              <label className="tasks-window-field">
                <span>Cantidad</span>
                <AppInput
                  type="number"
                  min={1}
                  max={365}
                  value={form.notifyValue}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notifyValue: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                />
              </label>
              <label className="tasks-window-field">
                <span>Unidad</span>
                <AppSelect
                  value={form.notifyUnit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notifyUnit: event.target.value as "hours" | "days",
                    }))
                  }
                >
                  <option value="hours">Horas antes</option>
                  <option value="days">Días antes</option>
                </AppSelect>
              </label>
            </div>
          )}

          <div className="tasks-window-form-actions">
            <AppButton variant="ghost" disabled={saving} onClick={() => setModalOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton isLoading={saving} onClick={() => void handleCreate()}>
              Guardar
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
}

export default TasksWindow;
