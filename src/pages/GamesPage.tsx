import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Coins, Gamepad2, Sparkles, Swords, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { GameIcon } from '@/components/games/GameIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import {
  GAME_CATEGORIES,
  GAME_META,
  GAME_ORDER,
  type GameCategory,
} from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { gameService } from '@/services/gameService';
import { ratingService } from '@/services/ratingService';
import { useAuthStore } from '@/stores/authStore';
import { bestScoreKey, useUserStore } from '@/stores/userStore';
import { formatNumber } from '@/utils/format';

export default function GamesPage() {
  useDocumentTitle('Мини-игры');
  const [category, setCategory] = useState<GameCategory>('all');
  const recentGameCodes = useUserStore((state) => state.recentGameCodes);
  const bestScores = useUserStore((state) => state.bestScores);
  const userId = useAuthStore((state) => state.user?.id);

  const { data: games, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: gameService.list,
    staleTime: 60_000,
  });
  const { data: myRating } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });

  const activeCodes = new Set(games?.map((game) => game.code) ?? []);
  const visibleGames = GAME_ORDER.filter((code) => {
    if (!GAME_META[code]) {
      return false;
    }
    if (category !== 'all' && GAME_META[code].category !== category) {
      return false;
    }
    return games === undefined || activeCodes.has(code);
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Игровые режимы"
        title="Мини-игры"
        subtitle="Шесть футбольных испытаний: проверьте знания, реакцию и умение собирать состав."
        actions={
          <Link to="/app/competitions">
            <Button variant="secondary" leftIcon={<Swords className="h-4 w-4" />}>
              PvP-соревнования
            </Button>
          </Link>
        }
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-accent-primary/10 via-bg-card to-bg-card p-5">
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-accent-primary/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-text-primary">
                Рейтинг по каждой игре
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Побеждайте, набирайте очки и поднимайтесь в таблицах лидеров по
                каждому режиму.
              </p>
            </div>
          </div>
          <Link to="/app/leaderboard">
            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Таблицы лидеров
            </Button>
          </Link>
        </div>
      </div>

      <Tabs
        items={GAME_CATEGORIES.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        value={category}
        onChange={setCategory}
        scrollable
        className="w-fit max-w-full"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleGames.map((code, index) => {
            const meta = GAME_META[code];
            const rating = myRating?.games.find(
              (game) => game.game_code === code,
            );
            const best = userId
              ? bestScores[bestScoreKey(userId, code)]
              : undefined;
            return (
              <motion.div
                key={code}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${meta.accent} p-5`}
              >
                <div className="relative -mx-5 -mt-5 mb-4 h-28 overflow-hidden border-b border-white/10">
                  <img
                    src={`/images/games/${code}.svg`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-bg-card/15 to-transparent" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <GameIcon code={code} size="md" />
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={meta.category === 'reaction' ? 'danger' : meta.category === 'squad' ? 'purple' : 'info'}>
                      {meta.category === 'reaction'
                        ? 'Реакция'
                        : meta.category === 'squad'
                          ? 'Состав'
                          : 'Знания'}
                    </Badge>
                    <span className="text-[10px] text-text-muted">
                      {meta.difficulty} · {meta.modes.length} режима
                    </span>
                    {recentGameCodes.includes(code) && (
                      <Badge variant="success">Недавно</Badge>
                    )}
                  </div>
                </div>
                <h2 className="mt-4 font-display text-lg font-bold text-text-primary">
                  {meta.title}
                </h2>
                <p className="mt-1.5 min-h-14 text-sm leading-relaxed text-text-secondary">
                  {meta.description}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Рейтинг
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                      {rating?.rating ? formatNumber(rating.rating) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Игр
                    </p>
                    <p className="text-sm font-bold text-text-primary">
                      {rating?.matches_played ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Рекорд
                    </p>
                    <p className="text-sm font-bold text-gold">
                      {best === undefined ? '—' : formatNumber(best)}
                    </p>
                  </div>
                </div>

                <Link to={meta.route} className="mt-4 block">
                  <Button
                    fullWidth
                    variant="secondary"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Играть
                  </Button>
                </Link>
              </motion.div>
            );
          })}
          {visibleGames.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-bg-card/50 px-6 py-12 text-center">
              <Gamepad2 className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm font-semibold text-text-primary">
                В этой категории пока нет игр
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Coins,
            title: 'Монеты за игру',
            text: 'Награда рассчитывается сервером по итогам сессии.',
          },
          {
            icon: Sparkles,
            title: 'XP и уровни',
            text: 'Опыт повышает уровень и открывает новые возможности.',
          },
          {
            icon: Trophy,
            title: 'Рейтинг режима',
            text: 'Результаты попадают в общие и игровые таблицы лидеров.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-bg-card p-4"
          >
            <item.icon className="h-5 w-5 text-accent-primary" />
            <p className="mt-2 text-sm font-bold text-text-primary">
              {item.title}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
