export type ReminderRecurrence = "none" | "weekly" | "monthly" | "yearly";
export type ReminderTimeMode = "all_day" | "time" | "range";
export type ReminderNotifyUnit = "hours" | "days";

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
  createdAt: string;
  updatedAt: string;
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
