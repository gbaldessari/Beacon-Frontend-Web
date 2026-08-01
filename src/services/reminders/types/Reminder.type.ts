export type ReminderRecurrence = "none" | "weekly" | "monthly" | "yearly";
export type ReminderTimeMode = "all_day" | "time" | "range";
export type ReminderNotifyUnit = "hours" | "days";
export type ReminderEditScope = "this" | "this_and_following" | "all";

export type Reminder = {
  id: string;
  title: string;
  description: string | null;
  repeats: boolean;
  recurrenceType: ReminderRecurrence;
  scheduledDate: string | null;
  weekdays: number[] | null;
  dayOfMonth: number | null;
  monthOfYear: number | null;
  timeMode: ReminderTimeMode;
  startTime: string | null;
  endTime: string | null;
  notifyEnabled: boolean;
  notifyValue: number | null;
  notifyUnit: ReminderNotifyUnit | null;
  completed: boolean;
  completionCount?: number;
  nextOccurrenceAt: string | null;
  notifyAt: string | null;
  lastCompletedAt: string | null;
  seriesId: string | null;
  seriesStart: string | null;
  seriesUntil: string | null;
  originalOccurrenceDate: string | null;
  isOverride: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReminderOccurrence = {
  reminderId: string;
  seriesId: string | null;
  date: string;
  title: string;
  description: string | null;
  repeats: boolean;
  recurrenceType: ReminderRecurrence;
  timeMode: ReminderTimeMode;
  startTime: string | null;
  endTime: string | null;
  isOverride: boolean;
  completed: boolean;
  reminder: Reminder;
};

export type UpcomingReminder = Reminder & {
  isOverdue: boolean;
  isNotifyActive: boolean;
  isDueToday: boolean;
};

export type CreateReminderPayload = {
  title: string;
  description?: string;
  repeats: boolean;
  recurrenceType?: ReminderRecurrence;
  scheduledDate?: string;
  weekdays?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  timeMode: ReminderTimeMode;
  startTime?: string;
  endTime?: string;
  notifyEnabled: boolean;
  notifyValue?: number;
  notifyUnit?: ReminderNotifyUnit;
};

export type UpdateReminderPayload = CreateReminderPayload & {
  scope?: ReminderEditScope;
  occurrenceDate?: string;
};

export type ReminderCompletion = {
  id: string;
  reminderId: string;
  completedAt: string;
  occurrenceDate: string | null;
};
