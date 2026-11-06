import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  className,
  padded = true,
  hoverable = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-bg-card',
        padded && 'p-4 sm:p-5',
        hoverable && 'transition-colors hover:border-[#3a4b5e]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
