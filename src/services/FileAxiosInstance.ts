import axios from 'axios';
import { getAccessToken } from './auth/session';

/**
 * Instancia de Axios para peticiones relacionadas con archivos.
 *
 * @remarks
 * - Usa la URL base definida en las variables de entorno (`VITE_BACK_URL`).
 * - Utiliza esta instancia para realizar llamadas a la API que devuelvan archivos.
 */
const fileAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACK_URL,
  withCredentials: true,
});

fileAxiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default fileAxiosInstance;