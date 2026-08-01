import type {
  Reminder,
  ReminderOccurrence,
} from "../../../../services/reminders/types/Reminder.type";

export type CalendarViewMode = "list" | "day" | "week" | "month";

export type CalendarOccurrence = {
  reminder: Reminder;
  dateKey: string;
  sortKey: string;
  isAllDay: boolean;
  startMinutes: number | null;
  endMinutes: number | null;
};

const pad2 = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const parseDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const startOfWeekMonday = (date: Date) => {
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(date, offset));
};

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const daysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const parseTimeToMinutes = (time: string | null | undefined): number | null => {
  if (!time) {
    return null;
  }
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
};

export const formatMinutesLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${pad2(hours)}:${pad2(mins)}`;
};

export const formatDayHeading = (date: Date) =>
  date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatWeekRangeLabel = (weekStart: Date) => {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const startLabel = weekStart.toLocaleDateString("es-ES", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const endLabel = weekEnd.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
};

export const formatMonthHeading = (date: Date) =>
  date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

/** Returns true if the reminder has an occurrence on the given local calendar day. */
export function reminderOccursOnDate(reminder: Reminder, date: Date): boolean {
  const dateKey = toDateKey(date);
  const weekday = date.getDay();
  const dayOfMonth = date.getDate();
  const monthOfYear = date.getMonth() + 1;

  if (!reminder.repeats) {
    return Boolean(reminder.scheduledDate && reminder.scheduledDate === dateKey);
  }

  // Recurring series only exists from series start / creation day forward.
  const seriesStartKey =
    reminder.seriesStart ?? toDateKey(new Date(reminder.createdAt));
  if (dateKey < seriesStartKey) {
    return false;
  }
  if (reminder.seriesUntil && dateKey > reminder.seriesUntil) {
    return false;
  }

  if (reminder.recurrenceType === "weekly") {
    return Boolean(reminder.weekdays?.includes(weekday));
  }

  if (reminder.recurrenceType === "monthly" && reminder.dayOfMonth) {
    const lastDay = daysInMonth(date);
    const target = Math.min(reminder.dayOfMonth, lastDay);
    return dayOfMonth === target;
  }

  if (
    reminder.recurrenceType === "yearly" &&
    reminder.dayOfMonth &&
    reminder.monthOfYear
  ) {
    if (monthOfYear !== reminder.monthOfYear) {
      return false;
    }
    const lastDay = new Date(date.getFullYear(), reminder.monthOfYear, 0).getDate();
    const target = Math.min(reminder.dayOfMonth, lastDay);
    return dayOfMonth === target;
  }

  return false;
}

export function buildOccurrence(reminder: Reminder, date: Date): CalendarOccurrence {
  const isAllDay = reminder.timeMode === "all_day";
  const startMinutes = isAllDay ? null : parseTimeToMinutes(reminder.startTime);
  const endMinutes =
    reminder.timeMode === "range" ? parseTimeToMinutes(reminder.endTime) : startMinutes;

  return {
    reminder,
    dateKey: toDateKey(date),
    sortKey: isAllDay ? `0-${reminder.title}` : `${pad2(startMinutes ?? 0)}-${reminder.title}`,
    isAllDay,
    startMinutes,
    endMinutes,
  };
}

export function occurrencesForDate(reminders: Reminder[], date: Date): CalendarOccurrence[] {
  return reminders
    .filter((reminder) => reminderOccursOnDate(reminder, date))
    .map((reminder) => buildOccurrence(reminder, date))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "es"));
}

export function calendarOccurrencesFromApi(
  items: ReminderOccurrence[],
  date: Date,
): CalendarOccurrence[] {
  const dateKey = toDateKey(date);
  return items
    .filter((item) => item.date === dateKey)
    .map((item) => {
      const reminder: Reminder = {
        ...item.reminder,
        completed: item.completed,
        title: item.title,
        description: item.description,
        timeMode: item.timeMode,
        startTime: item.startTime,
        endTime: item.endTime,
      };
      return buildOccurrence(reminder, date);
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey, "es"));
}

export function occurrencesForRange(
  reminders: Reminder[],
  start: Date,
  dayCount: number,
): Map<string, CalendarOccurrence[]> {
  const map = new Map<string, CalendarOccurrence[]>();
  for (let i = 0; i < dayCount; i += 1) {
    const date = addDays(start, i);
    map.set(toDateKey(date), occurrencesForDate(reminders, date));
  }
  return map;
}

export function apiOccurrencesForRange(
  items: ReminderOccurrence[],
  start: Date,
  dayCount: number,
): Map<string, CalendarOccurrence[]> {
  const map = new Map<string, CalendarOccurrence[]>();
  for (let i = 0; i < dayCount; i += 1) {
    const date = addDays(start, i);
    map.set(toDateKey(date), calendarOccurrencesFromApi(items, date));
  }
  return map;
}

export const occurrenceCompletionKey = (reminderId: string, dateKey: string) =>
  `${reminderId}:${dateKey}`;

export const WEEKDAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

/** Full-day timeline so early/late events (e.g. 03:00) stay visible. */
export const DAY_VIEW_START_HOUR = 0;
export const DAY_VIEW_END_HOUR = 24;
export const DAY_VIEW_HOUR_HEIGHT = 52;
/** Visual duration for point-in-time events (no range). */
export const DAY_VIEW_POINT_MINUTES = 60;
export const DAY_VIEW_MIN_EVENT_PX = 44;

export type LaidOutOccurrence = CalendarOccurrence & {
  start: number;
  end: number;
  column: number;
  columnCount: number;
  isPointInTime: boolean;
};

/**
 * Pack overlapping timed events into side-by-side columns (calendar-style).
 */
export function layoutOverlappingOccurrences(
  items: CalendarOccurrence[],
): LaidOutOccurrence[] {
  const prepared = items.map((item) => {
    const start = item.startMinutes ?? 0;
    const hasRange =
      item.reminder.timeMode === "range" &&
      item.endMinutes != null &&
      item.endMinutes > start;
    const isPointInTime = !hasRange;
    const end = hasRange
      ? Math.max(item.endMinutes as number, start + 30)
      : start + DAY_VIEW_POINT_MINUTES;
    return { ...item, start, end, column: 0, columnCount: 1, isPointInTime };
  });

  prepared.sort((a, b) => a.start - b.start || a.end - b.end || a.sortKey.localeCompare(b.sortKey, "es"));

  type Active = { end: number; column: number };
  const result: LaidOutOccurrence[] = [];
  let cluster: LaidOutOccurrence[] = [];
  let active: Active[] = [];

  const flushCluster = () => {
    if (cluster.length === 0) {
      return;
    }
    const columnCount = Math.max(...cluster.map((item) => item.column)) + 1;
    for (const item of cluster) {
      item.columnCount = columnCount;
      result.push(item);
    }
    cluster = [];
    active = [];
  };

  for (const item of prepared) {
    active = active.filter((slot) => slot.end > item.start);

    if (active.length === 0 && cluster.length > 0) {
      flushCluster();
    }

    const used = new Set(active.map((slot) => slot.column));
    let column = 0;
    while (used.has(column)) {
      column += 1;
    }

    const laid: LaidOutOccurrence = { ...item, column, columnCount: 1 };
    active.push({ end: item.end, column });
    cluster.push(laid);
  }

  flushCluster();
  return result;
}
