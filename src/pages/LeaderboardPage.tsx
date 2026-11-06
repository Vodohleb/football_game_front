import { useQuery } from '@tanstack/react-query';
import { Crown, Medal, Trophy } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { GAME_META, GAME_ORDER } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ratingService } from '@/services/ratingService';
import { useAuthStore } from '@/stores/authStore';
import type { LeaderboardEntry, WeeklyLeaderboardEntry } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';
import { leagueForRating } from '@/utils/league';

type TabValue = 'global' | 'games' | 'weekly' | 'season';

export default function LeaderboardPage() {
  useDocumentTitle('Таблица лидеров');
  const username = useAuthStore((state) => state.user?.username);
  const [tab, setTab] = useState<TabValue>('global');
  const [page, setPage] = useState(1);
  const [gameCode, setGameCode] = useState(GAME_ORDER[0]);

  const { data: myRating } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });

  const globalQuery = useQuery({
    queryKey: ['leaderboard', 'global', page],
    queryFn: () => ratingService.global(page, 20),
    enabled: tab === 'global',
  });
  const seasonQuery = useQuery({
    queryKey: ['leaderboard', 'season', page],
    queryFn: () => ratingService.season(page, 20),
    enabled: tab === 'season',
  });
  const weeklyQuery = useQuery({
    queryKey: ['leaderboard', 'weekly', page],
    queryFn: () => ratingService.weekly(page, 20),
    enabled: tab === 'weekly',
  });
  const gameQuery = useQuery({
    queryKey: ['leaderboard', 'game', gameCode, page],
    queryFn: () => ratingService.game(gameCode, page, 20),
    enabled: tab === 'games',
  });

  const activeQuery =
    tab === 'global'
      ? globalQuery
      : tab === 'season'
        ? seasonQuery
        : tab === 'weekly'
          ? weeklyQuery
          : gameQuery;
  const entries = activeQuery.data?.data ?? [];
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;
  const refetch = activeQuery.refetch;

  const changeTab = (value: TabValue) => {
    setTab(value);
    setPage(1);
  };

  const renderGlobalRow = (entry: LeaderboardEntry) => {
    const isMe = entry.username === username;
    return (
      <div
        key={`${entry.rank}-${entry.username}`}
        className={cn(
          'grid grid-cols-[40px_1fr_auto_auto] items-center gap-2 rounded-xl border px-3 py-2.5 sm:grid-cols-[48px_1fr_80px_90px_80px]',
          isMe
            ? 'border-accent-primary/40 bg-accent-primary/10'
            : 'border-border bg-bg-card',
        )}
      >
        <span
          className={cn(
            'text-center font-display text-sm font-extrabold',
            entry.rank === 1
              ? 'text-gold'
              : entry.rank <= 3
                ? 'text-text-primary'
                : 'text-text-muted',
          )}
        >
          {entry.rank}
        </span>
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={entry.username} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {entry.display_name ?? entry.username}
              {isMe && (
                <span className="ml-2 text-[10px] font-bold uppercase text-accent-primary">
                  Вы
                </span>
              )}
            </p>
            <p className="flex items-center gap-2 text-[10px] text-text-muted">
              <span>LVL {entry.level}</span>
              <span>·</span>
              <span>{leagueForRating(entry.rating).name}</span>
              <span>·</span>
              <span>{entry.matches_played} матчей</span>
            </p>
          </div>
        </div>
        <span className="hidden text-center text-xs text-text-secondary sm:block">
          {entry.wins}W / {entry.losses}L
        </span>
        <span className="hidden text-center text-xs text-text-secondary sm:block">
          {Math.round(entry.win_rate * 100)}%
        </span>
        <span className="text-right font-display text-base font-extrabold text-blue">
          {formatNumber(entry.rating)}
        </span>
      </div>
    );
  };

  const renderWeeklyRow = (entry: WeeklyLeaderboardEntry) => {
    const isMe = entry.username === username;
    return (
      <div
        key={`${entry.rank}-${entry.username}`}
        className={cn(
          'grid grid-cols-[40px_1fr_auto_auto] items-center gap-2 rounded-xl border px-3 py-2.5 sm:grid-cols-[48px_1fr_100px_90px]',
          isMe
            ? 'border-accent-primary/40 bg-accent-primary/10'
            : 'border-border bg-bg-card',
        )}
      >
        <span className="text-center font-display text-sm font-extrabold text-text-muted">
          {entry.rank}
        </span>
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={entry.username} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {entry.display_name ?? entry.username}
              {isMe && (
                <span className="ml-2 text-[10px] font-bold uppercase text-accent-primary">
                  Вы
                </span>
              )}
            </p>
            <p className="text-[10px] text-text-muted">
              LVL {entry.level} · {entry.matches} матчей
            </p>
          </div>
        </div>
        <span
          className={cn(
            'text-center text-sm font-bold',
            entry.rating_delta >= 0 ? 'text-accent-primary' : 'text-red',
          )}
        >
          {entry.rating_delta >= 0 ? '+' : ''}
          {entry.rating_delta}
        </span>
        <Badge variant="info" className="justify-center">
          Weekly
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Рейтинг"
        title="Таблица лидеров"
        subtitle="Общий рейтинг, рейтинги по режимам, недельные результаты и текущий сезон."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-text-muted">
            <Trophy className="h-3.5 w-3.5 text-blue" />
            Мой рейтинг
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-text-primary">
            {formatNumber(myRating?.global_rating)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-text-muted">
            <Crown className="h-3.5 w-3.5 text-gold" />
            Глобальная позиция
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-text-primary">
            #{myRating?.global_rank ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-text-muted">
            <Medal className="h-3.5 w-3.5 text-purple" />
            Недельный прирост
          </p>
          <p
            className={cn(
              'mt-1 font-display text-2xl font-extrabold',
              (myRating?.weekly_delta ?? 0) >= 0
                ? 'text-accent-primary'
                : 'text-red',
            )}
          >
            {(myRating?.weekly_delta ?? 0) >= 0 ? '+' : ''}
            {myRating?.weekly_delta ?? 0}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          items={[
            { value: 'global', label: 'Global' },
            { value: 'games', label: 'Games' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'season', label: 'Season' },
          ]}
          value={tab}
          onChange={(value) => changeTab(value as TabValue)}
          scrollable
        />
        {tab === 'games' && (
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

      {myRating?.season && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-xs text-text-secondary">
          <span>
            Сезон: <span className="font-semibold text-text-primary">{myRating.season.name}</span>
          </span>
          <span>
            Сезонная позиция:{' '}
            <span className="font-semibold text-text-primary">
              #{myRating.season_rank ?? '—'}
            </span>
          </span>
          <span>
            Матчей: {myRating.matches_played} · побед: {myRating.wins} · поражений:{' '}
            {myRating.losses}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Рейтинг пока пуст"
          description="Сыграйте PvP-матч или мини-игру, чтобы появиться в таблице."
        />
      ) : (
        <div className="space-y-1.5">
          <div className="hidden grid-cols-[48px_1fr_80px_90px_80px] gap-2 px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-text-muted sm:grid">
            <span className="text-center">#</span>
            <span>Игрок</span>
            <span className="text-center">W/L</span>
            <span className="text-center">Win rate</span>
            <span className="text-right">Rating</span>
          </div>
          {tab === 'weekly'
            ? (entries as WeeklyLeaderboardEntry[]).map(renderWeeklyRow)
            : (entries as LeaderboardEntry[]).map(renderGlobalRow)}
          <Pagination meta={activeQuery.data?.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
