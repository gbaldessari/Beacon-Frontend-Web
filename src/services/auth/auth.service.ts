
import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { ChangePasswordPayload } from "./types/ChangePassword.type";
import type { DeleteUserPayload } from "./types/DeleteUser.type";
import type { GetProfileResponse } from "./types/GetProfile.type";
import type { GetUsersResponse } from "./types/GetUsers.type";
import type { LoginPayload, LoginResponse } from "./types/Login.type";
import type { PublicRegisterPayload } from "./types/PublicRegister.type";
import type { RecoverPasswordPayload } from "./types/RecoverPassword.type";
import type { RegisterPayload } from "./types/Register.type";
import type { ResetPasswordPayload } from "./types/ResetPassword.type";
import type { UserRole } from "./types/UserRole.type";
import type { UpdateNamePayload } from "./types/UpdateName.type";
import type { UpdateUserRolePayload } from "./types/UpdateUserRole.type";
import type { UpdateUserStatusPayload } from "./types/UpdateUserStatus.type";
import type { ValidateAccessTokenResponse } from "./types/ValidateAccessToken.type";
import type { ValidateRefreshTokenPayload, ValidateRefreshTokenResponse } from "./types/ValidateRefreshToken.type";

/**
 * @description
 * Este archivo contiene funciones para interactuar con la API de autenticación.
 * Las funciones permiten registrar, iniciar sesión, validar tokens,
 * recuperar y restablecer contraseñas, y actualizar el nombre del usuario.
 */

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

/**
 * Registra un nuevo usuario en el sistema.
 * 
 * @param {string} token - El token de autorización del usuario.
 * @param {RegisterPayload} payload - La carga útil que contiene la información del nuevo usuario.
 */
export const register = async (_token: string, payload: RegisterPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.post('/auth/register', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Registra un nuevo usuario desde la vista pública de autenticación.
 *
 * @param {PublicRegisterPayload} payload - Datos de registro público.
 */
export const publicRegister = async (payload: PublicRegisterPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.post('/auth/public-register', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Inicia sesión en el sistema.
 * 
 * @param {LoginPayload} payload - La carga útil que contiene la información de inicio de sesión.
 */
export const login = async (payload: LoginPayload): Promise<ServiceResponse<LoginResponse>> => {
  try {
    const response = await axiosInstance.patch('/auth/login', payload);
    return { success: true, data: response.data as LoginResponse };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Valida el token de acceso.
 * 
 * @param {string} token - El token de acceso a validar.
 */
export const validateToken = async (_token: string): Promise<ServiceResponse<ValidateAccessTokenResponse>> => {
  try {
    const response = await axiosInstance.get('/auth/validate-token');
    return { 
      success: true, data: response.data as ValidateAccessTokenResponse };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Valida el token de actualización.
 * 
 * @param {ValidateRefreshTokenPayload} payload - La carga útil que contiene el token de actualización a validar.
 */
export const validateRefreshToken = async (_payload: ValidateRefreshTokenPayload): Promise<ServiceResponse<ValidateRefreshTokenResponse>> => {
  try {
    const response = await axiosInstance.patch('/auth/refresh-token', {});
    return { success: true, data: response.data as ValidateRefreshTokenResponse };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
}

/**
 * Recupera la contraseña del usuario.
 * 
 * @param {RecoverPasswordPayload} payload - La carga útil que contiene la información para recuperar la contraseña.
 */
export const recoverPassword = async (payload: RecoverPasswordPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/request-password-reset', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Restablece la contraseña del usuario.
 * 
 * @param {ResetPasswordPayload} payload - La carga útil que contiene la información para restablecer la contraseña.
 */
export const resetPassword = async (payload: ResetPasswordPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/reset-password', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Obtiene el rol y tipo de permiso del usuario autenticado.
 */
export const getRole = async (_token: string): Promise<ServiceResponse<UserRole>> => {
  try {
    const response = await axiosInstance.get<UserRole>('/auth/get-role');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Obtiene el perfil personal del usuario autenticado.
 */
export const getProfile = async (_token: string): Promise<ServiceResponse<GetProfileResponse>> => {
  try {
    const response = await axiosInstance.get<GetProfileResponse>('/auth/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Verifica el código de recuperación de contraseña.
 * 
 * @param {string} token - El token de autorización del usuario.
 */
export const logout = async (_token: string): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/logout', {});
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Actualiza el nombre del usuario.
 * 
 * @param {string} token - El token de autorización del usuario.
 * @param {UpdateNamePayload} payload - La carga útil que contiene la información para actualizar el nombre.
 */
export const updateName = async (_token: string, payload: UpdateNamePayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/update-name', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Cambia la contraseña del usuario.
 * 
 * @param {string} token - El token de autorización del usuario.
 * @param {ChangePasswordPayload} payload - La carga útil que contiene la información para cambiar la contraseña.
 */
export const changePassword = async (_token: string, payload: ChangePasswordPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/change-password', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/** * Obtiene la lista de usuarios.
 * 
 * @param {string} token - El token de autorización del usuario.
 */
export const getUsers = async (_token: string): Promise<ServiceResponse<GetUsersResponse[]>> => {
  try {
    const response = await axiosInstance.get('/auth/get-users');

    const users = (response.data as any[])
      .map((user) => ({
        id: String(user?.id ?? user?._id ?? "").trim(),
        firstName: String(user?.firstName ?? "").trim(),
        lastName: String(user?.lastName ?? "").trim(),
        email: String(user?.email ?? "").trim(),
        isActive:
          typeof user?.isActive === "boolean"
            ? user.isActive
            : typeof user?.is_active === "boolean"
              ? user.is_active
              : false,
        role: String(user?.role ?? "").trim(),
        roleName: String(user?.roleName ?? user?.role_name ?? user?.role ?? "").trim(),
      }))
      .filter((user) => user.id.length > 0);

    return { success: true, data: users as GetUsersResponse[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Elimina un usuario desde la administración Beacon.
 */
export const deleteUser = async (_token: string, payload: DeleteUserPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete('/auth/delete-user', {
      params: payload,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Activa o desactiva un usuario administrado.
 */
export const updateUserStatus = async (
  _token: string,
  payload: UpdateUserStatusPayload,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/update-user-status', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

/**
 * Actualiza el rol asignado a un usuario administrado.
 */
export const updateUserRole = async (
  _token: string,
  payload: UpdateUserRolePayload,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/auth/update-user-role', payload);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
