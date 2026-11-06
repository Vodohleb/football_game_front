import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { GAME_META, GAME_ORDER } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ratingService } from '@/services/ratingService';
import type { LeaderboardEntry } from '@/types/api';
import { formatNumber } from '@/utils/format';

type TabValue = 'global' | 'game' | 'season';

export default function AdminRatingsPage() {
  useDocumentTitle('Администрирование: рейтинги');
  const [tab, setTab] = useState<TabValue>('global');
  const [gameCode, setGameCode] = useState(GAME_ORDER[0]);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['admin', 'ratings', tab, gameCode, page],
    queryFn: () => {
      if (tab === 'global') {
        return ratingService.global(page, 20);
      }
      if (tab === 'season') {
        return ratingService.season(page, 20);
      }
      return ratingService.game(gameCode, page, 20);
    },
  });

  const entries = (query.data?.data ?? []) as LeaderboardEntry[];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Рейтинги"
        subtitle="Общий рейтинг, рейтинги по режимам и сезонные таблицы."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          items={[
            { value: 'global', label: 'Global' },
            { value: 'game', label: 'Games' },
            { value: 'season', label: 'Season' },
          ]}
          value={tab}
          onChange={(value) => {
            setTab(value as TabValue);
            setPage(1);
          }}
          className="w-fit"
        />
        {tab === 'game' && (
          <Select
            className="sm:w-56"
            options={GAME_ORDER.map((code) => ({
              value: code,
              label: GAME_META[code]?.title ?? code,
            }))}
            value={gameCode}
            onChange={(event) => {
              setGameCode(event.target.value);
              setPage(1);
            }}
            aria-label="Игра"
          />
        )}
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Рейтинг пуст"
          description="Матчи ещё не проводились."
        />
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.username}`}
              className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2.5 sm:grid-cols-[48px_1fr_90px_100px_90px]"
            >
              <span className="text-center font-display text-sm font-extrabold text-text-muted">
                {entry.rank}
              </span>
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={entry.username} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {entry.display_name ?? entry.username}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    LVL {entry.level} · @{entry.username}
                  </p>
                </div>
              </div>
              <span className="hidden text-center text-xs text-text-secondary sm:block">
                {entry.matches_played} игр
              </span>
              <span className="hidden text-center text-xs text-text-secondary sm:block">
                {entry.wins}W / {entry.losses}L
              </span>
              <span className="text-right font-display text-sm font-extrabold text-blue">
                {formatNumber(entry.rating)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={query.data?.meta} onPageChange={setPage} />

      <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
        <Trophy className="h-4 w-4 text-gold" />
        Рейтинг рассчитывается сервером. Административные корректировки доступны
        через модуль рейтинга backend.
        <Badge variant="info" className="ml-auto">
          ELO
        </Badge>
      </div>
    </div>
  );
}
