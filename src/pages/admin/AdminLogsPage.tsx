import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { formatDateTime } from '@/utils/format';

type TabValue = 'audit' | 'anti-cheat';

export default function AdminLogsPage() {
  useDocumentTitle('Администрирование: журналы');
  const [tab, setTab] = useState<TabValue>('audit');
  const [page, setPage] = useState(1);

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminService.auditLogs(page, 20),
    enabled: tab === 'audit',
  });
  const antiCheatQuery = useQuery({
    queryKey: ['admin', 'anti-cheat', page],
    queryFn: () => adminService.antiCheatEvents(page, 20),
    enabled: tab === 'anti-cheat',
  });

  const activeQuery = tab === 'audit' ? auditQuery : antiCheatQuery;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Журналы"
        subtitle="Административные действия и подозрительная игровая активность."
      />

      <Tabs
        items={[
          { value: 'audit', label: 'Audit log', count: auditQuery.data?.meta?.total },
          {
            value: 'anti-cheat',
            label: 'Anti-cheat',
            count: antiCheatQuery.data?.meta?.total,
          },
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value as TabValue);
          setPage(1);
        }}
        className="w-fit"
      />

      {activeQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : activeQuery.isError ? (
        <ErrorState
          error={activeQuery.error}
          onRetry={() => activeQuery.refetch()}
        />
      ) : tab === 'audit' ? (
        <div className="space-y-1.5">
          {(auditQuery.data?.data ?? []).map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-border bg-bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {log.action}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {log.admin_username ?? 'system'} · {log.entity_type ?? '—'} ·{' '}
                      {formatDateTime(log.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="info">{log.entity_id?.slice(0, 8) ?? '—'}</Badge>
              </div>
              {Object.keys(log.details).length > 0 && (
                <pre className="mt-2 max-h-28 overflow-auto rounded-lg border border-border bg-bg-secondary p-2 text-[10px] text-text-secondary">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {(auditQuery.data?.data.length ?? 0) === 0 && (
            <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
              Журнал пуст
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {(antiCheatQuery.data?.data ?? []).map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-border bg-bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      event.severity === 'high'
                        ? 'bg-red/10 text-red'
                        : 'bg-gold/10 text-gold'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {event.event_type}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {event.username ?? 'unknown'} · {formatDateTime(event.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={event.severity === 'high' ? 'danger' : 'warning'}
                  >
                    {event.severity}
                  </Badge>
                  <Badge variant={event.resolved ? 'success' : 'default'}>
                    {event.resolved ? (
                      <>
                        <ShieldCheck className="h-3 w-3" /> resolved
                      </>
                    ) : (
                      'unresolved'
                    )}
                  </Badge>
                </div>
              </div>
              {Object.keys(event.details).length > 0 && (
                <pre className="mt-2 max-h-28 overflow-auto rounded-lg border border-border bg-bg-secondary p-2 text-[10px] text-text-secondary">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {(antiCheatQuery.data?.data.length ?? 0) === 0 && (
            <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
              Подозрительной активности не найдено
            </div>
          )}
        </div>
      )}

      <Pagination meta={activeQuery.data?.meta} onPageChange={setPage} />
    </div>
  );
}
