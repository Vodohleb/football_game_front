import { Trophy } from 'lucide-react';

import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

interface RatingBadgeProps {
  rating: number | null | undefined;
  rank?: number | null;
  className?: string;
  compact?: boolean;
}

export function RatingBadge({
  rating,
  rank,
  className,
  compact = false,
}: RatingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-blue/25 bg-blue/10 font-semibold text-blue',
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        className,
      )}
    >
      <Trophy className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {rating === null || rating === undefined ? '—' : formatNumber(rating)}
      {rank !== null && rank !== undefined && (
        <span className="text-[10px] font-medium text-blue/60">#{rank}</span>
      )}
    </span>
  );
}
