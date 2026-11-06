import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface NotificationState {
  toasts: Toast[];
  push: (kind: ToastKind, title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],
  push: (kind, title, message) => {
    const id = makeId();
    set((state) => ({
      toasts: [...state.toasts, { id, kind, title, message }],
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export const notify = {
  success: (title: string, message?: string) =>
    useNotificationStore.getState().push('success', title, message),
  error: (title: string, message?: string) =>
    useNotificationStore.getState().push('error', title, message),
  info: (title: string, message?: string) =>
    useNotificationStore.getState().push('info', title, message),
  warning: (title: string, message?: string) =>
    useNotificationStore.getState().push('warning', title, message),
};
