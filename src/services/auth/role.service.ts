import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { CreateRoleDefinitionPayload, RoleDefinition } from "./types/RoleDefinition.type";

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

export const getRoles = async (_token: string): Promise<ServiceResponse<RoleDefinition[]>> => {
  try {
    const response = await axiosInstance.get<RoleDefinition[]>("/auth/roles");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const getPublicRegistrationRoles = async (): Promise<ServiceResponse<RoleDefinition[]>> => {
  try {
    const response = await axiosInstance.get<RoleDefinition[]>("/auth/roles/public-registration");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createRole = async (
  _token: string,
  payload: CreateRoleDefinitionPayload,
): Promise<ServiceResponse<RoleDefinition>> => {
  try {
    const response = await axiosInstance.post<RoleDefinition>("/auth/roles", payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteRole = async (_token: string, roleId: string): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/auth/roles/${roleId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
