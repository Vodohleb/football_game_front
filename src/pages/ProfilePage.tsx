import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  CalendarDays,
  Coins,
  Edit3,
  Gamepad2,
  Shield,
  Trophy,
  UserRound,
  Wallet,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { CoinBalance } from '@/components/economy/CoinBalance';
import { RatingBadge } from '@/components/economy/RatingBadge';
import { GAME_META } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMe } from '@/hooks/useMe';
import { achievementService } from '@/services/achievementService';
import { economyService } from '@/services/economyService';
import { ratingService } from '@/services/ratingService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { useWalletStore } from '@/stores/walletStore';
import type { UserSettings } from '@/types/api';
import { cn } from '@/utils/cn';
import { errorMessage } from '@/utils/errors';
import { formatDate, formatDateTime, formatNumber, titleCase } from '@/utils/format';
import { leagueForRating } from '@/utils/league';

type TabValue =
  | 'overview'
  | 'statistics'
  | 'achievements'
  | 'history'
  | 'settings';

export default function ProfilePage() {
  useDocumentTitle('Профиль');
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMe();
  const setUser = useAuthStore((state) => state.setUser);
  const setBalance = useWalletStore((state) => state.setBalance);
  const [tab, setTab] = useState<TabValue>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [settingsDraft, setSettingsDraft] = useState<UserSettings | null>(null);

  const userId = me?.user.id;

  const statisticsQuery = useQuery({
    queryKey: ['users', userId, 'statistics'],
    queryFn: () => userService.statistics(userId as string),
    enabled: Boolean(userId),
  });
  const achievementsQuery = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: achievementService.mine,
  });
  const ratingQuery = useQuery({
    queryKey: ['leaderboard', 'me'],
    queryFn: ratingService.me,
    staleTime: 60_000,
  });
  const progressQuery = useQuery({
    queryKey: ['economy', 'progress'],
    queryFn: economyService.progress,
  });
  const historyQuery = useQuery({
    queryKey: ['economy', 'transactions', historyPage],
    queryFn: () => economyService.transactions(historyPage, 20),
    enabled: tab === 'history',
  });
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: userService.settings,
    enabled: tab === 'settings',
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSettingsDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      userService.updateMe({
        username: username.trim(),
        display_name: displayName.trim(),
        ...(avatarUrl.trim() ? { avatar_url: avatarUrl.trim() } : {}),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['users', 'me'], data);
      setUser(data.user);
      if (data.wallet) {
        setBalance(data.wallet.balance);
      }
      setEditOpen(false);
      notify.success('Профиль обновлён');
    },
    onError: (error) => notify.error('Не удалось обновить профиль', errorMessage(error)),
  });

  const settingsMutation = useMutation({
    mutationFn: (body: Partial<UserSettings>) => userService.updateSettings(body),
    onSuccess: (data) => {
      setSettingsDraft(data);
      queryClient.setQueryData(['settings'], data);
      notify.success('Настройки сохранены');
    },
    onError: (error) => notify.error('Не удалось сохранить настройки', errorMessage(error)),
  });

  if (isLoading || !me) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const profile = me.profile;
  const statistics = statisticsQuery.data;
  const totalGames = profile?.total_games ?? statistics?.overall.total_games ?? 0;
  const wins = profile?.wins ?? statistics?.overall.wins ?? 0;
  const losses = profile?.losses ?? statistics?.overall.losses ?? 0;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const progress = progressQuery.data;
  const unlocked = achievementsQuery.data ?? [];

  const openEdit = () => {
    setUsername(me.user.username);
    setDisplayName(profile?.display_name ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
    setEditOpen(true);
  };

  const usernameValid = /^[A-Za-z0-9_]{3,32}$/.test(username.trim());

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              name={profile?.display_name ?? me.user.username}
              src={profile?.avatar_url}
              size="xl"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-text-primary">
                  {profile?.display_name ?? me.user.username}
                </h1>
                <Badge variant="success">LVL {profile?.level ?? 1}</Badge>
                <Badge className={leagueForRating(ratingQuery.data?.global_rating).className}>
                  {leagueForRating(ratingQuery.data?.global_rating).name}
                </Badge>
                {me.user.role !== 'user' && (
                  <Badge variant="gold">{me.user.role}</Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                @{me.user.username} · {me.user.email}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                С нами с {formatDate(me.user.created_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CoinBalance showLabel />
            <RatingBadge
              rating={ratingQuery.data?.global_rating}
              rank={ratingQuery.data?.global_rank}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={openEdit}
              leftIcon={<Edit3 className="h-3.5 w-3.5" />}
            >
              Редактировать
            </Button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-bg-secondary px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              Игры
            </p>
            <p className="font-display text-xl font-extrabold text-text-primary">
              {formatNumber(totalGames)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-secondary px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              Победы
            </p>
            <p className="font-display text-xl font-extrabold text-accent-primary">
              {formatNumber(wins)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-secondary px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              Поражения
            </p>
            <p className="font-display text-xl font-extrabold text-red">
              {formatNumber(losses)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-secondary px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              Win rate
            </p>
            <p className="font-display text-xl font-extrabold text-blue">
              {Math.round(winRate)}%
            </p>
          </div>
        </div>
      </div>

      <Tabs
        items={[
          { value: 'overview', label: 'Обзор' },
          { value: 'statistics', label: 'Статистика' },
          { value: 'achievements', label: 'Достижения', count: unlocked.length },
          { value: 'history', label: 'История' },
          { value: 'settings', label: 'Настройки' },
        ]}
        value={tab}
        onChange={(value) => setTab(value as TabValue)}
        scrollable
      />

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Zap className="h-4 w-4 text-accent-primary" />
                Уровень и опыт
              </p>
              <Badge variant="success">LVL {profile?.level ?? 1}</Badge>
            </div>
            <p className="mt-4 font-display text-4xl font-extrabold text-text-primary">
              {formatNumber(progress?.xp ?? profile?.xp ?? 0)}
              <span className="ml-2 text-sm font-medium text-text-secondary">
                XP
              </span>
            </p>
            <ProgressBar
              className="mt-3"
              value={progress?.progress_percent ?? 0}
              max={100}
            />
            <p className="mt-2 text-xs text-text-secondary">
              {progress?.next_level_xp
                ? `До уровня ${progress.level + 1}: ${formatNumber(
                    progress.xp_to_next_level,
                  )} XP`
                : 'Максимальный уровень достигнут'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Trophy className="h-4 w-4 text-blue" />
              Рейтинг и сезон
            </p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-4xl font-extrabold text-blue">
                  {formatNumber(ratingQuery.data?.global_rating)}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Глобальная позиция #{ratingQuery.data?.global_rank ?? '—'}
                </p>
              </div>
              <RatingBadge
                rating={ratingQuery.data?.global_rating}
                rank={ratingQuery.data?.global_rank}
                compact
              />
            </div>
            <div className="mt-4 border-t border-border pt-3 text-xs text-text-secondary">
              {ratingQuery.data?.season ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{ratingQuery.data.season.name}</span>
                  <span>
                    Сезон: #{ratingQuery.data.season_rank ?? '—'} · Weekly{' '}
                    {ratingQuery.data.weekly_delta >= 0 ? '+' : ''}
                    {ratingQuery.data.weekly_delta}
                  </span>
                </div>
              ) : (
                'Сезон ещё не начался'
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Wallet className="h-4 w-4 text-gold" />
              Кошелёк
            </p>
            <p className="mt-3 font-display text-3xl font-extrabold text-gold">
              {formatNumber(me.wallet?.balance ?? 0)}
            </p>
            <p className="text-xs text-text-muted">монет на балансе</p>
            <div className="mt-4 flex gap-2">
              <Link to="/app/shop/packs" className="flex-1">
                <Button size="sm" fullWidth variant="secondary">
                  В магазин
                </Button>
              </Link>
              <Link to="/app/games" className="flex-1">
                <Button size="sm" fullWidth>
                  Заработать
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Award className="h-4 w-4 text-gold" />
                Достижения
              </p>
              <Link
                to="/app/achievements"
                className="text-xs font-semibold text-accent-primary hover:underline"
              >
                Все
              </Link>
            </div>
            {unlocked.length === 0 ? (
              <p className="mt-3 text-sm text-text-secondary">
                Пока нет открытых достижений.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {unlocked.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.code}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-bg-secondary px-3 py-2"
                  >
                    <Award className="h-4 w-4 text-gold" />
                    <p className="min-w-0 flex-1 truncate text-xs font-semibold text-text-primary">
                      {achievement.title}
                    </p>
                    <span className="text-[10px] text-text-muted">
                      {formatDate(achievement.unlocked_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'statistics' && (
        <div className="space-y-4">
          {statisticsQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : statisticsQuery.isError ? (
            <ErrorState
              error={statisticsQuery.error}
              onRetry={() => statisticsQuery.refetch()}
            />
          ) : statistics ? (
            <>
              <div className="rounded-2xl border border-border bg-bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Общая статистика
                    </p>
                    <p className="text-xs text-text-secondary">
                      Включает мини-игры и PvP-матчи
                    </p>
                  </div>
                  <Badge variant="info">
                    {statistics.overall.total_games} игр
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Победы
                    </p>
                    <p className="font-display text-2xl font-extrabold text-accent-primary">
                      {statistics.overall.wins}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Поражения
                    </p>
                    <p className="font-display text-2xl font-extrabold text-red">
                      {statistics.overall.losses}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Win rate
                    </p>
                    <p className="font-display text-2xl font-extrabold text-blue">
                      {Math.round(statistics.overall.win_rate * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-text-muted">
                      Общий рейтинг
                    </p>
                    <p className="font-display text-2xl font-extrabold text-text-primary">
                      {formatNumber(statistics.overall_rating)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-bg-card p-5">
                <p className="mb-4 text-sm font-semibold text-text-primary">
                  По режимам
                </p>
                {statistics.games.length === 0 ? (
                  <EmptyState
                    icon={<Gamepad2 className="h-6 w-6" />}
                    title="Статистики пока нет"
                    description="Сыграйте первую игру, чтобы увидеть разбивку по режимам."
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
                          <ProgressBar
                            value={gameWinRate}
                            max={100}
                            className="mt-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {tab === 'achievements' && (
        <div className="space-y-3">
          {achievementsQuery.isLoading ? (
            <Skeleton className="h-52" />
          ) : unlocked.length === 0 ? (
            <EmptyState
              icon={<Award className="h-6 w-6" />}
              title="Достижений пока нет"
              description="Играйте и открывайте паки, чтобы получить первые награды."
              action={
                <Link to="/app/achievements">
                  <Button variant="secondary">Все достижения</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unlocked.map((achievement) => (
                <div
                  key={achievement.code}
                  className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-bg-card to-bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <Badge variant="success">Открыто</Badge>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-text-primary">
                    {achievement.title}
                  </h3>
                  <p className="mt-1 min-h-8 text-xs text-text-secondary">
                    {achievement.description}
                  </p>
                  <p className="mt-2 text-[11px] text-text-muted">
                    {formatDate(achievement.unlocked_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {historyQuery.isLoading ? (
            <Skeleton className="h-72" />
          ) : historyQuery.isError ? (
            <ErrorState
              error={historyQuery.error}
              onRetry={() => historyQuery.refetch()}
            />
          ) : (historyQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Coins className="h-6 w-6" />}
              title="История пуста"
              description="Здесь появятся начисления и списания монет."
            />
          ) : (
            <>
              <div className="space-y-2">
                {historyQuery.data?.data.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg',
                          transaction.amount >= 0
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : 'bg-red/10 text-red',
                        )}
                      >
                        {transaction.amount >= 0 ? (
                          <Coins className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {transaction.description ?? titleCase(transaction.type)}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {formatDateTime(transaction.created_at)} ·{' '}
                          {titleCase(transaction.type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-bold',
                          transaction.amount >= 0
                            ? 'text-accent-primary'
                            : 'text-red',
                        )}
                      >
                        {transaction.amount >= 0 ? '+' : ''}
                        {formatNumber(transaction.amount)}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Баланс: {formatNumber(transaction.balance_after)}
                      </p>
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
      )}

      {tab === 'settings' && (
        <div className="max-w-2xl space-y-4">
          {settingsQuery.isLoading || !settingsDraft ? (
            <Skeleton className="h-72" />
          ) : (
            <div className="space-y-4 rounded-2xl border border-border bg-bg-card p-5">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-accent-primary" />
                <p className="text-sm font-semibold text-text-primary">
                  Настройки аккаунта
                </p>
              </div>
              <Select
                label="Язык"
                options={[
                  { value: 'ru', label: 'Русский' },
                  { value: 'en', label: 'English' },
                ]}
                value={settingsDraft.language}
                onChange={(event) =>
                  setSettingsDraft({ ...settingsDraft, language: event.target.value })
                }
              />
              <Select
                label="Тема"
                options={[
                  { value: 'dark', label: 'Тёмная' },
                  { value: 'system', label: 'Системная' },
                  { value: 'light', label: 'Светлая (скоро)' },
                ]}
                value={settingsDraft.theme}
                onChange={(event) =>
                  setSettingsDraft({
                    ...settingsDraft,
                    theme: event.target.value as UserSettings['theme'],
                  })
                }
              />
              {(
                [
                  ['email_notifications', 'Email-уведомления', 'Награды, достижения и важные события'],
                  ['push_notifications', 'Push-уведомления', 'Уведомления в браузере'],
                  ['show_online_status', 'Показывать статус', 'Другие игроки видят, что вы онлайн'],
                ] as const
              ).map(([key, title, description]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3.5 py-3"
                >
                  <span>
                    <span className="block text-sm font-medium text-text-primary">
                      {title}
                    </span>
                    <span className="block text-[11px] text-text-muted">
                      {description}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border bg-bg-card accent-accent-primary"
                    checked={settingsDraft[key]}
                    onChange={(event) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        [key]: event.target.checked,
                      })
                    }
                  />
                </label>
              ))}
              <Button
                fullWidth
                size="lg"
                loading={settingsMutation.isPending}
                onClick={() =>
                  settingsMutation.mutate({
                    language: settingsDraft.language,
                    theme: settingsDraft.theme,
                    email_notifications: settingsDraft.email_notifications,
                    push_notifications: settingsDraft.push_notifications,
                    show_online_status: settingsDraft.show_online_status,
                  })
                }
              >
                Сохранить настройки
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Редактировать профиль"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              loading={updateMutation.isPending}
              disabled={!usernameValid}
            >
              Сохранить
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Никнейм"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={
              username && !usernameValid
                ? '3–32 символа: латиница, цифры и _'
                : undefined
            }
          />
          <Input
            label="Отображаемое имя"
            value={displayName}
            maxLength={32}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Как вас называть"
          />
          <Input
            label="Ссылка на аватар"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://..."
            hint="Необязательно. Публичный URL изображения."
          />
        </div>
      </Modal>
    </div>
  );
}
