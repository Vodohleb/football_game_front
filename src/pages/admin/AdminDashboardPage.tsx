import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Coins,
  Gamepad2,
  PackageOpen,
  ShieldAlert,
  Swords,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import type { AnalyticsOverview } from '@/types/api';
import { formatDateTime, formatNumber } from '@/utils/format';

const METRICS: {
  key: keyof AnalyticsOverview;
  label: string;
  icon: typeof Users;
  accent: string;
}[] = [
  { key: 'users_total', label: 'Всего пользователей', icon: Users, accent: 'text-blue' },
  { key: 'users_active', label: 'Активные', icon: Activity, accent: 'text-accent-primary' },
  { key: 'new_users_today', label: 'Новые сегодня', icon: UserPlus, accent: 'text-purple' },
  { key: 'game_sessions_total', label: 'Игровых сессий', icon: Gamepad2, accent: 'text-accent-primary' },
  { key: 'packs_opened_total', label: 'Открыто паков', icon: PackageOpen, accent: 'text-gold' },
  { key: 'coins_total', label: 'Монет в экономике', icon: Coins, accent: 'text-gold' },
  { key: 'pvp_matches_finished', label: 'PvP-матчей', icon: Swords, accent: 'text-blue' },
  { key: 'anti_cheat_events_unresolved', label: 'Античит-событий', icon: ShieldAlert, accent: 'text-red' },
];

export default function AdminDashboardPage() {
  useDocumentTitle('Админ-панель');
  const analyticsQuery = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminService.analytics,
  });
  const logsQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 1],
    queryFn: () => adminService.auditLogs(1, 6),
  });
  const antiCheatQuery = useQuery({
    queryKey: ['admin', 'anti-cheat', 1],
    queryFn: () => adminService.antiCheatEvents(1, 5),
  });

  const analytics = analyticsQuery.data;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Dashboard"
        subtitle="Ключевые показатели платформы, последние действия администраторов и события античита."
      />

      {analyticsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map((metric) => (
            <div
              key={metric.key}
              className="rounded-2xl border border-border bg-bg-card p-4"
            >
              <metric.icon className={`h-5 w-5 ${metric.accent}`} />
              <p className="mt-3 font-display text-2xl font-extrabold text-text-primary">
                {formatNumber(analytics?.[metric.key] ?? 0)}
              </p>
              <p className="mt-0.5 text-[11px] text-text-muted">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <ShieldAlert className="h-4 w-4 text-red" />
              Последние события античита
            </h2>
            <Link
              to="/admin/logs"
              className="flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
            >
              Все журналы
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {antiCheatQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (antiCheatQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">
              Подозрительной активности не зафиксировано.
            </p>
          ) : (
            <div className="space-y-2">
              {antiCheatQuery.data?.data.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-secondary px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        event.severity === 'high' ? 'text-red' : 'text-gold'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-text-primary">
                        {event.event_type}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {event.username ?? 'unknown'} · {formatDateTime(event.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={event.resolved ? 'success' : 'danger'}>
                    {event.resolved ? 'resolved' : event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Activity className="h-4 w-4 text-accent-primary" />
              Последние действия администраторов
            </h2>
            <Link
              to="/admin/logs"
              className="flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
            >
              Все
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {logsQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (logsQuery.data?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">
              Административных действий пока нет.
            </p>
          ) : (
            <div className="space-y-2">
              {logsQuery.data?.data.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border bg-bg-secondary px-3 py-2"
                >
                  <p className="text-xs font-semibold text-text-primary">
                    {log.action}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {log.admin_username ?? 'system'} · {log.entity_type ?? '—'} ·{' '}
                    {formatDateTime(log.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/admin/users', title: 'Пользователи', text: 'Роли, блокировки, статистика' },
          { to: '/admin/economy', title: 'Экономика', text: 'Транзакции и корректировки' },
          { to: '/admin/packs', title: 'Паки', text: 'Цены и вероятности' },
          { to: '/admin/questions', title: 'Игровой контент', text: 'Вопросы и сложность' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-2xl border border-border bg-bg-card p-4 transition-colors hover:border-accent-primary/40"
          >
            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
            <p className="mt-1 text-xs text-text-secondary">{item.text}</p>
            <ArrowRight className="mt-3 h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
