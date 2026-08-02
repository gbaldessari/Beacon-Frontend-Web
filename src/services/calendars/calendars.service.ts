import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type {
  Calendar,
  CalendarInvite,
  CalendarMember,
} from "./types/Calendar.type";

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

export const listCalendars = async (): Promise<ServiceResponse<Calendar[]>> => {
  try {
    const response = await axiosInstance.get("/calendars");
    return { success: true, data: response.data as Calendar[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createCalendar = async (
  name: string,
  color?: string,
): Promise<ServiceResponse<Calendar>> => {
  try {
    const response = await axiosInstance.post("/calendars", { name, color });
    return { success: true, data: response.data as Calendar };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const updateCalendar = async (
  calendarId: string,
  payload: { name?: string; color?: string },
): Promise<ServiceResponse<Calendar>> => {
  try {
    const response = await axiosInstance.patch(
      `/calendars/${calendarId}`,
      payload,
    );
    return { success: true, data: response.data as Calendar };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteCalendar = async (
  calendarId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/calendars/${calendarId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listCalendarMembers = async (
  calendarId: string,
): Promise<ServiceResponse<CalendarMember[]>> => {
  try {
    const response = await axiosInstance.get(
      `/calendars/${calendarId}/members`,
    );
    return { success: true, data: response.data as CalendarMember[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const removeCalendarMember = async (
  calendarId: string,
  userId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/calendars/${calendarId}/members/${userId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createCalendarInvite = async (
  calendarId: string,
  email: string,
  role: string,
): Promise<ServiceResponse<CalendarInvite>> => {
  try {
    const response = await axiosInstance.post(
      `/calendars/${calendarId}/invites`,
      { email, role },
    );
    return { success: true, data: response.data as CalendarInvite };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listCalendarInvites = async (
  calendarId: string,
): Promise<ServiceResponse<CalendarInvite[]>> => {
  try {
    const response = await axiosInstance.get(
      `/calendars/${calendarId}/invites`,
    );
    return { success: true, data: response.data as CalendarInvite[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const revokeCalendarInvite = async (
  calendarId: string,
  inviteId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(
      `/calendars/${calendarId}/invites/${inviteId}`,
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const acceptCalendarInvite = async (
  token: string,
): Promise<ServiceResponse<Calendar>> => {
  try {
    const response = await axiosInstance.post(
      `/calendars/invites/${token}/accept`,
    );
    return { success: true, data: response.data as Calendar };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listPendingCalendarInvites = async (): Promise<
  ServiceResponse<CalendarInvite[]>
> => {
  try {
    const response = await axiosInstance.get("/calendars/invites/pending");
    return { success: true, data: response.data as CalendarInvite[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
