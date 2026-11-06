import { useQuery } from '@tanstack/react-query';
import { Award, CheckCircle2, Coins, Lock, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { achievementService } from '@/services/achievementService';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

type TabValue = 'all' | 'mine';

export default function AchievementsPage() {
  useDocumentTitle('Достижения');
  const [tab, setTab] = useState<TabValue>('all');

  const allQuery = useQuery({
    queryKey: ['achievements'],
    queryFn: achievementService.list,
    staleTime: 5 * 60_000,
  });
  const mineQuery = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: achievementService.mine,
  });

  const unlocked = new Map(
    (mineQuery.data ?? []).map((item) => [item.code, item]),
  );
  const achievements = allQuery.data ?? [];
  const visible =
    tab === 'mine'
      ? achievements.filter((achievement) => unlocked.has(achievement.code))
      : achievements;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Прогресс"
        title="Достижения"
        subtitle="Открывайте достижения за игру, победы и открытие паков. Награды начисляются автоматически."
        actions={
          <Badge variant="gold">
            <Trophy className="h-3.5 w-3.5" />
            {unlocked.size} / {achievements.length}
          </Badge>
        }
      />

      <Tabs
        items={[
          { value: 'all', label: 'Все достижения', count: achievements.length },
          { value: 'mine', label: 'Мои', count: unlocked.size },
        ]}
        value={tab}
        onChange={(value) => setTab(value as TabValue)}
        className="w-fit"
      />

      {allQuery.isLoading || mineQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : allQuery.isError ? (
        <ErrorState error={allQuery.error} onRetry={() => allQuery.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Award className="h-6 w-6" />}
          title="Достижений пока нет"
          description="Сыграйте первую игру, чтобы открыть первое достижение."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((achievement) => {
            const mine = unlocked.get(achievement.code);
            const isUnlocked = Boolean(mine);
            return (
              <div
                key={achievement.code}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-4',
                  isUnlocked
                    ? 'border-gold/35 bg-gradient-to-br from-gold/10 via-bg-card to-bg-card'
                    : 'border-border bg-bg-card',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl border',
                      isUnlocked
                        ? 'border-gold/30 bg-gold/10 text-gold'
                        : 'border-border bg-bg-hover text-text-muted',
                    )}
                  >
                    {isUnlocked ? (
                      <Trophy className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </span>
                  {isUnlocked ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" />
                      Открыто
                    </Badge>
                  ) : (
                    <Badge variant="default">Закрыто</Badge>
                  )}
                </div>
                <h3
                  className={cn(
                    'mt-3 font-display text-base font-bold',
                    isUnlocked ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {achievement.title}
                </h3>
                <p className="mt-1 min-h-9 text-xs text-text-secondary">
                  {achievement.description ?? 'Особое достижение платформы'}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-gold">
                      <Coins className="h-3.5 w-3.5" />
                      {achievement.reward_coins}
                    </span>
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Zap className="h-3.5 w-3.5 text-accent-primary" />
                      {achievement.reward_xp}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {mine
                      ? formatDate(mine.unlocked_at)
                      : `${achievement.condition_type} ${achievement.condition_value}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
        Условия достижений проверяются сервером после игровых событий и
        открытия паков. Награды выдаются через общий Reward Service.
      </div>
    </div>
  );
}
