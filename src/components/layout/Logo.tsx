import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

interface LogoProps {
  to?: string;
  compact?: boolean;
  className?: string;
}

export function Logo({ to = '/', compact = false, className }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn('flex items-center gap-2.5', className)}
      aria-label="Football Arena"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/25">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-bg-primary" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.2 3.4 2.5-1.3 4H9.9L8.6 7.7 12 5.2Zm-6.1 4.4 2.6 1.9-1 3.1-3 .9a7.8 7.8 0 0 1 1.4-5.9Zm2.9 7.6 1-3.1h4.4l1 3.1-3.2 2.3-3.2-2.3Zm8.7-2.6-1-3.1 2.6-1.9a7.8 7.8 0 0 1 1.4 5.9l-3-.9Z" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-sm font-extrabold tracking-wide text-text-primary">
            FOOTBALL
          </span>
          <span className="block font-display text-[11px] font-bold tracking-[0.28em] text-accent-primary">
            ARENA
          </span>
        </span>
      )}
    </Link>
  );
}
