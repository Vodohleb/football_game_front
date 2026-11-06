import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const percent =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-secondary">
          <span>{label}</span>
          <span>
            {Math.round(value)} / {max}
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-bg-hover">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-[width] duration-500',
            barClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
