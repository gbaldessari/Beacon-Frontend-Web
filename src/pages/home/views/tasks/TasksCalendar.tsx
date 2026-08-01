import { MdChevronLeft, MdChevronRight, MdRadioButtonUnchecked, MdCheckCircleOutline, MdEdit } from "react-icons/md";
import type {
  Reminder,
  ReminderOccurrence,
} from "../../../../services/reminders/types/Reminder.type";
import {
  DAY_VIEW_END_HOUR,
  DAY_VIEW_HOUR_HEIGHT,
  DAY_VIEW_MIN_EVENT_PX,
  DAY_VIEW_START_HOUR,
  WEEKDAY_SHORT,
  addDays,
  apiOccurrencesForRange,
  calendarOccurrencesFromApi,
  formatDayHeading,
  formatMinutesLabel,
  formatMonthHeading,
  formatWeekRangeLabel,
  layoutOverlappingOccurrences,
  startOfMonth,
  startOfWeekMonday,
  toDateKey,
  type CalendarOccurrence,
  type CalendarViewMode,
} from "./tasksCalendarUtils";

type TasksCalendarProps = {
  mode: Exclude<CalendarViewMode, "list">;
  cursorDate: Date;
  occurrences: ReminderOccurrence[];
  isOccurrenceCompleted: (reminderId: string, dateKey: string) => boolean;
  onCursorChange: (date: Date) => void;
  onSelectDay: (date: Date) => void;
  onToggleCompletion: (reminder: Reminder, dateKey: string) => void;
  onEditReminder: (reminder: Reminder, dateKey: string) => void;
};

function OccurrenceChip({
  occurrence,
  compact = false,
  completed,
  onToggle,
}: {
  occurrence: CalendarOccurrence;
  compact?: boolean;
  completed: boolean;
  onToggle: (reminder: Reminder, dateKey: string) => void;
}) {
  const { reminder, dateKey, isAllDay, startMinutes, endMinutes } = occurrence;
  const timeLabel = isAllDay
    ? "Todo el día"
    : endMinutes != null && endMinutes !== startMinutes
      ? `${formatMinutesLabel(startMinutes ?? 0)}–${formatMinutesLabel(endMinutes)}`
      : formatMinutesLabel(startMinutes ?? 0);

  return (
    <button
      type="button"
      className={`tasks-cal-chip ${completed ? "is-completed" : ""} ${compact ? "is-compact" : ""}`}
      onClick={() => onToggle(reminder, dateKey)}
      title={`${reminder.title} · ${timeLabel}`}
    >
      <span className="tasks-cal-chip-title">{reminder.title}</span>
      {!compact && <span className="tasks-cal-chip-time">{timeLabel}</span>}
    </button>
  );
}

