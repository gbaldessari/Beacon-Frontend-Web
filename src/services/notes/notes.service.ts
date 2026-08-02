import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type {
  CreateNotePayload,
  ListNotesParams,
  Note,
  NoteLabel,
  UpdateNotePayload,
} from "./types/Note.type";

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

export const listNotes = async (
  params: ListNotesParams = {},
): Promise<ServiceResponse<Note[]>> => {
  try {
    const response = await axiosInstance.get("/notes", { params });
    return { success: true, data: response.data as Note[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createNote = async (
  payload: CreateNotePayload,
): Promise<ServiceResponse<Note>> => {
  try {
    const response = await axiosInstance.post("/notes", payload);
    return { success: true, data: response.data as Note };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const updateNote = async (
  id: string,
  payload: UpdateNotePayload,
): Promise<ServiceResponse<Note>> => {
  try {
    const response = await axiosInstance.patch(`/notes/${id}`, payload);
    return { success: true, data: response.data as Note };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteNote = async (id: string): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.delete(`/notes/${id}`);
    return { success: true, data: response.data as { success: boolean } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listNoteLabels = async (): Promise<ServiceResponse<NoteLabel[]>> => {
  try {
    const response = await axiosInstance.get("/notes/labels");
    return { success: true, data: response.data as NoteLabel[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createNoteLabel = async (payload: {
  name: string;
  color?: string;
}): Promise<ServiceResponse<NoteLabel>> => {
  try {
    const response = await axiosInstance.post("/notes/labels", payload);
    return { success: true, data: response.data as NoteLabel };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteNoteLabel = async (
  id: string,
): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.delete(`/notes/labels/${id}`);
    return { success: true, data: response.data as { success: boolean } };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
