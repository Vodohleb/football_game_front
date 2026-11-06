import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '@/stores/authStore';
import type { ApiEnvelope, Tokens } from '@/types/api';
import { ApiError, normalizeError } from '@/utils/errors';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const response = await refreshClient.post<
    ApiEnvelope<{ tokens: Tokens }>
  >('/auth/refresh', {});
  const token = response.data.data.tokens.access_token;
  useAuthStore.getState().setAccessToken(token);
  return token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(normalizeError(error));
    }

    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (status === 401 && config && !config._retry && !isAuthEndpoint) {
      config._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const token = await refreshPromise;
        config.headers.Authorization = `Bearer ${token}`;
        return await api.request(config);
      } catch {
        useAuthStore.getState().clear();
        return Promise.reject(
          new ApiError(
            'UNAUTHORIZED',
            'Сессия истекла. Войдите снова.',
            401,
          ),
        );
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export async function getEnvelope<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiEnvelope<T>> {
  const response = await api.get<ApiEnvelope<T>>(url, config);
  return response.data;
}

export async function getData<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const envelope = await getEnvelope<T>(url, config);
  return envelope.data;
}

export async function postData<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.post<ApiEnvelope<T>>(url, body, config);
  return response.data.data;
}

export async function patchData<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.patch<ApiEnvelope<T>>(url, body, config);
  return response.data.data;
}

export async function putData<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.put<ApiEnvelope<T>>(url, body, config);
  return response.data.data;
}

export async function deleteData<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.delete<ApiEnvelope<T>>(url, config);
  return response.data.data;
}

export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function websocketBaseUrl(): string {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  if (API_URL.startsWith('http')) {
    return `${API_URL.replace(/^http/, 'ws').replace(/\/$/, '')}`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/v1`;
}

export function apiErrorMessage(error: unknown): string {
  return normalizeError(error).message;
}

export { API_URL };
