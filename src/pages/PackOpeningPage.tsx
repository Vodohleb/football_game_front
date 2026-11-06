import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Coins,
  PackageOpen,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PlayerCard } from '@/components/cards/PlayerCard';
import { CoinBalance } from '@/components/economy/CoinBalance';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { newIdempotencyKey, packService } from '@/services/packService';
import { notify } from '@/stores/notificationStore';
import { useWalletStore } from '@/stores/walletStore';
import type { PackOpenResult } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatNumber } from '@/utils/format';
import { rarityStyle } from '@/utils/rarity';

export default function PackOpeningPage() {
  const { packId = '' } = useParams();
  useDocumentTitle('Открытие пака');
  const queryClient = useQueryClient();
  const balance = useWalletStore((state) => state.balance);
  const known = useWalletStore((state) => state.known);
  const setBalance = useWalletStore((state) => state.setBalance);
  const [idempotencyKey, setIdempotencyKey] = useState(() => newIdempotencyKey());
  const [result, setResult] = useState<PackOpenResult | null>(null);
  const [opening, setOpening] = useState(false);

  const packQuery = useQuery({
    queryKey: ['packs', packId],
    queryFn: () => packService.detail(packId),
    enabled: Boolean(packId),
  });
  const pack = packQuery.data;

  const openMutation = useMutation({
    mutationFn: () => packService.open(packId, idempotencyKey),
    onMutate: () => {
      setOpening(true);
    },
    onSuccess: (data) => {
      setResult(data);
      setBalance(data.balance);
      setIdempotencyKey(newIdempotencyKey());
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      queryClient.invalidateQueries({ queryKey: ['packs', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      const best = [...data.cards].sort(
        (a, b) => b.card.overall_rating - a.card.overall_rating,
      )[0];
      notify.success(
        'Пак открыт!',
        best
          ? `Лучшая карточка: ${best.card.player_full_name} (${best.card.overall_rating})`
          : undefined,
      );
      window.setTimeout(() => setOpening(false), 900);
    },
    onError: (error) => {
      setOpening(false);
      notify.error('Не удалось открыть пак', errorMessage(error));
    },
  });

  if (packQuery.isLoading) {
    return <LoadingScreen label="Загружаем пак..." />;
  }
  if (packQuery.isError || !pack) {
    return (
      <ErrorState
        error={packQuery.error ?? new Error('Пак не найден')}
        onRetry={() => packQuery.refetch()}
      />
    );
  }

  const enough = !known || balance >= pack.price;
  const topRarity = pack.probabilities
    .slice()
    .sort((a, b) => b.probability - a.probability)[0]?.rarity;
  const accent = topRarity ? rarityStyle(topRarity) : rarityStyle('common');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/app/shop/packs"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад в магазин
        </Link>
        <CoinBalance showLabel />
      </div>

      {!result ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card p-6 text-center">
            <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary/10 blur-3xl" />

            <motion.div
              animate={
                opening
                  ? { rotate: [0, -6, 6, -4, 4, 0], scale: [1, 1.04, 1.06, 1.02, 1] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: opening ? Infinity : 0 }}
              className={`relative flex h-52 w-40 flex-col items-center justify-center rounded-2xl border bg-gradient-to-br ${accent.gradient} shadow-2xl`}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20" />
              <PackageOpen className="h-16 w-16 text-white/90" />
              <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                {pack.name}
              </span>
              <span className="mt-1 text-2xl font-extrabold text-white">
                {pack.cards_count}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-white/50">
                карточек
              </span>
            </motion.div>

            <h1 className="relative mt-6 text-2xl font-extrabold text-text-primary">
              {pack.name}
            </h1>
            <p className="relative mt-1 max-w-md text-sm text-text-secondary">
              {pack.description ?? 'Внутри — карточки футболистов разной редкости.'}
            </p>
            {opening && (
              <p className="relative mt-3 animate-pulse text-sm font-semibold text-accent-primary">
                Вскрываем пак...
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-3xl border border-border bg-bg-card p-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Стоимость
              </p>
              <p className="mt-1 flex items-center gap-2 font-display text-3xl font-extrabold text-gold">
                <Coins className="h-6 w-6" />
                {formatNumber(pack.price)}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-xs">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Wallet className="h-3.5 w-3.5" />
                Баланс
              </span>
              <span className="font-bold text-text-primary">
                {known ? formatNumber(balance) : '—'}
              </span>
            </div>
            <Button
              size="lg"
              fullWidth
              disabled={!enough}
              loading={openMutation.isPending || opening}
              onClick={() => openMutation.mutate()}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              {enough ? 'Открыть пак' : 'Недостаточно монет'}
            </Button>
            {!enough && (
              <p className="text-center text-xs text-red">
                Не хватает {formatNumber(pack.price - balance)} монет. Сыграйте в
                мини-игру или выполните задания.
              </p>
            )}
            <div className="space-y-1.5 border-t border-border pt-4">
              <p className="text-xs font-semibold text-text-primary">
                Редкости в паке
              </p>
              {pack.probabilities.map((probability) => {
                const style = rarityStyle(probability.rarity);
                return (
                  <div
                    key={probability.rarity}
                    className="flex items-center justify-between text-xs"
                  >
                    <Badge className={style.chip}>{style.label}</Badge>
                    <span className="text-text-secondary">
                      {probability.probability}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted">
              Результат и редкость определяются на сервере. Клиент только
              отображает полученные карточки.
            </p>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="text-center">
              <Badge variant="gold" dot>
                Пак открыт
              </Badge>
              <h1 className="mt-2 text-2xl font-extrabold text-text-primary">
                {result.pack_name}
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Потрачено {formatNumber(result.coins_spent)} монет · баланс{' '}
                {formatNumber(result.balance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {result.cards.map((userCard, index) => (
                <motion.div
                  key={userCard.id}
                  initial={{ opacity: 0, y: 30, rotateY: 90 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: 0.15 + index * 0.12, type: 'spring' }}
                >
                  <PlayerCard
                    card={userCard.card}
                    size="sm"
                    badge={
                      <span className="rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white/70">
                        new
                      </span>
                    }
                  />
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                disabled={!enough}
                loading={openMutation.isPending || opening}
                onClick={() => {
                  setResult(null);
                  openMutation.mutate();
                }}
                leftIcon={<PackageOpen className="h-4 w-4" />}
              >
                Открыть ещё за {formatNumber(pack.price)}
              </Button>
              <Link to="/app/shop/packs">
                <Button size="lg" variant="secondary" fullWidth>
                  В магазин
                </Button>
              </Link>
              <Link to="/app/club/collection">
                <Button size="lg" variant="ghost" fullWidth>
                  В коллекцию
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4 text-center text-xs text-text-secondary">
              Все карточки уже добавлены в вашу коллекцию на сервере.
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
