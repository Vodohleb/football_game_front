import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Gamepad2, Info, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';

import { GameIcon } from '@/components/games/GameIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { gameService } from '@/services/gameService';

export default function AdminGamesPage() {
  useDocumentTitle('Администрирование: игры');
  const gamesQuery = useQuery({
    queryKey: ['games'],
    queryFn: gameService.list,
  });

  const games = gamesQuery.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Мини-игры"
        subtitle="Статусы игровых режимов и переход к управлению вопросами."
        actions={
          <Link to="/admin/questions">
            <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Управление вопросами
            </Button>
          </Link>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-blue/25 bg-blue/5 p-4 text-sm text-blue">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Конфигурация игр</p>
          <p className="mt-1 text-xs text-blue/80">
            Игровые лимиты, таймеры, награды и коэффициенты задаются в конфигурации
            backend и системных настройках платформы. Здесь отображается
            актуальный каталог доступных игровых режимов.
          </p>
        </div>
      </div>

      {gamesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : gamesQuery.isError ? (
        <ErrorState error={gamesQuery.error} onRetry={() => gamesQuery.refetch()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="rounded-2xl border border-border bg-bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <GameIcon code={game.code} size="md" />
                <Badge variant={game.is_active ? 'success' : 'default'}>
                  {game.is_active ? 'active' : 'disabled'}
                </Badge>
              </div>
              <h2 className="mt-3 text-base font-bold text-text-primary">
                {game.name}
              </h2>
              <p className="mt-1 min-h-10 text-xs text-text-secondary">
                {game.description ?? 'Без описания'}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-muted">
                <span className="font-mono">{game.code}</span>
                <Link
                  to="/admin/questions"
                  className="flex items-center gap-1 font-semibold text-accent-primary hover:underline"
                >
                  Вопросы
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/questions"
          className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/40"
        >
          <Gamepad2 className="h-4 w-4 text-accent-primary" />
          Игровые вопросы
        </Link>
        <Link
          to="/admin/ratings"
          className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/40"
        >
          <Swords className="h-4 w-4 text-blue" />
          Рейтинги и PvP
        </Link>
      </div>
    </div>
  );
}
