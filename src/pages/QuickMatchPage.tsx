import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Radio, Search, Swords, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GameIcon } from '@/components/games/GameIcon';
import { RatingBadge } from '@/components/economy/RatingBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { PVP_GAMES } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pvpService } from '@/services/pvpService';
import { ratingService } from '@/services/ratingService';
import { notify } from '@/stores/notificationStore';
import { usePvpStore } from '@/stores/pvpStore';
import { errorMessage } from '@/utils/errors';
import { formatNumber } from '@/utils/format';

type Phase = 'idle' | 'searching' | 'matched';

export default function QuickMatchPage() {
  useDocumentTitle('Quick Match');
  const navigate = useNavigate();
  const setLastRoom = usePvpStore((state) => state.setLastRoom);
  const [gameCode, setGameCode] = useState('pvp_penalty');
  const [phase, setPhase] = useState<Phase>('idle');

  const { data: myRating } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });

  const startMutation = useMutation({
    mutationFn: () => pvpService.quickMatch(gameCode),
    onSuccess: (data) => {
      if (data.matched && data.room_id) {
        setPhase('matched');
        setLastRoom(data.room_id, gameCode);
        notify.success('Соперник найден!', data.opponent_username ?? undefined);
        navigate(`/app/competitions/rooms/${data.room_id}`);
      } else {
        setPhase('searching');
      }
    },
    onError: (error) => {
      setPhase('idle');
      notify.error('Не удалось начать поиск', errorMessage(error));
    },
  });

  const statusQuery = useQuery({
    queryKey: ['pvp', 'quick-match', gameCode],
    queryFn: () => pvpService.quickMatchStatus(gameCode),
    enabled: phase === 'searching',
    refetchInterval: 2000,
  });

  useEffect(() => {
    const data = statusQuery.data;
    if (phase === 'searching' && data?.matched && data.room_id) {
      setPhase('matched');
      setLastRoom(data.room_id, gameCode);
      notify.success('Соперник найден!', data.opponent_username ?? undefined);
      navigate(`/app/competitions/rooms/${data.room_id}`);
    }
  }, [statusQuery.data, phase, gameCode, navigate, setLastRoom]);

  const cancelMutation = useMutation({
    mutationFn: () => pvpService.cancelQuickMatch(gameCode),
    onSuccess: () => {
      setPhase('idle');
      notify.info('Поиск отменён');
    },
    onError: (error) => notify.error('Не удалось отменить поиск', errorMessage(error)),
  });

  const status = statusQuery.data;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Соревнования"
        title="Quick Match"
        subtitle="Подберём соперника с близким рейтингом и автоматически создадим матч."
        actions={
          <RatingBadge
            rating={myRating?.global_rating}
            rank={myRating?.global_rank}
          />
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card p-6 text-center">
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary/10 blur-3xl" />

          <AnimatePresence mode="wait">
            {phase === 'searching' ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-accent-primary/30 bg-accent-primary/10">
                  <span className="absolute inset-0 animate-ping rounded-full border border-accent-primary/30" />
                  <Search className="h-12 w-12 text-accent-primary" />
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-text-primary">
                  Ищем соперника...
                </h2>
                <p className="mt-2 max-w-sm text-sm text-text-secondary">
                  {status?.queue_position
                    ? `Позиция в очереди: ${status.queue_position}`
                    : 'Подбираем игрока с близким рейтингом'}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-accent-primary" />
                  {status?.waiting_seconds
                    ? `${status.waiting_seconds} сек в поиске`
                    : 'Ожидание...'}
                </div>
                <Button
                  className="mt-6"
                  variant="danger"
                  onClick={() => cancelMutation.mutate()}
                  loading={cancelMutation.isPending}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Отменить поиск
                </Button>
              </motion.div>
            ) : phase === 'matched' ? (
              <motion.div
                key="matched"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accent-primary/40 bg-accent-primary/15 text-accent-primary animate-pulse-ring">
                  <Swords className="h-10 w-10" />
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-text-primary">
                  Соперник найден!
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Переходим в комнату матча...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative flex flex-col items-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                  <Swords className="h-11 w-11" />
                </div>
                <h2 className="mt-6 text-2xl font-extrabold text-text-primary">
                  Готовы к матчу?
                </h2>
                <p className="mt-2 max-w-sm text-sm text-text-secondary">
                  Выберите режим и нажмите «Найти соперника». Поиск можно
                  отменить в любой момент.
                </p>
                <Button
                  size="lg"
                  className="mt-6"
                  loading={startMutation.isPending}
                  onClick={() => startMutation.mutate()}
                  leftIcon={<Search className="h-4 w-4" />}
                >
                  Найти соперника
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-text-primary">
              Режим
            </p>
            <div className="space-y-2">
              {PVP_GAMES.map((game) => (
                <button
                  key={game.value}
                  type="button"
                  disabled={phase === 'searching'}
                  onClick={() => setGameCode(game.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    gameCode === game.value
                      ? 'border-accent-primary/40 bg-accent-primary/10'
                      : 'border-border bg-bg-secondary hover:border-[#3a4b5e]'
                  }`}
                >
                  <GameIcon code={game.value} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">
                      {game.label}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {game.value === 'pvp_penalty'
                        ? '5 раундов пенальти'
                        : '5 вопросов викторины'}
                    </p>
                  </div>
                  {gameCode === game.value && (
                    <Badge variant="success">Выбрано</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-5 text-sm">
            <p className="font-semibold text-text-primary">Ваш рейтинг</p>
            <div className="mt-2 flex items-center justify-between">
              <RatingBadge
                rating={myRating?.global_rating}
                rank={myRating?.global_rank}
              />
              <span className="text-xs text-text-muted">
                {formatNumber(myRating?.matches_played ?? 0)} матчей
              </span>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              После матча рейтинг изменится по системе ELO. Победа приносит
              больше, чем поражение отнимает у более сильного соперника.
            </p>
          </div>

          <Link to="/app/competitions/rooms">
            <Button variant="secondary" fullWidth>
              Играть с другом по коду
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
