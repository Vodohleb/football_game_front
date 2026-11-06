import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useEffect } from 'react';

import {
  useNotificationStore,
  type Toast,
  type ToastKind,
} from '@/stores/notificationStore';
import { cn } from '@/utils/cn';

const ICONS: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
};

const STYLES: Record<ToastKind, string> = {
  success: 'border-accent-primary/40 text-accent-primary',
  error: 'border-red/40 text-red',
  info: 'border-blue/40 text-blue',
  warning: 'border-gold/40 text-gold',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useNotificationStore((state) => state.dismiss);
  const Icon = ICONS[toast.kind];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 4500);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-bg-card px-4 py-3 shadow-2xl sm:w-96',
        STYLES[toast.kind],
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-text-secondary">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="rounded-md p-1 text-text-muted hover:bg-bg-hover hover:text-text-primary"
        aria-label="Закрыть уведомление"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastViewport() {
  const toasts = useNotificationStore((state) => state.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-4 sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
