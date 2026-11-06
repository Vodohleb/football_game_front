import { AlertTriangle, RefreshCw } from 'lucide-react';

import { errorMessage } from '@/utils/errors';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  compact?: boolean;
}

export function ErrorState({
  error,
  onRetry,
  title = 'Не удалось загрузить данные',
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={
        compact
          ? 'flex items-center justify-between gap-3 rounded-xl border border-red/25 bg-red/5 px-4 py-3'
          : 'flex flex-col items-center justify-center rounded-2xl border border-red/25 bg-red/5 px-6 py-10 text-center'
      }
    >
      <div className={compact ? 'flex items-center gap-2' : ''}>
        <AlertTriangle className="h-5 w-5 shrink-0 text-red" />
        <div className={compact ? '' : 'mt-3'}>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-xs text-text-secondary">
            {errorMessage(error)}
          </p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className={compact ? '' : 'mt-4'}
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Повторить
        </Button>
      )}
    </div>
  );
}
