import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Copy,
  Swords,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { GameIcon } from '@/components/games/GameIcon';
import { RatingBadge } from '@/components/economy/RatingBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { PVP_GAMES } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ratingService } from '@/services/ratingService';
import { usePvpStore } from '@/stores/pvpStore';
import { formatNumber } from '@/utils/format';

const MODES = [
  {
    value: 'pvp_penalty',
    title: 'Penalty PvP',
    description:
      'Пять раундов пенальти против живого соперника. Каждый выбирает сектор — вратарь решает исход.',
    icon: 'pvp_penalty',
    accent: 'from-rose-500/20 via-bg-card to-bg-card',
  },
  {
    value: 'pvp_quiz',
    title: 'Football Quiz PvP',
    description:
      'Пять вопросов о клубах футболистов. Отвечайте быстрее и точнее соперника.',
    icon: 'pvp_quiz',
    accent: 'from-blue-500/20 via-bg-card to-bg-card',
  },
];

export default function CompetitionsPage() {
  useDocumentTitle('Соревнования');
  const lastRoomId = usePvpStore((state) => state.lastRoomId);
  const { data: myRating } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Соревнования"
        title="PvP-арена"
        subtitle="Сразитесь с другими игроками в пенальти или футбольной викторине. Рейтинг ELO обновляется после каждого матча."
        actions={
          <RatingBadge
            rating={myRating?.global_rating}
            rank={myRating?.global_rank}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-accent-primary/25 bg-gradient-to-br from-accent-primary/15 via-bg-card to-bg-card p-5 lg:col-span-2"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent-primary/25 bg-accent-primary/10 text-accent-primary">
                <Swords className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Quick Match
                </h2>
                <p className="mt-1 max-w-md text-sm text-text-secondary">
                  Найдите соперника с близким рейтингом за несколько секунд.
                  Поддерживаются оба PvP-режима.
                </p>
              </div>
            </div>
            <Link to="/app/competitions/quick-match">
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                Найти матч
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-2xl border border-border bg-bg-card p-5"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple/25 bg-purple/10 text-purple">
            <UserPlus className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-lg font-bold text-text-primary">
            Challenge Friend
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Создайте комнату, отправьте код другу и начните матч, когда оба
            будете готовы.
          </p>
          <Link to="/app/competitions/rooms" className="mt-4 block">
            <Button variant="secondary" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
              Создать комнату
            </Button>
          </Link>
        </motion.div>
      </div>

      {lastRoomId && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gold">
            <Clock className="h-4 w-4" />
            У вас есть незавершённая комната
          </div>
          <Link to={`/app/competitions/rooms/${lastRoomId}`}>
            <Button size="sm" variant="gold">
              Вернуться
            </Button>
          </Link>
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-text-primary">
            Режимы соревнований
          </h2>
          <Link
            to="/app/leaderboard"
            className="flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
          >
            <Trophy className="h-3.5 w-3.5" />
            Таблица лидеров
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((mode) => (
            <div
              key={mode.value}
              className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${mode.accent} p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <GameIcon code={mode.icon} size="md" />
                <Badge variant="info">PvP 1×1</Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-text-primary">
                {mode.title}
              </h3>
              <p className="mt-1 min-h-12 text-sm text-text-secondary">
                {mode.description}
              </p>
              <div className="mt-4 flex gap-2">
                <Link to="/app/competitions/quick-match" className="flex-1">
                  <Button fullWidth size="sm">
                    Quick Match
                  </Button>
                </Link>
                <Link to="/app/competitions/rooms" className="flex-1">
                  <Button fullWidth size="sm" variant="secondary">
                    С другом
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <Users className="h-5 w-5 text-blue" />
          <p className="mt-2 text-sm font-bold text-text-primary">
            Матчмейкинг
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Поиск соперника по близкому рейтингу через очередь Redis.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <Copy className="h-5 w-5 text-purple" />
          <p className="mt-2 text-sm font-bold text-text-primary">
            Код комнаты
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Уникальный код для приглашения друга: без поиска и ожидания.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <Trophy className="h-5 w-5 text-gold" />
          <p className="mt-2 text-sm font-bold text-text-primary">
            ELO-рейтинг
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {formatNumber(myRating?.matches_played ?? 0)} сыгранных PvP-матчей.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
        Доступные режимы: {PVP_GAMES.map((game) => game.label).join(' · ')}
      </div>
    </div>
  );
}
