import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  Gamepad2,
  Shield,
  Trophy,
  UserRound,
} from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RatingBadge } from '@/components/economy/RatingBadge';
import { GAME_META } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { achievementService } from '@/services/achievementService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatNumber, titleCase } from '@/utils/format';
import { leagueForRating } from '@/utils/league';

export default function PublicProfilePage() {
  const { userId = '' } = useParams();
  const currentUserId = useAuthStore((state) => state.user?.id);

  const profileQuery = useQuery({
    queryKey: ['users', userId, 'public-profile'],
    queryFn: () => userService.publicProfile(userId),
    enabled: Boolean(userId) && userId !== currentUserId,
  });
  const statisticsQuery = useQuery({
    queryKey: ['users', userId, 'statistics'],
    queryFn: () => userService.statistics(userId),
    enabled: Boolean(userId) && userId !== currentUserId,
  });
  const achievementsQuery = useQuery({
    queryKey: ['users', userId, 'achievements'],
    queryFn: () => achievementService.forUser(userId),
    enabled: Boolean(userId) && userId !== currentUserId,
  });

  const profile = profileQuery.data;
  useDocumentTitle(profile ? `Профиль ${profile.username}` : 'Профиль игрока');

  if (userId === currentUserId) {
    return <Navigate to="/app/profile" replace />;
  }

  if (profileQuery.isLoading) {
    return <LoadingScreen label="Загружаем профиль игрока..." />;
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к рейтингу
        </Link>
        <ErrorState
          error={profileQuery.error ?? new Error('Профиль не найден')}
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  const league = leagueForRating(profile.overall_rating);
  const achievements = achievementsQuery.data ?? [];
  const statistics = statisticsQuery.data;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Публичный профиль"
        title={profile.display_name ?? profile.username}
        subtitle="Профиль другого игрока доступен только для просмотра."
        actions={
          <>
            <Link to="/app/leaderboard">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                К рейтингу
              </Button>
            </Link>
            <RatingBadge rating={profile.overall_rating} />
          </>
        }
      />

      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-blue/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              name={profile.display_name ?? profile.username}
              src={profile.avatar_url}
              size="xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-text-primary">
                  {profile.display_name ?? profile.username}
                </h2>
                <Badge variant="success">LVL {profile.level}</Badge>
                <Badge className={league.className}>{league.name}</Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                <UserRound className="h-3.5 w-3.5" />
                @{profile.username}
              </p>
              <p className="mt-2 max-w-xl text-sm text-text-secondary">
                {formatNumber(profile.total_games)} игр ·{' '}
                {formatNumber(profile.wins)} побед ·{' '}
                {formatNumber(profile.losses)} поражений
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-gold/20 bg-gold/5 px-4 py-3 text-center">
              <Trophy className="mx-auto h-4 w-4 text-gold" />
              <p className="mt-1 font-display text-xl font-extrabold text-text-primary">
                {formatNumber(profile.overall_rating)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Рейтинг
              </p>
            </div>
            <div className="rounded-2xl border border-purple/20 bg-purple/5 px-4 py-3 text-center">
              <Award className="mx-auto h-4 w-4 text-purple" />
              <p className="mt-1 font-display text-xl font-extrabold text-text-primary">
                {formatNumber(profile.achievements_count)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Достижения
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Всего игр', profile.total_games],
            ['Победы', profile.wins],
            ['Поражения', profile.losses],
            ['Win rate', `${Math.round(profile.win_rate)}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-bg-secondary px-3 py-2.5"
            >
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                {label}
              </p>
              <p className="font-display text-xl font-extrabold text-text-primary">
                {typeof value === 'number' ? formatNumber(value) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">
              Статистика по режимам
            </h2>
          </div>
          {statisticsQuery.isLoading ? (
            <p className="text-sm text-text-secondary">Загрузка...</p>
          ) : !statistics || statistics.games.length === 0 ? (
            <EmptyState
              icon={<Gamepad2 className="h-6 w-6" />}
              title="Статистики пока нет"
              description="Игрок ещё не завершил ни одной игры."
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {statistics.games.map((game) => {
                const meta = GAME_META[game.game_code];
                const gameWinRate =
                  game.games_played > 0
                    ? (game.wins / game.games_played) * 100
                    : 0;
                return (
                  <div
                    key={game.game_code}
                    className="rounded-xl border border-border bg-bg-secondary p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-text-primary">
                        {meta?.title ?? titleCase(game.game_code)}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                        <span>{game.games_played} игр</span>
                        <span>{game.wins}W</span>
                        <span className="font-bold text-blue">
                          {formatNumber(game.rating)}
                        </span>
                      </div>
                    </div>
                    <ProgressBar value={gameWinRate} max={100} className="mt-2" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gold" />
              <h2 className="text-base font-bold text-text-primary">
                Достижения
              </h2>
            </div>
            <Badge variant="gold">{achievements.length}</Badge>
          </div>
          {achievementsQuery.isLoading ? (
            <p className="text-sm text-text-secondary">Загрузка...</p>
          ) : achievements.length === 0 ? (
            <EmptyState
              icon={<Award className="h-6 w-6" />}
              title="Достижений нет"
              description="Игрок ещё не открыл ни одного достижения."
              className="py-8"
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.code}
                  className="rounded-xl border border-gold/25 bg-gold/5 p-3"
                >
                  <Trophy className="h-4 w-4 text-gold" />
                  <p className="mt-2 text-xs font-bold text-text-primary">
                    {achievement.title}
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatDate(achievement.unlocked_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-xs text-text-muted">
        Для чужого профиля доступны только просмотр статистики и достижений.
        Редактирование, настройки и финансовые данные скрыты.
      </div>
    </div>
  );
}
