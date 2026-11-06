import { Check, Shield } from 'lucide-react';
import type { ReactNode } from 'react';

import { normalizeCard } from '@/components/cards/playerCardData';
import { cn } from '@/utils/cn';
import { rarityStyle } from '@/utils/rarity';
import type { Card, CardSnapshot } from '@/types/api';

export type PlayerCardSize = 'xs' | 'sm' | 'md' | 'lg';

interface PlayerCardProps {
  card: Card | CardSnapshot;
  size?: PlayerCardSize;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  footer?: ReactNode;
  badge?: ReactNode;
  showStats?: boolean;
  className?: string;
  highlightStat?: string;
}

const SIZES: Record<
  PlayerCardSize,
  {
    wrapper: string;
    rating: string;
    name: string;
    stats: string;
    avatar: string;
  }
> = {
  xs: {
    wrapper: 'p-2.5 rounded-xl',
    rating: 'text-2xl',
    name: 'text-xs',
    stats: 'text-[10px]',
    avatar: 'h-8 w-8 text-[10px]',
  },
  sm: {
    wrapper: 'p-3 rounded-2xl',
    rating: 'text-3xl',
    name: 'text-sm',
    stats: 'text-[11px]',
    avatar: 'h-10 w-10 text-xs',
  },
  md: {
    wrapper: 'p-4 rounded-2xl',
    rating: 'text-4xl',
    name: 'text-base',
    stats: 'text-xs',
    avatar: 'h-14 w-14 text-sm',
  },
  lg: {
    wrapper: 'p-5 rounded-3xl',
    rating: 'text-5xl',
    name: 'text-xl',
    stats: 'text-sm',
    avatar: 'h-20 w-20 text-lg',
  },
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function StatRow({
  label,
  value,
  highlighted,
  compact,
}: {
  label: string;
  value: number;
  highlighted?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={cn('text-white/55', compact && 'text-[10px]')}>
        {label}
      </span>
      <span
        className={cn(
          'font-bold tabular-nums text-white',
          highlighted && 'text-gold',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PlayerCard({
  card,
  size = 'md',
  selected = false,
  onClick,
  disabled = false,
  footer,
  badge,
  showStats = true,
  className,
  highlightStat,
}: PlayerCardProps) {
  const data = normalizeCard(card);
  const style = rarityStyle(data.rarity);
  const sizing = SIZES[size];

  const content = (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/40 blur-2xl" />
      </div>
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <div className={cn('font-display font-extrabold leading-none', sizing.rating)}>
            {data.rating}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
            {data.position}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {badge}
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
              style.chip,
            )}
          >
            {style.label}
          </span>
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-3">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 font-display font-bold text-white backdrop-blur',
            sizing.avatar,
          )}
        >
          {initials(data.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn('truncate font-display font-bold text-white', sizing.name)}>
            {data.name}
          </div>
          <div className="mt-0.5 truncate text-[10px] text-white/55">
            {data.nationality} · {data.club}
          </div>
        </div>
      </div>

      {showStats && (
        <div className={cn('relative mt-3 grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-white/10 pt-2', sizing.stats)}>
          <StatRow label="PAC" value={data.stats.pace} highlighted={highlightStat === 'pace'} compact={size === 'xs'} />
          <StatRow label="SHO" value={data.stats.shooting} highlighted={highlightStat === 'shooting'} compact={size === 'xs'} />
          <StatRow label="PAS" value={data.stats.passing} highlighted={highlightStat === 'passing'} compact={size === 'xs'} />
          <StatRow label="DRI" value={data.stats.dribbling} highlighted={highlightStat === 'dribbling'} compact={size === 'xs'} />
          <StatRow label="DEF" value={data.stats.defending} highlighted={highlightStat === 'defending'} compact={size === 'xs'} />
          <StatRow label="PHY" value={data.stats.physical} highlighted={highlightStat === 'physical'} compact={size === 'xs'} />
        </div>
      )}

      {footer && <div className="relative mt-3">{footer}</div>}

      {selected && (
        <span className="absolute inset-0 rounded-[inherit] ring-2 ring-accent-primary">
          <span className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-accent-primary text-bg-primary shadow-lg">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        </span>
      )}
    </>
  );

  const classes = cn(
    'group relative isolate w-full overflow-hidden border bg-gradient-to-br text-left shadow-xl transition-all duration-200',
    style.gradient,
    style.border,
    style.glow,
    sizing.wrapper,
    onClick && !disabled && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-2xl',
    disabled && 'opacity-60',
    selected && 'ring-2 ring-accent-primary',
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={classes}
      >
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}

export function CardPlaceholder({
  position,
  className,
  onClick,
}: {
  position: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-full min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-black/20 text-white/40 transition-colors hover:border-accent-primary/50 hover:text-accent-primary',
        className,
      )}
    >
      <Shield className="h-6 w-6" />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {position}
      </span>
    </button>
  );
}
