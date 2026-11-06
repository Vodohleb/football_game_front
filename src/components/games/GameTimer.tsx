import { Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/utils/cn';
import { formatSeconds } from '@/utils/format';

interface GameTimerProps {
  expiresAt: string | null | undefined;
  totalSeconds?: number;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export function GameTimer({
  expiresAt,
  totalSeconds,
  onExpire,
  className,
  compact = false,
}: GameTimerProps) {
  const { secondsLeft, expired } = useCountdown(expiresAt);
  const danger = secondsLeft > 0 && secondsLeft <= 15;
  const percent =
    totalSeconds && totalSeconds > 0
      ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
      : null;

  const notified = useRef(false);
  useEffect(() => {
    if (!expired) {
      notified.current = false;
      return;
    }
    if (onExpire && !notified.current) {
      notified.current = true;
      onExpire();
    }
  }, [expired, onExpire]);

  return (
    <div
      className={cn(
        'inline-flex flex-col gap-1 rounded-xl border px-3 py-2',
        danger
          ? 'border-red/40 bg-red/10 text-red'
          : 'border-border bg-bg-card text-text-primary',
        className,
      )}
    >
      <span className="flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums">
        <Clock className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {formatSeconds(secondsLeft)}
      </span>
      {percent !== null && (
        <span className="h-1 w-20 overflow-hidden rounded-full bg-white/10">
          <span
            className={cn(
              'block h-full rounded-full transition-[width] duration-1000',
              danger ? 'bg-red' : 'bg-accent-primary',
            )}
            style={{ width: `${percent}%` }}
          />
        </span>
      )}
    </div>
  );
}
