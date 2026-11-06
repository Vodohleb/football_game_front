import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, Coins, Gift, Zap } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { questService } from '@/services/questService';
import { notify } from '@/stores/notificationStore';
import { useWalletStore } from '@/stores/walletStore';
import type { Quest } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';

type TabValue = 'daily' | 'weekly' | 'history';

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Доступно',
  IN_PROGRESS: 'В процессе',
  COMPLETED: 'Выполнено',
  CLAIMED: 'Получено',
  EXPIRED: 'Истекло',
};

function QuestCard({
  quest,
  onClaim,
  claiming,
  showClaim = true,
}: {
  quest: Quest;
  onClaim: (id: string) => void;
  claiming: boolean;
  showClaim?: boolean;
}) {
  const percent = Math.min(100, (quest.progress / quest.target_value) * 100);
  const completed = quest.status === 'COMPLETED';
  const claimed = quest.status === 'CLAIMED';
  return (
    <motion.div
      layout
      className={`rounded-2xl border bg-bg-card p-4 ${
        completed
          ? 'border-accent-primary/35'
          : claimed
            ? 'border-border opacity-70'
            : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">
              {quest.title}
            </h3>
            <Badge
              variant={
                completed
                  ? 'success'
                  : claimed
                    ? 'default'
                    : quest.status === 'IN_PROGRESS'
                      ? 'info'
                      : 'warning'
              }
            >
              {STATUS_LABELS[quest.status] ?? quest.status}
            </Badge>
          </div>
          {quest.description && (
            <p className="mt-1 text-xs text-text-secondary">
              {quest.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
          <span className="flex items-center gap-1 font-bold text-gold">
            <Coins className="h-3.5 w-3.5" />
            {quest.reward_coins}
          </span>
          <span className="flex items-center gap-1 text-text-secondary">
            <Zap className="h-3 w-3 text-accent-primary" />
            {quest.reward_xp} XP
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={percent} max={100} className="flex-1" />
        <span className="w-16 text-right text-[11px] tabular-nums text-text-secondary">
          {Math.min(quest.progress, quest.target_value)}/{quest.target_value}
        </span>
      </div>

      {(completed || claimed) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-[11px] text-text-muted">
            {claimed
              ? `Получено ${quest.claimed_at ? formatDate(quest.claimed_at) : ''}`
              : `Выполнено ${quest.completed_at ? formatDate(quest.completed_at) : ''}`}
          </span>
          {completed && showClaim && (
            <Button
              size="sm"
              variant="gold"
              loading={claiming}
              onClick={() => onClaim(quest.user_quest_id)}
              leftIcon={<Gift className="h-3.5 w-3.5" />}
            >
              Забрать награду
            </Button>
          )}
          {claimed && (
            <span className="flex items-center gap-1 text-xs font-semibold text-accent-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Награда получена
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function QuestsPage() {
  useDocumentTitle('Задания');
  const queryClient = useQueryClient();
  const setBalance = useWalletStore((state) => state.setBalance);
  const [tab, setTab] = useState<TabValue>('daily');
  const [historyPage, setHistoryPage] = useState(1);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const dailyQuery = useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: questService.daily,
    enabled: tab === 'daily',
  });
  const weeklyQuery = useQuery({
    queryKey: ['quests', 'weekly'],
    queryFn: questService.weekly,
    enabled: tab === 'weekly',
  });
  const historyQuery = useQuery({
    queryKey: ['quests', 'history', historyPage],
    queryFn: () => questService.history(historyPage, 20),
    enabled: tab === 'history',
  });

  const claimMutation = useMutation({
    mutationFn: (id: string) => {
      setClaimingId(id);
      return questService.claim(id);
    },
    onSuccess: (data) => {
      setBalance(useWalletStore.getState().balance + data.coins_earned);
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['economy'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      notify.success(
        'Награда получена!',
        `+${data.coins_earned} монет · +${data.xp_earned} XP`,
      );
    },
    onError: (error) => notify.error('Не удалось получить награду', errorMessage(error)),
    onSettled: () => setClaimingId(null),
  });

  const activeQuery =
    tab === 'daily' ? dailyQuery : tab === 'weekly' ? weeklyQuery : historyQuery;
  const quests = activeQuery.data?.data ?? [];
  const completedCount = quests.filter(
    (quest) => quest.status === 'COMPLETED',
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Прогресс"
        title="Ежедневные задания"
        subtitle="Выполняйте задания, забирайте монеты и опыт. Награду можно получить только один раз."
        actions={
          <Badge variant="success">
            {completedCount} готово к получению
          </Badge>
        }
      />

      <Tabs
        items={[
          { value: 'daily', label: 'Ежедневные' },
          { value: 'weekly', label: 'Еженедельные' },
          { value: 'history', label: 'История' },
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value as TabValue);
        }}
        scrollable
        className="w-fit max-w-full"
      />

      {activeQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : activeQuery.isError ? (
        <ErrorState
          error={activeQuery.error}
          onRetry={() => activeQuery.refetch()}
        />
      ) : quests.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title={
            tab === 'history' ? 'История пуста' : 'Заданий пока нет'
          }
          description={
            tab === 'history'
              ? 'Полученные и истёкшие задания появятся здесь.'
              : 'Задания обновляются по расписанию платформы. Загляните позже.'
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {quests.map((quest) => (
              <QuestCard
                key={quest.user_quest_id}
                quest={quest}
                onClaim={(id) => claimMutation.mutate(id)}
                claiming={claimingId === quest.user_quest_id}
                showClaim={tab !== 'history'}
              />
            ))}
          </div>
          {tab === 'history' && (
            <Pagination
              meta={activeQuery.data?.meta}
              onPageChange={setHistoryPage}
            />
          )}
        </>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-bg-card p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Gift className="h-5 w-5" />
        </span>
        <div className="text-xs text-text-secondary">
          <p className="text-sm font-semibold text-text-primary">
            Награды начисляются на сервере
          </p>
          <p className="mt-1">
            Прогресс обновляется после игровых действий и открытия паков.
            Баланс монет и XP синхронизируются с сервером после получения
            награды.
          </p>
        </div>
      </div>
    </div>
  );
}
