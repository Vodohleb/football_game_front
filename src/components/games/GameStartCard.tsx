import type { ReactNode } from 'react';

import { GameIcon } from '@/components/games/GameIcon';
import { ModeSelector } from '@/components/games/ModeSelector';
import { Button } from '@/components/ui/Button';
import type { GameMeta } from '@/constants/games';

interface GameStartCardProps {
  meta: GameMeta;
  mode: string;
  onModeChange: (mode: string) => void;
  onStart: () => void;
  loading?: boolean;
  children?: ReactNode;
  rules?: string[];
}

export function GameStartCard({
  meta,
  mode,
  onModeChange,
  onStart,
  loading = false,
  children,
  rules,
}: GameStartCardProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card to-bg-secondary p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-primary/10 blur-3xl" />
        <GameIcon code={meta.code} size="lg" className="relative" />
        <h1 className="relative mt-5 text-3xl font-extrabold text-text-primary">
          {meta.title}
        </h1>
        <p className="relative mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
          {meta.description}
        </p>
        {rules && rules.length > 0 && (
          <ul className="relative mt-5 space-y-2">
            {rules.map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-2 text-sm text-text-secondary"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                {rule}
              </li>
            ))}
          </ul>
        )}
        {children && <div className="relative mt-6">{children}</div>}
      </div>

      <div className="space-y-5 rounded-3xl border border-border bg-bg-card p-5">
        <ModeSelector
          modes={meta.modes}
          value={mode}
          onChange={onModeChange}
        />
        <div className="rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-xs text-text-secondary">
          Все действия проверяются на сервере. Результаты и награды
          рассчитываются только backend-ом.
        </div>
        <Button
          size="lg"
          fullWidth
          onClick={onStart}
          loading={loading}
        >
          Начать игру
        </Button>
      </div>
    </div>
  );
}
