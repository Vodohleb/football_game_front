import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Search, Shield, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { notify } from '@/stores/notificationStore';
import type { AdminUser } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/format';

export default function AdminUsersPage() {
  useDocumentTitle('Администрирование: пользователи');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('active');
  const [verified, setVerified] = useState(false);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page, debouncedSearch],
    queryFn: () => adminService.users(debouncedSearch, page, 20),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminService.updateUser(selected?.id ?? '', {
        role,
        status,
        email_verified: verified,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      notify.success('Пользователь обновлён');
      setSelected(null);
    },
    onError: (error) => notify.error('Не удалось обновить пользователя', errorMessage(error)),
  });

  const openUser = (user: AdminUser) => {
    setSelected(user);
    setRole(user.role);
    setStatus(user.status);
    setVerified(user.email_verified);
  };

  const users = usersQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Пользователи"
        subtitle="Поиск, роли, блокировки и статус подтверждения email."
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Поиск по username или email..."
          value={search}
          leftIcon={<Search className="h-4 w-4" />}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Badge variant="info">{usersQuery.data?.meta?.total ?? 0} пользователей</Badge>
      </div>

      {usersQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <ErrorState error={usersQuery.error} onRetry={() => usersQuery.refetch()} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="hidden grid-cols-[1.4fr_1fr_80px_90px_100px_80px] gap-2 border-b border-border bg-bg-secondary px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-text-muted md:grid">
            <span>Пользователь</span>
            <span>Email</span>
            <span>Роль</span>
            <span>Статус</span>
            <span>Регистрация</span>
            <span />
          </div>
          {users.map((user) => (
            <div
              key={user.id}
              className="grid gap-2 border-b border-border bg-bg-card px-4 py-3 last:border-0 md:grid-cols-[1.4fr_1fr_80px_90px_100px_80px] md:items-center"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={user.username} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {user.username}
                  </p>
                  <p className="truncate text-[10px] text-text-muted md:hidden">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {user.email_verified ? 'email verified' : 'email not verified'}
                  </p>
                </div>
              </div>
              <p className="hidden truncate text-xs text-text-secondary md:block">
                {user.email}
              </p>
              <div>
                <Badge variant={user.role === 'user' ? 'default' : 'gold'}>
                  {user.role}
                </Badge>
              </div>
              <div>
                <Badge
                  variant={
                    user.status === 'active'
                      ? 'success'
                      : user.status === 'blocked'
                        ? 'danger'
                        : 'default'
                  }
                >
                  {user.status}
                </Badge>
              </div>
              <p className="hidden text-[11px] text-text-muted md:block">
                {formatDateTime(user.created_at)}
              </p>
              <Button size="sm" variant="secondary" onClick={() => openUser(user)}>
                Открыть
              </Button>
            </div>
          ))}
          {users.length === 0 && (
            <div className="bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
              Пользователи не найдены
            </div>
          )}
        </div>
      )}

      <Pagination
        meta={usersQuery.data?.meta}
        onPageChange={setPage}
      />

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Пользователь ${selected.username}` : ''}
        description={selected?.email}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Отмена
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              loading={updateMutation.isPending}
            >
              Сохранить
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary p-3">
              <Avatar name={selected.username} size="lg" />
              <div className="text-xs text-text-secondary">
                <p className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                  <UserRound className="h-4 w-4" />
                  {selected.username}
                </p>
                <p className="mt-1">ID: {selected.id}</p>
                <p>Последний вход: {formatDateTime(selected.last_login_at)}</p>
              </div>
            </div>
            <Select
              label="Роль"
              options={[
                { value: 'user', label: 'USER' },
                { value: 'admin', label: 'ADMIN' },
                { value: 'superadmin', label: 'SUPERADMIN' },
              ]}
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
            <Select
              label="Статус"
              options={[
                { value: 'active', label: 'ACTIVE' },
                { value: 'blocked', label: 'BLOCKED' },
                { value: 'deleted', label: 'DELETED' },
              ]}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary">
              Email подтверждён
              <input
                type="checkbox"
                checked={verified}
                onChange={(event) => setVerified(event.target.checked)}
                className="h-4 w-4 accent-accent-primary"
              />
            </label>
            <div className="flex items-start gap-2 rounded-xl border border-gold/25 bg-gold/5 p-3 text-[11px] text-gold">
              <Shield className="mt-0.5 h-4 w-4 shrink-0" />
              Блокировка аккаунта запрещает авторизацию. Все административные
              изменения фиксируются в audit-логе.
            </div>
            <Link
              to={`/app/users/${selected.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/40"
            >
              Открыть публичный профиль
              <ExternalLink className="h-4 w-4 text-text-muted" />
            </Link>
            <Link
              to={`/admin/economy?user_id=${selected.id}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary/40"
            >
              Транзакции пользователя
              <ExternalLink className="h-4 w-4 text-text-muted" />
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
}
