import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Copy, DoorOpen, KeyRound, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GameIcon } from '@/components/games/GameIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { PVP_GAMES } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pvpService } from '@/services/pvpService';
import { notify } from '@/stores/notificationStore';
import { usePvpStore } from '@/stores/pvpStore';
import { errorMessage } from '@/utils/errors';

export default function RoomsPage() {
  useDocumentTitle('Игровые комнаты');
  const navigate = useNavigate();
  const setLastRoom = usePvpStore((state) => state.setLastRoom);
  const lastRoomId = usePvpStore((state) => state.lastRoomId);
  const lastGameCode = usePvpStore((state) => state.lastGameCode);
  const [gameCode, setGameCode] = useState('pvp_penalty');
  const [joinCode, setJoinCode] = useState('');

  const createMutation = useMutation({
    mutationFn: () => pvpService.createRoom(gameCode),
    onSuccess: (room) => {
      setLastRoom(room.id, room.game_code);
      notify.success('Комната создана', `Код: ${room.code}`);
      navigate(`/app/competitions/rooms/${room.id}`);
    },
    onError: (error) => notify.error('Не удалось создать комнату', errorMessage(error)),
  });

  const joinMutation = useMutation({
    mutationFn: () => pvpService.joinRoom(joinCode.trim().toUpperCase()),
    onSuccess: (room) => {
      setLastRoom(room.id, room.game_code);
      notify.success('Вы подключились', `Комната ${room.code}`);
      navigate(`/app/competitions/rooms/${room.id}`);
    },
    onError: (error) => notify.error('Не удалось подключиться', errorMessage(error)),
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Соревнования"
        title="Игровые комнаты"
        subtitle="Создайте комнату и поделитесь кодом с другом или подключитесь по коду."
        actions={
          <Link to="/app/competitions/quick-match">
            <Button variant="secondary">Quick Match</Button>
          </Link>
        }
      />

      {lastRoomId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gold">
            <DoorOpen className="h-4 w-4" />
            Незавершённая комната
            {lastGameCode && (
              <Badge variant="gold">{lastGameCode.replace('pvp_', '')}</Badge>
            )}
          </div>
          <Link to={`/app/competitions/rooms/${lastRoomId}`}>
            <Button size="sm" variant="gold" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Вернуться в комнату
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Создать комнату
              </h2>
              <p className="text-xs text-text-secondary">
                Вы станете хостом, друг подключится по коду
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {PVP_GAMES.map((game) => (
              <button
                key={game.value}
                type="button"
                onClick={() => setGameCode(game.value)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  gameCode === game.value
                    ? 'border-accent-primary/40 bg-accent-primary/10'
                    : 'border-border bg-bg-secondary hover:border-[#3a4b5e]'
                }`}
              >
                <GameIcon code={game.value} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary">
                    {game.label}
                  </span>
                  <span className="block text-[11px] text-text-muted">
                    {game.value === 'pvp_penalty'
                      ? '5 раундов пенальти'
                      : '5 вопросов викторины'}
                  </span>
                </span>
                {gameCode === game.value && (
                  <Badge variant="success">Выбрано</Badge>
                )}
              </button>
            ))}
          </div>

          <Button
            className="mt-5"
            size="lg"
            fullWidth
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Создать комнату
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple/20 bg-purple/10 text-purple">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Подключиться
              </h2>
              <p className="text-xs text-text-secondary">
                Введите код комнаты, который прислал друг
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Input
              label="Код комнаты"
              placeholder="Например, A1B2C3"
              value={joinCode}
              maxLength={16}
              className="text-center font-mono text-lg uppercase tracking-[0.3em]"
              leftIcon={<KeyRound className="h-4 w-4" />}
              onChange={(event) =>
                setJoinCode(event.target.value.toUpperCase())
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' && joinCode.trim().length >= 4) {
                  joinMutation.mutate();
                }
              }}
            />
            <Button
              className="mt-3"
              size="lg"
              fullWidth
              variant="secondary"
              loading={joinMutation.isPending}
              disabled={joinCode.trim().length < 4}
              onClick={() => joinMutation.mutate()}
              leftIcon={<Users className="h-4 w-4" />}
            >
              Подключиться к комнате
            </Button>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-bg-secondary p-3 text-xs text-text-secondary">
            <p className="flex items-center gap-1.5 font-semibold text-text-primary">
              <Copy className="h-3.5 w-3.5 text-accent-primary" />
              Как это работает
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Создатель выбирает режим и создаёт комнату.</li>
              <li>Второй игрок вводит код комнаты.</li>
              <li>Оба нажимают «Готов» — матч начинается автоматически.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
