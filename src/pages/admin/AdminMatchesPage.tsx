import { useQuery } from '@tanstack/react-query';
import { Activity, Gamepad2, Swords, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { formatNumber } from '@/utils/format';

export default function AdminMatchesPage() {
  useDocumentTitle('Администрирование: матчи');
  const analyticsQuery = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminService.analytics,
  });
  const analytics = analyticsQuery.data;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Матчи и сессии"
        subtitle="Сводные показатели игровых сессий и PvP-матчей."
      />

      {analyticsQuery.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <Gamepad2 className="h-5 w-5 text-accent-primary" />
            <p className="mt-2 font-display text-2xl font-extrabold text-text-primary">
              {formatNumber(analytics?.game_sessions_total ?? 0)}
            </p>
            <p className="text-[11px] text-text-muted">Всего сессий</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <Activity className="h-5 w-5 text-blue" />
            <p className="mt-2 font-display text-2xl font-extrabold text-text-primary">
              {formatNumber(analytics?.active_sessions ?? 0)}
            </p>
            <p className="text-[11px] text-text-muted">Активных сейчас</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <Swords className="h-5 w-5 text-purple" />
            <p className="mt-2 font-display text-2xl font-extrabold text-text-primary">
              {formatNumber(analytics?.pvp_matches_finished ?? 0)}
            </p>
            <p className="text-[11px] text-text-muted">Завершено PvP-матчей</p>
          </div>
        </div>
      )}

      <EmptyState
        icon={<Trophy className="h-6 w-6" />}
        title="Детальный журнал матчей"
        description="Текущая версия backend не предоставляет отдельный административный эндпоинт списка матчей. Сводная статистика доступна в Dashboard, а события античита — в журналах."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/logs">
              <Button variant="secondary">Журналы</Button>
            </Link>
            <Link to="/admin">
              <Button>Dashboard</Button>
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
        <Badge variant="info">API</Badge>
        PvP-матчи создаются через модуль PvP и хранятся в pvp_matches; результаты
        обновляют рейтинг через ELO-сервис.
      </div>
    </div>
  );
}
