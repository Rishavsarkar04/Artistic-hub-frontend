import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './config';
import { useAuthStore } from '@/stores/authStore';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

// Admin endpoints use the admin session; everything else uses the customer's.
const isAdminRequest = (url?: string) => !!url?.startsWith('/admin');

/** Every failed request rejects with this, so callers handle one error shape. */
export class ApiError extends Error {
  /** HTTP status code; 0 when there was no response (network error or timeout). */
  readonly status: number;
  /** The response body, e.g. the backend's validation errors. */
  readonly data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/** The shared axios instance: base URL and timeout from `config.ts`. */
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { Accept: 'application/json' },
});

// Attach the right session's token to every request.
http.interceptors.request.use((config) => {
  const token = isAdminRequest(config.url) ? useAdminAuthStore.getState().token : useAuthStore.getState().token;
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
    if (status === 401) (isAdminRequest(error.config?.url) ? useAdminAuthStore : useAuthStore).getState().logout();
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
