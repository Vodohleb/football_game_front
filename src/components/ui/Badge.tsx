import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'gold';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-bg-hover text-text-secondary border-border',
  success: 'bg-accent-primary/10 text-accent-primary border-accent-primary/25',
  warning: 'bg-gold/10 text-gold border-gold/25',
  danger: 'bg-red/10 text-red border-red/25',
  info: 'bg-blue/10 text-blue border-blue/25',
  purple: 'bg-purple/10 text-purple border-purple/25',
  gold: 'bg-gold/15 text-gold border-gold/30',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        VARIANTS[variant],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
