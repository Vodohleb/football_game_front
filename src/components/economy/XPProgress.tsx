import { Zap } from 'lucide-react';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

interface XPProgressProps {
  level: number;
  xp: number;
  nextLevelXp?: number | null;
  progressPercent?: number;
  compact?: boolean;
  className?: string;
}

export function XPProgress({
  level,
  xp,
  nextLevelXp,
  progressPercent,
  compact = false,
  className,
}: XPProgressProps) {
  const percent =
    progressPercent ??
    (nextLevelXp && nextLevelXp > 0
      ? Math.min(100, (xp / nextLevelXp) * 100)
      : 0);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary/15 text-[11px] font-bold text-accent-primary">
          {level}
        </span>
        <div className="w-24">
          <ProgressBar value={percent} max={100} />
        </div>
        <span className="text-[11px] text-text-secondary">LVL</span>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-bg-card px-4 py-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
          <Zap className="h-4 w-4 text-accent-primary" />
          Уровень {level}
        </span>
        <span className="text-xs text-text-secondary">
          {formatNumber(xp)} XP
          {nextLevelXp ? ` / ${formatNumber(nextLevelXp)}` : ''}
        </span>
      </div>
      <ProgressBar value={percent} max={100} />
    </div>
  );
}
