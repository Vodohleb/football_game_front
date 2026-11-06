import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Coins, Search, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { notify } from '@/stores/notificationStore';
import { errorMessage } from '@/utils/errors';
import { formatDateTime, formatNumber, titleCase } from '@/utils/format';

export default function AdminEconomyPage() {
  useDocumentTitle('Администрирование: экономика');
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlUserId = searchParams.get('user_id') ?? '';
  const [page, setPage] = useState(1);
  const [filterUserId, setFilterUserId] = useState(urlUserId);
  const [appliedUserId, setAppliedUserId] = useState(urlUserId);
  const [adjustUserId, setAdjustUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const transactionsQuery = useQuery({
    queryKey: ['admin', 'transactions', page, appliedUserId],
    queryFn: () =>
      adminService.transactions(
        page,
        20,
        appliedUserId || undefined,
      ),
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      adminService.adjustBalance({
        user_id: adjustUserId.trim(),
        amount: Number.parseInt(amount, 10),
        reason: reason.trim(),
        idempotency_key: `admin-${Date.now()}`,
      }),
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
      notify.success(
        'Баланс изменён',
        `${transaction.username}: ${transaction.amount >= 0 ? '+' : ''}${transaction.amount}`,
      );
      setAmount('');
      setReason('');
    },
    onError: (error) => notify.error('Не удалось изменить баланс', errorMessage(error)),
  });

  const transactions = transactionsQuery.data?.data ?? [];
  const parsedAmount = Number.parseInt(amount, 10);
  const valid =
    adjustUserId.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount !== 0 &&
    reason.trim().length >= 3;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Экономика"
        subtitle="История транзакций, корректировки баланса и контроль денежного оборота."
      />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">
                Корректировка баланса
              </p>
              <p className="text-[11px] text-text-muted">
                Положительная сумма — начисление
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Input
              label="ID пользователя"
              value={adjustUserId}
              onChange={(event) => setAdjustUserId(event.target.value)}
              placeholder="UUID"
            />
            <Input
              label="Сумма"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Например, 500 или -100"
            />
            <Input
              label="Причина"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Минимум 3 символа"
            />
            <Button
              fullWidth
              onClick={() => adjustMutation.mutate()}
              loading={adjustMutation.isPending}
              disabled={!valid}
              leftIcon={<Coins className="h-4 w-4" />}
            >
              Применить
            </Button>
            <p className="text-[11px] text-text-muted">
              Операция фиксируется в audit-логе и создаёт запись
              ADMIN_ADJUSTMENT.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-bg-card p-3 sm:flex-row">
            <Input
              placeholder="Фильтр по user_id"
              value={filterUserId}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => setFilterUserId(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setAppliedUserId(filterUserId.trim());
                setPage(1);
              }}
            >
              Применить
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setAppliedUserId('');
                setFilterUserId('');
                setPage(1);
              }}
            >
              Сброс
            </Button>
          </div>

          {transactionsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
          ) : transactionsQuery.isError ? (
            <ErrorState
              error={transactionsQuery.error}
              onRetry={() => transactionsQuery.refetch()}
            />
          ) : (
            <div className="space-y-1.5">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        transaction.amount >= 0
                          ? 'bg-accent-primary/10 text-accent-primary'
                          : 'bg-red/10 text-red'
                      }`}
                    >
                      {transaction.amount >= 0 ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {transaction.username}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">
                        {titleCase(transaction.type)} ·{' '}
                        {transaction.description ?? '—'} ·{' '}
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        transaction.amount >= 0
                          ? 'text-accent-primary'
                          : 'text-red'
                      }`}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      {formatNumber(transaction.amount)}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {formatNumber(transaction.balance_after)}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
                  Транзакции не найдены
                </div>
              )}
            </div>
          )}
          <Pagination
            meta={transactionsQuery.data?.meta}
            onPageChange={setPage}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {[
          'GAME_REWARD',
          'PACK_PURCHASE',
          'DAILY_QUEST_REWARD',
          'ACHIEVEMENT_REWARD',
          'ADMIN_ADJUSTMENT',
          'REFUND',
        ].map((type) => (
          <Badge key={type} variant="default">
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}
