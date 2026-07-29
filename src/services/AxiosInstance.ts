import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './auth/session';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL = import.meta.env.VITE_BACK_URL;
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = axios
    .patch('/auth/refresh-token', {}, { baseURL, withCredentials: true })
    .then((response) => {
      const token =
        typeof response.data?.accessToken === 'string'
          ? response.data.accessToken
          : null;
      setAccessToken(token);
      return token;
    })
    .catch(() => {
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

/**
 * Instancia de Axios configurada para la aplicación.
 *
 * @remarks
 * - Usa la URL base definida en las variables de entorno (`VITE_BACK_URL`).
 * - Establece el header 'Content-Type' a 'application/json' para todas las peticiones.
 * - Utiliza esta instancia para realizar llamadas a la API en toda la aplicación.
 */
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh-token') ||
      url.includes('/auth/logout');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const nextAccessToken = await refreshAccessToken();

    if (!nextAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

    return axiosInstance(originalRequest);
  },
);

export default axiosInstance;