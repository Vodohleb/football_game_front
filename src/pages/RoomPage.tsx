import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Clipboard,
  Crown,
  DoorOpen,
  Loader2,
  Radio,
  RotateCcw,
  Shield,
  Swords,
  Trophy,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { websocketBaseUrl } from '@/services/api';
import { pvpService } from '@/services/pvpService';
import { notify } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { usePvpStore } from '@/stores/pvpStore';
import type { PvpMatchState, PvpRoom } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatNumber } from '@/utils/format';

type ConnectionState = 'connecting' | 'open' | 'closed';

function Scoreboard({
  match,
  myUsername,
}: {
  match: PvpMatchState;
  myUsername: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border border-border bg-bg-card px-3 py-3 sm:px-5">
      {match.players.map((player, index) => {
        const isMe = player.username === myUsername;
        const score = match.scores[player.username] ?? 0;
        const submitted = match.submitted.includes(player.username);
        return (
          <div
            key={player.user_id}
            className={`flex flex-col ${
              index === 1 ? 'items-end text-right' : 'items-start'
            } ${index === 0 ? '' : ''}`}
          >
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                isMe ? 'text-accent-primary' : 'text-text-primary'
              }`}
            >
              {index === 0 && <Shield className="h-3.5 w-3.5" />}
              <span className="max-w-24 truncate sm:max-w-40">
                {player.username}
              </span>
              {index === 0 && submitted && (
                <Check className="h-3 w-3 text-accent-primary" />
              )}
            </span>
            <span className="font-display text-3xl font-extrabold text-text-primary">
              {score}
            </span>
            {index === 0 && (
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                {submitted ? 'выбор сделан' : 'думает...'}
              </span>
            )}
            {index === 1 && (
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                {submitted ? 'выбор сделан' : 'думает...'}
              </span>
            )}
          </div>
        );
      })}
      <div className="flex flex-col items-center gap-1">
        <Swords className="h-5 w-5 text-text-muted" />
        <Badge variant="info">
          {match.round}/{match.total_rounds}
        </Badge>
      </div>
      {match.players.length < 2 && (
        <div className="col-span-3 mt-2 text-center text-xs text-text-muted">
          Ожидаем второго игрока...
        </div>
      )}
    </div>
  );
}

export default function RoomPage() {
  const { roomId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const myUsername = user?.username ?? '';
  const setLastRoom = usePvpStore((state) => state.setLastRoom);
  const setLastResult = usePvpStore((state) => state.setLastResult);
  const lastResult = usePvpStore((state) => state.lastResult);
  const [liveRoom, setLiveRoom] = useState<PvpRoom | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [submitting, setSubmitting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  useDocumentTitle('PvP матч');

  const roomQuery = useQuery({
    queryKey: ['pvp', 'room', roomId],
    queryFn: () => pvpService.room(roomId),
    enabled: Boolean(roomId),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (roomQuery.data) {
      setLiveRoom(roomQuery.data);
    }
  }, [roomQuery.data]);

  useEffect(() => {
    if (liveRoom) {
      setLastRoom(liveRoom.id, liveRoom.game_code);
    }
  }, [liveRoom, setLastRoom]);

  useEffect(() => {
    if (!token || !roomId) {
      return;
    }
    let disposed = false;
    let pingTimer: number | undefined;
    let retryTimer: number | undefined;

    const handleMessage = (raw: string) => {
      let payload: { type: string; data?: unknown };
      try {
        payload = JSON.parse(raw) as { type: string; data?: unknown };
      } catch {
        return;
      }

      if (payload.type === 'room_state') {
        setLiveRoom(payload.data as PvpRoom);
        setSubmitting(false);
        return;
      }
      if (payload.type === 'state') {
        const state = payload.data as PvpMatchState;
        setLiveRoom((previous) =>
          previous ? { ...previous, match_state: state } : previous,
        );
        setSubmitting(false);
        return;
      }
      if (payload.type === 'match_start') {
        const data = payload.data as {
          match_id: string;
          state: PvpMatchState;
        };
        setLiveRoom((previous) =>
          previous
            ? {
                ...previous,
                status: 'IN_PROGRESS',
                match_id: data.match_id,
                match_state: data.state,
              }
            : previous,
        );
        notify.success('Матч начался!', 'Удачи на поле.');
        return;
      }
      if (payload.type === 'round_result') {
        const data = payload.data as {
          state: PvpMatchState;
          log: {
            round: number;
            results: {
              username: string;
              goal?: boolean;
              correct?: boolean;
            }[];
          };
        };
        setLiveRoom((previous) =>
          previous ? { ...previous, match_state: data.state } : previous,
        );
        setSubmitting(false);
        const summary = data.log.results
          .map((result) =>
            result.goal !== undefined
              ? `${result.username}: ${result.goal ? 'гол' : 'сейв'}`
              : `${result.username}: ${result.correct ? 'верно' : 'мимо'}`,
          )
          .join(' · ');
        notify.info(`Раунд ${data.log.round}`, summary);
        return;
      }
      if (payload.type === 'match_finished') {
        const data = payload.data as {
          scores: Record<string, number>;
          winner: string | null;
          game_code: string;
          players?: {
            username: string;
            score?: number;
            result?: string;
            rating_delta: number;
          }[];
        };
        setLiveRoom((previous) => {
          if (!previous) return previous;
          const state = previous.match_state
            ? {
                ...previous.match_state,
                finished: true,
                winner: data.winner,
                scores: data.scores,
                status: 'FINISHED',
              }
            : previous.match_state;
          return { ...previous, status: 'FINISHED', match_state: state };
        });
        setLastResult({
          scores: data.scores,
          winner: data.winner,
          gameCode: data.game_code,
          players: data.players,
        });
        setSubmitting(false);
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        notify.success(
          data.winner ? `Победитель: ${data.winner}` : 'Ничья!',
          'Матч завершён.',
        );
        return;
      }
      if (payload.type === 'player_connected') {
        const data = payload.data as { username: string; reconnected?: boolean };
        notify.info(
          data.reconnected ? 'Соперник переподключился' : 'Соперник подключился',
          data.username,
        );
        return;
      }
      if (payload.type === 'player_disconnected') {
        const data = payload.data as { username: string };
        notify.warning('Соперник отключился', data.username);
        return;
      }
      if (payload.type === 'submission_received') {
        const data = payload.data as { username: string };
        notify.info('Выбор сделан', data.username);
        return;
      }
      if (payload.type === 'error') {
        const data = payload.data as { message: string };
        notify.error('Ошибка PvP', data.message);
      }
    };

    const connect = () => {
      if (disposed) {
        return;
      }
      setConnection('connecting');
      const url = `${websocketBaseUrl()}/ws/pvp/${roomId}?token=${encodeURIComponent(
        token,
      )}`;
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        if (disposed) {
          socket.close();
          return;
        }
        setConnection('open');
        pingTimer = window.setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20_000);
      };
      socket.onmessage = (event) => handleMessage(String(event.data));
      socket.onerror = () => {
        setConnection('closed');
      };
      socket.onclose = () => {
        if (pingTimer) {
          window.clearInterval(pingTimer);
        }
        setConnection('closed');
        if (!disposed) {
          retryTimer = window.setTimeout(connect, 2500);
        }
      };
    };

    connect();

    return () => {
      disposed = true;
      if (pingTimer) {
        window.clearInterval(pingTimer);
      }
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId, token, queryClient, setLastResult]);

  const send = (payload: Record<string, unknown>): boolean => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      notify.error('Нет соединения', 'Подождите переподключения к комнате.');
      return false;
    }
    socket.send(JSON.stringify({ type: 'submit', payload }));
    setSubmitting(true);
    return true;
  };

  const readyMutation = useMutation({
    mutationFn: () => pvpService.ready(roomId),
    onSuccess: (room) => {
      setLiveRoom(room);
      queryClient.invalidateQueries({ queryKey: ['pvp', 'room', roomId] });
    },
    onError: (error) => notify.error('Не удалось подтвердить готовность', errorMessage(error)),
  });

  const leaveMutation = useMutation({
    mutationFn: () => pvpService.leave(roomId),
    onSuccess: () => {
      usePvpStore.getState().clear();
      navigate('/app/competitions/rooms');
    },
    onError: (error) => notify.error('Не удалось выйти', errorMessage(error)),
  });

  const rematchMutation = useMutation({
    mutationFn: (gameCode: string) => pvpService.createRoom(gameCode),
    onSuccess: (room) => {
      setLastRoom(room.id, room.game_code);
      notify.success('Новая комната создана', `Код: ${room.code}`);
      navigate(`/app/competitions/rooms/${room.id}`);
    },
    onError: (error) => notify.error('Не удалось создать комнату', errorMessage(error)),
  });

  if (roomQuery.isLoading && !liveRoom) {
    return <LoadingScreen label="Подключаемся к комнате..." />;
  }
  if (!liveRoom) {
    return (
      <ErrorState
        error={roomQuery.error ?? new Error('Комната не найдена')}
        onRetry={() => roomQuery.refetch()}
      />
    );
  }

  const room = liveRoom;
  const match = room.match_state;
  const myMember = room.members.find((member) => member.username === myUsername);
  const isHost = room.host_username === myUsername;
  const finished = room.status === 'FINISHED' || Boolean(match?.finished);
  const hasSubmitted = Boolean(
    match?.submitted.includes(myUsername) || submitting,
  );
  const lastRound = match?.log[match.log.length - 1];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      notify.success('Код скопирован', room.code);
    } catch {
      notify.info('Код комнаты', room.code);
    }
  };

  const connectionBadge = (
    <Badge
      variant={
        connection === 'open'
          ? 'success'
          : connection === 'connecting'
            ? 'warning'
            : 'danger'
      }
      dot
    >
      {connection === 'open' ? (
        <>
          <Wifi className="h-3 w-3" /> Online
        </>
      ) : connection === 'connecting' ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> Connecting
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" /> Offline
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/app/competitions/rooms"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-card text-text-secondary hover:text-text-primary"
            aria-label="Назад"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary">
              {room.game_code === 'pvp_penalty'
                ? 'Penalty PvP'
                : 'Football Quiz PvP'}
            </h1>
            <p className="text-xs text-text-secondary">
              {room.status} · {room.members.length}/2 игрока
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {connectionBadge}
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 font-mono text-sm font-bold tracking-[0.18em] text-text-primary transition-colors hover:border-accent-primary/50"
            title="Скопировать код"
          >
            {room.code}
            <Clipboard className="h-3.5 w-3.5 text-text-muted" />
          </button>
        </div>
      </div>

      {room.status === 'WAITING' && !match && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <Users className="h-5 w-5 text-accent-primary" />
                Игроки
              </h2>
              <Badge variant="warning" dot>
                Ожидание
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              {[0, 1].map((index) => {
                const member = room.members[index];
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 ${
                      member
                        ? 'border-border bg-bg-secondary'
                        : 'border-dashed border-border bg-bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          member
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : 'bg-bg-hover text-text-muted'
                        }`}
                      >
                        {index === 0 ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {member?.username ?? 'Ожидаем игрока...'}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-text-muted">
                          {member
                            ? member.username === room.host_username
                              ? 'Хост'
                              : 'Гость'
                            : 'Свободное место'}
                        </p>
                      </div>
                    </div>
                    {member && (
                      <Badge variant={member.ready ? 'success' : 'default'}>
                        {member.ready ? 'Готов' : member.status}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                fullWidth
                size="lg"
                disabled={
                  myMember?.ready ||
                  room.members.length < 2 ||
                  readyMutation.isPending
                }
                loading={readyMutation.isPending}
                onClick={() => readyMutation.mutate()}
                leftIcon={<Check className="h-4 w-4" />}
              >
                {myMember?.ready ? 'Вы готовы' : 'Готов'}
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="danger"
                loading={leaveMutation.isPending}
                onClick={() => leaveMutation.mutate()}
                leftIcon={<DoorOpen className="h-4 w-4" />}
              >
                Выйти
              </Button>
            </div>
            {room.members.length < 2 && (
              <p className="mt-3 text-center text-xs text-text-muted">
                Отправьте код <span className="font-bold text-text-primary">{room.code}</span>{' '}
                другу. Матч начнётся, когда оба нажмут «Готов».
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-bg-card p-5">
            <h2 className="text-lg font-bold text-text-primary">
              Правила режима
            </h2>
            <div className="mt-3 space-y-2 text-sm text-text-secondary">
              {room.game_code === 'pvp_penalty' ? (
                <>
                  <p>• 5 раундов. В каждом раунде оба выбирают сектор удара.</p>
                  <p>• Вратарь случайно закрывает один сектор.</p>
                  <p>• Гол приносит очко. Побеждает игрок с большим счётом.</p>
                  <p>• При равенстве фиксируется ничья.</p>
                </>
              ) : (
                <>
                  <p>• 5 вопросов о клубах футболистов.</p>
                  <p>• Оба игрока отвечают на одинаковые вопросы.</p>
                  <p>• Верный ответ приносит очко.</p>
                  <p>• Победитель определяется по сумме очков.</p>
                </>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-bg-secondary p-3 text-xs text-text-muted">
              {isHost
                ? 'Вы хост комнаты. Код можно скопировать кнопкой выше.'
                : 'Комната создана другим игроком.'}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <Radio className="h-3.5 w-3.5 text-accent-primary" />
              {connection === 'open'
                ? 'Соединение установлено'
                : 'Восстанавливаем соединение...'}
            </div>
          </div>
        </div>
      )}

      {!finished && match && (
        <div className="space-y-4">
          <Scoreboard match={match} myUsername={myUsername} />

          <div className="rounded-3xl border border-border bg-gradient-to-b from-bg-card to-bg-secondary p-4 sm:p-6">
            {match.game_code === 'pvp_penalty' ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      Выберите сектор удара
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Раунд {match.round} из {match.total_rounds}. Соперник
                      выбирает одновременно с вами.
                    </p>
                  </div>
                  {hasSubmitted && (
                    <Badge variant="success" dot>
                      Ваш выбор принят
                    </Badge>
                  )}
                </div>
                <div className="mx-auto max-w-xl overflow-hidden rounded-t-2xl border-x-4 border-t-4 border-white/70 bg-[#0b1712] p-2">
                  <div className="grid aspect-[3/2] grid-cols-3 grid-rows-3 gap-1.5">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={hasSubmitted}
                        onClick={() => send({ sector: index })}
                        className="group relative flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-colors hover:border-accent-primary/50 hover:bg-accent-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Сектор ${index + 1}`}
                      >
                        <Swords className="h-5 w-5 text-white/10 group-hover:text-accent-primary/60" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mx-auto h-1 max-w-xl rounded-b bg-white/70" />
              </>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      Вопрос {match.round} из {match.total_rounds}
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Выберите один вариант ответа.
                    </p>
                  </div>
                  {hasSubmitted && (
                    <Badge variant="success" dot>
                      Ваш выбор принят
                    </Badge>
                  )}
                </div>
                {match.question ? (
                  <div className="mx-auto max-w-2xl">
                    <p className="rounded-2xl border border-border bg-bg-secondary px-4 py-4 text-center text-base font-semibold text-text-primary">
                      {match.question.text}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {match.question.options.map((option, index) => (
                        <button
                          key={`${option}-${index}`}
                          type="button"
                          disabled={hasSubmitted}
                          onClick={() => send({ option: index })}
                          className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 text-left text-sm text-text-primary transition-colors hover:border-accent-primary/50 hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-bg-hover text-xs font-bold text-text-secondary">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-text-secondary">
                    Загружаем вопрос...
                  </p>
                )}
              </>
            )}
          </div>

          {hasSubmitted && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-accent-primary/25 bg-accent-primary/5 px-4 py-3 text-sm text-accent-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Ждём выбор соперника...
            </div>
          )}

          {lastRound && (
            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">
                  Результат раунда {lastRound.round}
                </p>
                <Badge variant="info">Round result</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {lastRound.results.map((result) => (
                  <div
                    key={result.username}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs"
                  >
                    <span className="text-text-secondary">
                      {result.username}
                    </span>
                    {result.goal !== undefined ? (
                      <Badge variant={result.goal ? 'success' : 'danger'}>
                        {result.goal ? 'Гол' : 'Сейв'}
                      </Badge>
                    ) : (
                      <Badge variant={result.correct ? 'success' : 'danger'}>
                        {result.correct ? 'Верно' : 'Мимо'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted">
            {connection === 'open' ? (
              <>
                <Wifi className="h-3 w-3 text-accent-primary" />
                Соединение активно. Не закрывайте страницу до конца матча.
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red" />
                Соединение потеряно. Переподключаемся...
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-bg-card to-bg-secondary"
          >
            <div className="relative border-b border-border px-5 py-7 text-center">
              <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="relative mt-3 text-2xl font-extrabold text-text-primary">
                Матч завершён
              </h2>
              <p className="relative mt-1 text-sm text-text-secondary">
                {match?.winner
                  ? `Победитель: ${match.winner}`
                  : 'Ничья — оба игрока показали равный результат'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              {match?.players.map((player) => (
                <div
                  key={player.user_id}
                  className={`rounded-2xl border px-4 py-3 text-center ${
                    player.username === match.winner
                      ? 'border-gold/40 bg-gold/10'
                      : 'border-border bg-bg-secondary'
                  }`}
                >
                  <p className="text-sm font-semibold text-text-primary">
                    {player.username}
                  </p>
                  <p className="mt-1 font-display text-4xl font-extrabold text-text-primary">
                    {formatNumber(match.scores[player.username] ?? 0)}
                  </p>
                  {player.username === match.winner && (
                    <Badge variant="gold" className="mt-1">
                      Победитель
                    </Badge>
                  )}
                  {(() => {
                    const ratingDelta = lastResult?.players?.find(
                      (result) => result.username === player.username,
                    )?.rating_delta;
                    if (ratingDelta === undefined) {
                      return null;
                    }
                    return (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`mt-1 text-xs font-bold ${
                          ratingDelta >= 0 ? 'text-accent-primary' : 'text-red'
                        }`}
                      >
                        ELO {ratingDelta >= 0 ? '+' : ''}
                        {ratingDelta}
                      </motion.p>
                    );
                  })()}
                  {player.user_id !== user?.id && (
                    <Link
                      to={`/app/users/${player.user_id}`}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-primary hover:underline"
                    >
                      Открыть профиль
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {match && match.scores && (
              <div className="px-5">
                <div className="mb-3 flex items-center justify-center gap-3 text-xs text-text-secondary">
                  <span>{match.scores[match.players[0]?.username ?? ''] ?? 0}</span>
                  <span className="text-text-muted">:</span>
                  <span>{match.scores[match.players[1]?.username ?? ''] ?? 0}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 p-5 sm:flex-row">
              <Button
                fullWidth
                loading={rematchMutation.isPending}
                onClick={() => rematchMutation.mutate(room.game_code)}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                Реванш
              </Button>
              <Link to="/app/competitions/rooms" className="flex-1">
                <Button fullWidth variant="secondary">
                  К комнатам
                </Button>
              </Link>
              <Link to="/app/leaderboard" className="flex-1">
                <Button fullWidth variant="ghost">
                  Рейтинг
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {room.status === 'CANCELLED' || room.status === 'EXPIRED' ? (
        <div className="rounded-2xl border border-red/25 bg-red/5 px-4 py-6 text-center text-sm text-red">
          Комната {room.status === 'EXPIRED' ? 'истекла' : 'отменена'}.
          <Link to="/app/competitions/rooms" className="ml-2 underline">
            Создать новую
          </Link>
        </div>
      ) : null}
    </div>
  );
}
