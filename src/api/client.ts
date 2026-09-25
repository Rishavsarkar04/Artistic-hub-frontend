import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import { useAuthStore } from '@/stores/authStore';

/** Every failed request rejects with this, so callers handle one error shape. */
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

/** The shared axios instance: base URL and timeout from `config.ts`. */
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { Accept: 'application/json' },
});

// Attach the signed-in user's token to every request.
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn axios errors into ApiError. Cancelled requests pass through untouched so callers can ignore them.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status ?? 0;
    // An expired or invalid session: sign out locally so the UI matches.
    if (status === 401) useAuthStore.getState().logout();
    const message =
      error.response?.data?.message ??
      (error.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : status ? `Request failed (${status})` : 'Network error. Check your connection.');
    return Promise.reject(new ApiError(status, message, error.response?.data));
  },
);

/** Request helpers that resolve to the response body. Pass query params as `{ params }`. */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => http.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => http.post<T>(url, body, config).then((r) => r.data),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => http.put<T>(url, body, config).then((r) => r.data),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => http.patch<T>(url, body, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) => http.delete<T>(url, config).then((r) => r.data),
};
