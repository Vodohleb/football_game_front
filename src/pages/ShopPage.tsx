import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Archive,
  ArrowRight,
  Coins,
  History,
  PackageOpen,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CoinBalance } from '@/components/economy/CoinBalance';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { packService } from '@/services/packService';
import { useWalletStore } from '@/stores/walletStore';
import type { Pack, PackProbability } from '@/types/api';
import { formatDateTime, formatNumber } from '@/utils/format';
import { rarityStyle } from '@/utils/rarity';

function PackArt({ pack }: { pack: Pack }) {
  const accent =
    pack.code === 'legend'
      ? 'from-rose-500/40 via-fuchsia-900/30 to-bg-card'
      : pack.code === 'gold'
        ? 'from-amber-500/40 via-yellow-900/30 to-bg-card'
        : 'from-blue-500/30 via-slate-800/40 to-bg-card';
  const Glow = pack.code === 'legend' ? Sparkles : PackageOpen;

  return (
    <div
      className={`relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${accent}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
      <div className="relative flex h-24 w-20 flex-col items-center justify-center rounded-xl border border-white/20 bg-black/25 shadow-2xl backdrop-blur">
        <Glow className="h-9 w-9 text-white/80" />
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
          {pack.cards_count} cards
        </span>
      </div>
      <Badge className="absolute left-3 top-3" variant="default">
        {pack.code}
      </Badge>
    </div>
  );
}

function ProbabilityRow({ probability }: { probability: PackProbability }) {
  const style = rarityStyle(probability.rarity);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[10px] font-semibold text-text-secondary">
        {style.label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-hover">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, probability.probability)}%`,
            background: 'linear-gradient(90deg, #20a974, #42d392)',
          }}
        />
      </div>
      <span className="w-11 text-right text-[10px] tabular-nums text-text-muted">
        {probability.probability}%
      </span>
    </div>
  );
}

export default function ShopPage() {
  useDocumentTitle('Магазин паков');
  const navigate = useNavigate();
  const balance = useWalletStore((state) => state.balance);
  const known = useWalletStore((state) => state.known);
  const [tab, setTab] = useState<'packs' | 'history'>('packs');
  const [historyPage, setHistoryPage] = useState(1);

  const packsQuery = useQuery({
    queryKey: ['packs', 1],
    queryFn: () => packService.list(1, 20),
  });
  const historyQuery = useQuery({
    queryKey: ['packs', 'history', historyPage],
    queryFn: () => packService.history(historyPage, 10),
    enabled: tab === 'history',
  });

  const packs = packsQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Магазин"
        title="Паки карточек"
        subtitle="Открывайте паки и усильте коллекцию. Вероятности редкостей указаны для каждого пака."
        actions={<CoinBalance showLabel size="lg" />}
      />

      <Tabs
        items={[
          { value: 'packs', label: 'Паки', count: packs.length },
          { value: 'history', label: 'История' },
        ]}
        value={tab}
        onChange={(value) => setTab(value as 'packs' | 'history')}
        className="w-fit"
      />

      {tab === 'packs' ? (
        packsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-96" />
            ))}
          </div>
        ) : packsQuery.isError ? (
          <ErrorState error={packsQuery.error} onRetry={() => packsQuery.refetch()} />
        ) : packs.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Паков пока нет"
            description="Администратор ещё не добавил паки. Загляните позже."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack, index) => {
              const enough = !known || balance >= pack.price;
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col rounded-2xl border border-border bg-bg-card p-4"
                >
                  <PackArt pack={pack} />
                  <div className="mt-4 flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-display text-lg font-bold text-text-primary">
                        {pack.name}
                      </h2>
                      <p className="mt-1 text-xs text-text-secondary">
                        {pack.description ?? 'Случайный набор карточек'}
                      </p>
                    </div>
                    <Badge variant="info">{pack.cards_count} карт</Badge>
                  </div>

                  <div className="mt-4 space-y-1.5 rounded-xl border border-border bg-bg-secondary p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-text-muted">
                      <Sparkles className="h-3 w-3" />
                      Вероятности
                    </p>
                    {pack.probabilities.map((probability) => (
                      <ProbabilityRow
                        key={probability.rarity}
                        probability={probability}
                      />
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
                    <span className="flex items-center gap-1.5 text-base font-bold text-gold">
                      <Coins className="h-4 w-4" />
                      {formatNumber(pack.price)}
                    </span>
                    <Button
                      size="sm"
                      disabled={!enough}
                      onClick={() => navigate(`/app/shop/opening/${pack.id}`)}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      {enough ? 'Открыть' : 'Не хватает'}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      ) : historyQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      ) : historyQuery.isError ? (
        <ErrorState
          error={historyQuery.error}
          onRetry={() => historyQuery.refetch()}
        />
      ) : (historyQuery.data?.data.length ?? 0) === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="История пуста"
          description="Откройте первый пак, и он появится здесь."
          action={
            <Button onClick={() => setTab('packs')} leftIcon={<Archive className="h-4 w-4" />}>
              К пакам
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {historyQuery.data?.data.map((opening) => (
              <div
                key={opening.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <PackageOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {opening.pack_name}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {formatDateTime(opening.created_at)} · {opening.cards.length} карточек
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-red">−{formatNumber(opening.coins_spent)}</span>
                  <span className="text-text-secondary">
                    Баланс: {formatNumber(opening.balance_after)}
                  </span>
                  <Link
                    to={`/app/shop/opening/${opening.pack_id}`}
                    className="font-semibold text-accent-primary hover:underline"
                  >
                    Повторить
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            meta={historyQuery.data?.meta}
            onPageChange={setHistoryPage}
          />
        </>
      )}
    </div>
  );
}
