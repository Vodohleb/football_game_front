import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  ChevronRight,
  ClipboardList,
  Coins,
  Gamepad2,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { RatingBadge } from '@/components/economy/RatingBadge';
import { achievementService } from '@/services/achievementService';
import { questService } from '@/services/questService';
import { ratingService } from '@/services/ratingService';
import { userService } from '@/services/userService';
import { useMe } from '@/hooks/useMe';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { GAME_META, GAME_ORDER } from '@/constants/games';
import { formatDate, formatNumber, formatPercent, titleCase } from '@/utils/format';

const QUICK_LINKS = [
  {
    to: '/app/games',
    title: 'Мини-игры',
    text: '6 режимов',
    icon: Gamepad2,
    accent: 'text-accent-primary bg-accent-primary/10 border-accent-primary/20',
  },
  {
    to: '/app/competitions',
    title: 'Соревнования',
    text: 'PvP 1×1',
    icon: Swords,
    accent: 'text-blue bg-blue/10 border-blue/20',
  },
  {
    to: '/app/club/collection',
    title: 'Мой клуб',
    text: 'Коллекция и состав',
    icon: Shield,
    accent: 'text-purple bg-purple/10 border-purple/20',
  },
  {
    to: '/app/shop/packs',
    title: 'Магазин',
    text: 'Открыть пак',
    icon: ShoppingBag,
    accent: 'text-gold bg-gold/10 border-gold/20',
  },
];