function DayTimeline({
  date,
  occurrences,
  isOccurrenceCompleted,
  onToggleCompletion,
}: {
  date: Date;
  occurrences: ReminderOccurrence[];
  isOccurrenceCompleted: (reminderId: string, dateKey: string) => boolean;
  onToggleCompletion: (reminder: Reminder, dateKey: string) => void;
}) {
  const items = calendarOccurrencesFromApi(occurrences, date);
  const allDay = items.filter((item) => item.isAllDay);
  const laidOut = layoutOverlappingOccurrences(items.filter((item) => !item.isAllDay));
  const hours = Array.from(
    { length: DAY_VIEW_END_HOUR - DAY_VIEW_START_HOUR },
    (_, index) => DAY_VIEW_START_HOUR + index,
  );
  const gridHeight = (DAY_VIEW_END_HOUR - DAY_VIEW_START_HOUR) * DAY_VIEW_HOUR_HEIGHT;

  const positionFor = (minutes: number) => {
    const clamped = Math.max(
      DAY_VIEW_START_HOUR * 60,
      Math.min(DAY_VIEW_END_HOUR * 60, minutes),
    );
    return ((clamped - DAY_VIEW_START_HOUR * 60) / 60) * DAY_VIEW_HOUR_HEIGHT;
  };

  return (
    <div className="tasks-cal-day">
      {allDay.length > 0 && (
        <div className="tasks-cal-allday">
          <span className="tasks-cal-allday-label">Todo el día</span>
          <div className="tasks-cal-allday-list">
            {allDay.map((item) => (
              <OccurrenceChip
                key={`${item.reminder.id}-${item.dateKey}`}
                occurrence={item}
                completed={isOccurrenceCompleted(item.reminder.id, item.dateKey)}
                onToggle={onToggleCompletion}
              />
            ))}
          </div>
        </div>
      )}

      <div className="tasks-cal-day-board" style={{ height: gridHeight }}>
        <div className="tasks-cal-hours" aria-hidden>
          {hours.map((hour) => (
            <div
              key={hour}
              className="tasks-cal-hour-slot"
              style={{ height: DAY_VIEW_HOUR_HEIGHT }}
            >
              <span className="tasks-cal-hour-label">
                {`${String(hour).padStart(2, "0")}:00`}
              </span>
            </div>
          ))}
        </div>

        <div className="tasks-cal-timeline" style={{ height: gridHeight }}>
          {hours.map((hour) => (
            <div
              key={hour}
              className="tasks-cal-hour-line"
              style={{ top: (hour - DAY_VIEW_START_HOUR) * DAY_VIEW_HOUR_HEIGHT }}
            />
          ))}

          {laidOut.length === 0 && allDay.length === 0 && (
            <p className="tasks-cal-empty">No hay recordatorios este día.</p>
          )}

          {laidOut.map((item) => {
            const top = positionFor(item.start);
            const rawHeight = positionFor(item.end) - top;
            const height = Math.max(rawHeight, DAY_VIEW_MIN_EVENT_PX);
            const widthPct = 100 / item.columnCount;
            const leftPct = item.column * widthPct;
            const gap = 3;
            const showRange =
              item.reminder.timeMode === "range" &&
              item.endMinutes != null &&
              item.endMinutes !== item.startMinutes;
            const completed = isOccurrenceCompleted(item.reminder.id, item.dateKey);

            return (
              <button
                key={`${item.reminder.id}-${item.dateKey}`}
                type="button"
                className={[
                  "tasks-cal-event",
                  item.isPointInTime ? "is-point" : "",
                  completed ? "is-completed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  top,
                  height,
                  left: `calc(${leftPct}% + ${gap}px)`,
                  width: `calc(${widthPct}% - ${gap * 2}px)`,
                }}
                onClick={() => onToggleCompletion(item.reminder, item.dateKey)}
                title={item.reminder.title}
              >
                <span className="tasks-cal-event-title">{item.reminder.title}</span>
                <span className="tasks-cal-event-time">
                  {formatMinutesLabel(item.startMinutes ?? item.start)}
                  {showRange ? ` – ${formatMinutesLabel(item.endMinutes as number)}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekGrid({
  weekStart,
  occurrences,
  cursorDate,
  isOccurrenceCompleted,
  onSelectDay,
  onToggleCompletion,
}: {
  weekStart: Date;
  occurrences: ReminderOccurrence[];
  cursorDate: Date;
  isOccurrenceCompleted: (reminderId: string, dateKey: string) => boolean;
  onSelectDay: (date: Date) => void;
  onToggleCompletion: (reminder: Reminder, dateKey: string) => void;
}) {
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(cursorDate);
  const byDay = apiOccurrencesForRange(occurrences, weekStart, 7);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <div className="tasks-cal-week">
      {days.map((date, index) => {
        const key = toDateKey(date);
        const items = byDay.get(key) ?? [];
        return (
          <div key={key} className={`tasks-cal-week-day ${key === todayKey ? "is-today" : ""}`}>
            <button
              type="button"
              className={`tasks-cal-week-dayhead ${key === todayKey ? "is-today" : ""} ${key === selectedKey ? "is-selected" : ""}`}
              onClick={() => onSelectDay(date)}
            >
              <span>{WEEKDAY_SHORT[index]}</span>
              <strong>{date.getDate()}</strong>
            </button>
            <div className={`tasks-cal-week-col ${key === todayKey ? "is-today" : ""}`}>
              {items.length === 0 ? (
                <button
                  type="button"
                  className="tasks-cal-week-empty"
                  onClick={() => onSelectDay(date)}
                >
                  —
                </button>
              ) : (
                items.map((item) => (
                  <OccurrenceChip
                    key={`${item.reminder.id}-${item.dateKey}`}
                    occurrence={item}
                    compact
                    completed={isOccurrenceCompleted(item.reminder.id, item.dateKey)}
                    onToggle={onToggleCompletion}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthGrid({
  monthDate,
  occurrences,
  cursorDate,
  isOccurrenceCompleted,
  onSelectDay,
}: {
  monthDate: Date;
  occurrences: ReminderOccurrence[];
  cursorDate: Date;
  isOccurrenceCompleted: (reminderId: string, dateKey: string) => boolean;
  onSelectDay: (date: Date) => void;
}) {
  const monthStart = startOfMonth(monthDate);
  const gridStart = startOfWeekMonday(monthStart);
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(cursorDate);
  const cells = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const byDay = apiOccurrencesForRange(occurrences, gridStart, 42);

  return (
    <div className="tasks-cal-month">
      <div className="tasks-cal-month-weekdays">
        {WEEKDAY_SHORT.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="tasks-cal-month-grid">
        {cells.map((date) => {
          const key = toDateKey(date);
          const inMonth = date.getMonth() === monthDate.getMonth();
          const items = byDay.get(key) ?? [];
          const preview = items.slice(0, 2);
          const extra = items.length - preview.length;

          return (
            <button
              key={key}
              type="button"
              className={[
                "tasks-cal-month-cell",
                inMonth ? "" : "is-outside",
                key === todayKey ? "is-today" : "",
                key === selectedKey ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelectDay(date)}
            >
              <span className="tasks-cal-month-daynum">{date.getDate()}</span>
              <div className="tasks-cal-month-events">
                {preview.map((item) => (
                  <span
                    key={`${item.reminder.id}-${item.dateKey}`}
                    className={`tasks-cal-month-dot ${isOccurrenceCompleted(item.reminder.id, item.dateKey) ? "is-completed" : ""}`}
                  >
                    {item.reminder.title}
                  </span>
                ))}
                {extra > 0 && <span className="tasks-cal-month-more">+{extra}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedDayList({
  date,
  occurrences,
  isOccurrenceCompleted,
  onToggleCompletion,
  onEditReminder,
}: {
  date: Date;
  occurrences: ReminderOccurrence[];
  isOccurrenceCompleted: (reminderId: string, dateKey: string) => boolean;
  onToggleCompletion: (reminder: Reminder, dateKey: string) => void;
  onEditReminder: (reminder: Reminder, dateKey: string) => void;
}) {
  const items = calendarOccurrencesFromApi(occurrences, date);

  if (items.length === 0) {
    return <p className="tasks-cal-selected-empty">Sin recordatorios este día.</p>;
  }

  return (
    <ul className="tasks-cal-selected-list">
      {items.map((item) => {
        const completed = isOccurrenceCompleted(item.reminder.id, item.dateKey);
        return (
          <li key={`${item.reminder.id}-${item.dateKey}`}>
            <div
              className={`tasks-cal-selected-item ${completed ? "is-completed" : ""}`}
            >
              <button
                type="button"
                className="tasks-cal-selected-check"
                aria-label={completed ? "Marcar como pendiente" : "Marcar como completada"}
                onClick={() => onToggleCompletion(item.reminder, item.dateKey)}
              >
                {completed ? (
                  <MdCheckCircleOutline size={22} />
                ) : (
                  <MdRadioButtonUnchecked size={22} />
                )}
              </button>
              <button
                type="button"
                className="tasks-cal-selected-body"
                onClick={() => onEditReminder(item.reminder, item.dateKey)}
              >
                <strong>{item.reminder.title}</strong>
                <span>
                  {item.isAllDay
                    ? "Todo el día"
                    : item.endMinutes != null && item.endMinutes !== item.startMinutes
                      ? `${formatMinutesLabel(item.startMinutes ?? 0)} – ${formatMinutesLabel(item.endMinutes)}`
                      : formatMinutesLabel(item.startMinutes ?? 0)}
                </span>
              </button>
              <button
                type="button"
                className="tasks-cal-selected-edit"
                aria-label={`Editar ${item.reminder.title}`}
                onClick={() => onEditReminder(item.reminder, item.dateKey)}
              >
                <MdEdit size={20} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function TasksCalendar({
  mode,
  cursorDate,
  occurrences,
  isOccurrenceCompleted,
  onCursorChange,
  onSelectDay,
  onToggleCompletion,
  onEditReminder,
}: TasksCalendarProps) {
  const weekStart = startOfWeekMonday(cursorDate);

  const heading =
    mode === "day"
      ? formatDayHeading(cursorDate)
      : mode === "week"
        ? formatWeekRangeLabel(weekStart)
        : formatMonthHeading(cursorDate);

  const goPrev = () => {
    if (mode === "day") {
      onCursorChange(addDays(cursorDate, -1));
    } else if (mode === "week") {
      onCursorChange(addDays(cursorDate, -7));
    } else {
      onCursorChange(new Date(cursorDate.getFullYear(), cursorDate.getMonth() - 1, 1));
    }
  };

  const goNext = () => {
    if (mode === "day") {
      onCursorChange(addDays(cursorDate, 1));
    } else if (mode === "week") {
      onCursorChange(addDays(cursorDate, 7));
    } else {
      onCursorChange(new Date(cursorDate.getFullYear(), cursorDate.getMonth() + 1, 1));
    }
  };

  const goToday = () => onCursorChange(startOfDaySafe(new Date()));

  return (
    <section className="tasks-cal" aria-label="Calendario de recordatorios">
      <div className="tasks-cal-toolbar">
        <div className="tasks-cal-nav">
          <button type="button" className="tasks-cal-nav-btn" onClick={goPrev} aria-label="Anterior">
            <MdChevronLeft size={24} />
          </button>
          <button type="button" className="tasks-cal-nav-btn" onClick={goNext} aria-label="Siguiente">
            <MdChevronRight size={24} />
          </button>
          <button type="button" className="tasks-cal-today" onClick={goToday}>
            Hoy
          </button>
        </div>
        <h3 className="tasks-cal-heading">{heading}</h3>
      </div>

      {mode === "day" && (
        <DayTimeline
          date={cursorDate}
          occurrences={occurrences}
          isOccurrenceCompleted={isOccurrenceCompleted}
          onToggleCompletion={onToggleCompletion}
        />
      )}

      {mode === "week" && (
        <>
          <WeekGrid
            weekStart={weekStart}
            occurrences={occurrences}
            cursorDate={cursorDate}
            isOccurrenceCompleted={isOccurrenceCompleted}
            onSelectDay={onSelectDay}
            onToggleCompletion={onToggleCompletion}
          />
          <div className="tasks-cal-selected-panel">
            <h4>{formatDayHeading(cursorDate)}</h4>
            <SelectedDayList
              date={cursorDate}
              occurrences={occurrences}
              isOccurrenceCompleted={isOccurrenceCompleted}
              onToggleCompletion={onToggleCompletion}
              onEditReminder={onEditReminder}
            />
          </div>
        </>
      )}

      {mode === "month" && (
        <>
          <MonthGrid
            monthDate={cursorDate}
            occurrences={occurrences}
            cursorDate={cursorDate}
            isOccurrenceCompleted={isOccurrenceCompleted}
            onSelectDay={onSelectDay}
          />
          <div className="tasks-cal-selected-panel">
            <h4>{formatDayHeading(cursorDate)}</h4>
            <SelectedDayList
              date={cursorDate}
              occurrences={occurrences}
              isOccurrenceCompleted={isOccurrenceCompleted}
              onToggleCompletion={onToggleCompletion}
              onEditReminder={onEditReminder}
            />
          </div>
        </>
      )}
    </section>
  );
}

function startOfDaySafe(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
