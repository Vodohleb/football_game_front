import axios from 'axios';

import type { ApiErrorPayload } from '@/types/api';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number | null;
  readonly details: unknown;

  constructor(
    code: string,
    message: string,
    status: number | null = null,
    details: unknown = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const payload = error.response?.data as
      | { error?: ApiErrorPayload; detail?: unknown }
      | undefined;

    if (payload?.error) {
      return new ApiError(
        payload.error.code,
        payload.error.message,
        status,
        payload.error.details,
      );
    }

    if (Array.isArray(payload?.detail)) {
      return new ApiError(
        'VALIDATION_ERROR',
        'Проверьте правильность заполнения полей',
        status,
        payload.detail,
      );
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError('TIMEOUT', 'Сервер не ответил вовремя', status);
    }

    if (!error.response) {
      return new ApiError(
        'NETWORK_ERROR',
        'Нет соединения с сервером',
        status,
      );
    }

    return new ApiError(
      'REQUEST_FAILED',
      error.response.statusText || 'Ошибка запроса',
      status,
      payload,
    );
  }

  if (error instanceof Error) {
    return new ApiError('UNKNOWN_ERROR', error.message);
  }

  return new ApiError('UNKNOWN_ERROR', 'Неизвестная ошибка');
}

export function errorMessage(error: unknown): string {
  return normalizeError(error).message;
}
