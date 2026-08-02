import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type {
  CreateReminderPayload,
  Reminder,
  ReminderCompletion,
  ReminderEditScope,
  ReminderOccurrence,
  UpcomingReminder,
  UpdateReminderPayload,
} from "./types/Reminder.type";

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

export const listReminders = async (
  calendarIds?: string[],
): Promise<ServiceResponse<Reminder[]>> => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await axiosInstance.get("/reminders", {
      params: {
        timezone,
        ...(calendarIds?.length
          ? { calendarIds: calendarIds.join(",") }
          : {}),
      },
    });
    return { success: true, data: response.data as Reminder[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listReminderOccurrences = async (
  from: string,
  to: string,
  calendarIds?: string[],
): Promise<ServiceResponse<ReminderOccurrence[]>> => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await axiosInstance.get("/reminders/occurrences", {
      params: {
        from,
        to,
        timezone,
        ...(calendarIds?.length
          ? { calendarIds: calendarIds.join(",") }
          : {}),
      },
    });
    return { success: true, data: response.data as ReminderOccurrence[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listUpcomingReminders = async (): Promise<
  ServiceResponse<UpcomingReminder[]>
> => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await axiosInstance.get("/reminders/upcoming", {
      params: { timezone },
    });
    return { success: true, data: response.data as UpcomingReminder[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createReminder = async (
  payload: CreateReminderPayload,
): Promise<ServiceResponse<Reminder>> => {
  try {
    const response = await axiosInstance.post("/reminders", payload);
    return { success: true, data: response.data as Reminder };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const updateReminder = async (
  id: string,
  payload: UpdateReminderPayload,
): Promise<ServiceResponse<Reminder>> => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await axiosInstance.patch(`/reminders/${id}`, payload, {
      params: { timezone },
    });
    return { success: true, data: response.data as Reminder };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const setReminderCompletion = async (
  id: string,
  completed?: boolean,
  occurrenceDate?: string,
): Promise<ServiceResponse<Reminder>> => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await axiosInstance.patch(
      `/reminders/${id}/completion`,
      {
        completed,
        ...(occurrenceDate ? { occurrenceDate } : {}),
      },
      { params: { timezone } },
    );
    return { success: true, data: response.data as Reminder };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listReminderCompletions = async (
  from?: string,
  to?: string,
): Promise<ServiceResponse<ReminderCompletion[]>> => {
  try {
    const response = await axiosInstance.get("/reminders/completions", {
      params: { from, to },
    });
    return { success: true, data: response.data as ReminderCompletion[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteReminder = async (
  id: string,
  options?: { scope?: ReminderEditScope; occurrenceDate?: string },
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/reminders/${id}`, {
      params: {
        ...(options?.scope ? { scope: options.scope } : {}),
        ...(options?.occurrenceDate
          ? { occurrenceDate: options.occurrenceDate }
          : {}),
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