export default function DashboardPage() {
  useDocumentTitle('Главная');
  const { data: me, isLoading: meLoading } = useMe();
  const userId = me?.user.id;

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['users', userId, 'statistics'],
    queryFn: () => userService.statistics(userId as string),
    enabled: Boolean(userId),
  });
  const { data: myRating } = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });
  const { data: dailyQuests } = useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: questService.daily,
  });
  const { data: achievements } = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: achievementService.mine,
  });
  const { data: globalBoard } = useQuery({
    queryKey: ['leaderboard', 'global', 1],
    queryFn: () => ratingService.global(1, 5),
  });

  const username = me?.profile?.display_name ?? me?.user.username ?? 'Player';
  const profile = me?.profile;
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const nextLevelXp = Math.max(100, level * 250);
  const winRate =
    statistics?.overall && statistics.overall.total_games > 0
      ? statistics.overall.wins / statistics.overall.total_games
      : 0;

  const pendingQuests =
    dailyQuests?.data.filter((quest) => quest.status !== 'CLAIMED') ?? [];
  const recentAchievements = achievements?.slice(0, 3) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-primary">
            {new Intl.DateTimeFormat('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-text-primary sm:text-3xl">
            Привет, {username}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Твой прогресс, задания и быстрый доступ к игре.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/games">
            <Button leftIcon={<Gamepad2 className="h-4 w-4" />}>
              Играть
            </Button>
          </Link>
          <Link to="/app/shop/packs">
            <Button variant="secondary" leftIcon={<ShoppingBag className="h-4 w-4" />}>
              Открыть пак
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={username} src={profile?.avatar_url} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-text-primary">
                  {username}
                </h2>
                <Badge variant="success">LVL {level}</Badge>
                {me?.user.role !== 'user' && (
                  <Badge variant="gold">{me?.user.role}</Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                @{me?.user.username} · в игре с {formatDate(me?.user.created_at)}
              </p>
              <div className="mt-3 w-full max-w-xs">
                <div className="mb-1 flex justify-between text-[11px] text-text-secondary">
                  <span>До следующего уровня</span>
                  <span>
                    {formatNumber(xp)} / {formatNumber(nextLevelXp)} XP
                  </span>
                </div>
                <ProgressBar value={xp} max={nextLevelXp} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:shrink-0">
            <div className="rounded-2xl border border-gold/20 bg-gold/5 px-3 py-3">
              <Coins className="h-4 w-4 text-gold" />
              <p className="mt-2 font-display text-lg font-extrabold text-text-primary">
                {formatNumber(me?.wallet?.balance)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Монеты
              </p>
            </div>
            <div className="rounded-2xl border border-blue/20 bg-blue/5 px-3 py-3">
              <Trophy className="h-4 w-4 text-blue" />
              <p className="mt-2 font-display text-lg font-extrabold text-text-primary">
                {formatNumber(myRating?.global_rating)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Рейтинг
              </p>
            </div>
            <div className="rounded-2xl border border-accent-primary/20 bg-accent-primary/5 px-3 py-3">
              <Target className="h-4 w-4 text-accent-primary" />
              <p className="mt-2 font-display text-lg font-extrabold text-text-primary">
                {formatNumber(profile?.total_games)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Игр
              </p>
            </div>
            <div className="rounded-2xl border border-purple/20 bg-purple/5 px-3 py-3">
              <Sparkles className="h-4 w-4 text-purple" />
              <p className="mt-2 font-display text-lg font-extrabold text-text-primary">
                {formatPercent(winRate * 100)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Win rate
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link, index) => (
          <motion.div
            key={link.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={link.to}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[#3a4b5e]"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${link.accent}`}
              >
                <link.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-text-primary">
                  {link.title}
                </span>
                <span className="block truncate text-xs text-text-muted">
                  {link.text}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-accent-primary" />
                <h2 className="text-base font-bold text-text-primary">
                  Ежедневные задания
                </h2>
              </div>
              <Link
                to="/app/quests"
                className="flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
              >
                Все задания
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {!dailyQuests ? (
              <div className="space-y-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : pendingQuests.length === 0 ? (
              <EmptyState
                icon={<Award className="h-6 w-6" />}
                title="Все задания выполнены"
                description="Возвращайтесь завтра за новой порцией наград."
                className="py-8"
              />
            ) : (
              <div className="space-y-2.5">
                {pendingQuests.slice(0, 3).map((quest) => {
                  const percent = Math.min(
                    100,
                    (quest.progress / quest.target_value) * 100,
                  );
                  return (
                    <div
                      key={quest.user_quest_id}
                      className="rounded-xl border border-border bg-bg-secondary px-3.5 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {quest.title}
                        </p>
                        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-gold">
                          <Coins className="h-3.5 w-3.5" />
                          {quest.reward_coins}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={percent} max={100} className="flex-1" />
                        <span className="w-14 text-right text-[11px] text-text-muted">
                          {quest.progress}/{quest.target_value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4.5 w-4.5 text-accent-primary" />
                <h2 className="text-base font-bold text-text-primary">
                  Мини-игры
                </h2>
              </div>
              <Link
                to="/app/games"
                className="flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
              >
                Каталог
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {GAME_ORDER.map((code) => {
                const meta = GAME_META[code];
                return (
                  <Link
                    key={code}
                    to={meta.route}
                    className="group flex items-center gap-2.5 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 transition-colors hover:border-accent-primary/40"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
                      <Target className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text-primary">
                      {meta.short}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-gold" />
                <h2 className="text-base font-bold text-text-primary">
                  Последние достижения
                </h2>
              </div>
              <Link
                to="/app/achievements"
                className="flex items-center gap-1 text-xs font-semibold text-accent-primary hover:underline"
              >
                Все
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Достижений пока нет. Сыграйте первую игру!
              </p>
            ) : (
              <div className="space-y-2">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.code}
                    className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2.5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <Trophy className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {achievement.title}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {formatDate(achievement.unlocked_at)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gold">
                      +{achievement.reward_coins}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-blue" />
                <h2 className="text-base font-bold text-text-primary">
                  Топ игроков
                </h2>
              </div>
              <Link
                to="/app/leaderboard"
                className="text-xs font-semibold text-accent-primary hover:underline"
              >
                Рейтинг
              </Link>
            </div>
            <div className="space-y-1.5">
              {globalBoard?.data?.length ? (
                globalBoard.data.map((entry) => (
                  <div
                    key={entry.username}
                    className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5"
                  >
                    <span className="w-6 text-center text-xs font-bold text-text-muted">
                      {entry.rank}
                    </span>
                    <Avatar name={entry.username} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                      {entry.display_name ?? entry.username}
                    </span>
                    <span className="text-xs font-bold text-blue">
                      {formatNumber(entry.rating)}
                    </span>
                  </div>
                ))
              ) : (
                <Skeleton className="h-36" />
              )}
            </div>
            <div className="mt-4 rounded-xl border border-blue/20 bg-blue/5 px-3 py-2.5">
              <p className="text-[11px] text-text-secondary">Твой рейтинг</p>
              <div className="mt-1 flex items-center justify-between">
                <RatingBadge
                  rating={myRating?.global_rating}
                  rank={myRating?.global_rank}
                  compact
                />
                <span className="text-[11px] text-text-muted">
                  {myRating?.games.length ?? 0} режимов
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-accent-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Статистика по играм
              </h2>
            </div>
            {statsLoading || !statistics ? (
              <Skeleton className="h-40" />
            ) : statistics.games.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Сыграйте первую игру, чтобы увидеть статистику.
              </p>
            ) : (
              <div className="space-y-2">
                {statistics.games.map((game) => (
                  <div
                    key={game.game_code}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-text-primary">
                        {GAME_META[game.game_code]?.title ?? titleCase(game.game_code)}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {game.games_played} игр · {game.wins} побед
                      </p>
                    </div>
                    <span className="text-xs font-bold text-accent-primary">
                      {game.rating === null ? '—' : formatNumber(game.rating)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {meLoading && <Skeleton className="h-32" />}
          {!meLoading && !me && (
            <EmptyState
              title="Профиль не загружен"
              description="Обновите страницу или войдите снова."
            />
          )}
        </div>
      </div>
    </div>
  );
}
