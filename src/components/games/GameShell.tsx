import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { GameTimer } from '@/components/games/GameTimer';

interface GameShellProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  expiresAt?: string | null;
  totalSeconds?: number;
  onExpire?: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}

export function GameShell({
  title,
  subtitle,
  backTo = '/app/games',
  expiresAt,
  totalSeconds,
  onExpire,
  headerRight,
  children,
  aside,
}: GameShellProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={backTo}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card text-text-secondary transition-colors hover:border-[#3a4b5e] hover:text-text-primary"
            aria-label="Назад"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-xs text-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {expiresAt && (
            <GameTimer
              expiresAt={expiresAt}
              totalSeconds={totalSeconds}
              onExpire={onExpire}
            />
          )}
        </div>
      </div>
      <div className={aside ? 'grid gap-5 xl:grid-cols-[1fr_320px]' : ''}>
        <div className="min-w-0">{children}</div>
        {aside && <div className="space-y-4">{aside}</div>}
      </div>
    </div>
  );
}
