import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Grid3X3,
  Search,
  ShieldQuestion,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { GameResultPanel } from '@/components/games/GameResultPanel';
import { GameShell } from '@/components/games/GameShell';
import { GameStartCard } from '@/components/games/GameStartCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GAME_META } from '@/constants/games';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMiniGame } from '@/hooks/useMiniGame';
import { playerService } from '@/services/playerService';
import { notify } from '@/stores/notificationStore';
import type { TikiState } from '@/types/api';
import { formatNumber } from '@/utils/format';

export default function TikiTakaPage() {
  useDocumentTitle('Tiki-Taka-Toe');
  const meta = GAME_META.tiki_taka_toe;
  const [mode, setMode] = useState(meta.defaultMode);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const {
    session,
    state,
    result,
    starting,
    acting,
    start,
    act,
    replay,
    reset,
  } = useMiniGame('tiki_taka_toe');

  const { data: players, isFetching } = useQuery({
    queryKey: ['players', 'tiki-taka', debouncedSearch],
    queryFn: () =>
      playerService.list({ name: debouncedSearch.trim(), limit: 8 }),
    enabled:
      selectedCell !== null && debouncedSearch.trim().length >= 2,
    staleTime: 30_000,
  });

  if (!session) {
    return (
      <GameStartCard
        meta={meta}
        mode={mode}
        onModeChange={setMode}
        onStart={() => start(mode)}
        loading={starting}
        rules={[
          'Каждая ячейка — пересечение позиции и национальности.',
          'Введите футболиста, подходящего под оба условия.',
          'Одного игрока нельзя использовать дважды. Три ошибки завершают игру.',
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="purple">Classic</Badge>
          <Badge variant="info">Daily</Badge>
          <Badge variant="success">9 ячеек</Badge>
        </div>
      </GameStartCard>
    );
  }

  const game = (state as unknown as TikiState) ?? null;
  const cells = game?.cells ?? [];
  const filled = game?.filled ?? {};
  const selected = selectedCell === null ? null : cells[selectedCell];

  if (result) {
    return (
      <GameShell
        title={meta.title}
        subtitle="Сетка заполнена"
        backTo="/app/games"
        expiresAt={session.expiresAt}
        totalSeconds={session.timeLimitSeconds}
      >
        <GameResultPanel
          result={result}
          onReplay={() => replay(game?.mode ?? mode)}
          replayLoading={starting}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">
              Правильных ответов:{' '}
              <span className="font-bold text-accent-primary">
                {Object.keys(filled).length}
              </span>{' '}
              из {cells.length}
            </span>
            <span className="text-text-secondary">
              Ошибок:{' '}
              <span className="font-bold text-red">
                {game?.mistakes ?? 0}
              </span>
            </span>
          </div>
        </GameResultPanel>
      </GameShell>
    );
  }

  const placePlayer = async (playerId: string) => {
    if (selectedCell === null) {
      return;
    }
    const response = await act('place', {
      cell_id: selectedCell,
      player_id: playerId,
    });
    if (!response) {
      return;
    }
    if (response.message === 'Correct player') {
      notify.success('Верно!', 'Ячейка занята футболистом.');
      setSelectedCell(null);
    } else {
      notify.warning('Не подходит', response.message ?? 'Попробуйте другого игрока');
    }
    setSearch('');
  };

  return (
    <GameShell
      title={meta.title}
      subtitle="Выберите ячейку и найдите подходящего футболиста"
      backTo="/app/games"
      expiresAt={session.expiresAt}
      totalSeconds={session.timeLimitSeconds}
      onExpire={reset}
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <Sparkles className="h-3 w-3" />
            {formatNumber(game?.score ?? 0)}
          </Badge>
          <Badge variant="danger">
            Ошибки {game?.mistakes ?? 0}/{game?.max_mistakes ?? 3}
          </Badge>
        </div>
      }
      aside={
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-purple" />
              <p className="text-sm font-semibold text-text-primary">
                Прогресс сетки
              </p>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-purple">
              {Object.keys(filled).length}
              <span className="text-lg text-text-muted"> / {cells.length}</span>
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Заполнено ячеек. За каждую верную — 20 очков.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <ShieldQuestion className="h-4 w-4 text-accent-primary" />
              Как играть
            </p>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              <li>1. Нажмите на свободную ячейку.</li>
              <li>2. Введите имя футболиста.</li>
              <li>3. Выберите вариант из подсказок.</li>
              <li>4. Игрок должен подходить под позицию и страну.</li>
            </ul>
          </div>

          {selected && (
            <div className="rounded-2xl border border-accent-primary/30 bg-accent-primary/5 p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">
                Выбранная ячейка
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {selected.position} · {selected.nationality}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                Нужен игрок этой позиции (или дополнительной) из этой страны.
              </p>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {cells.map((cell) => {
            const entry = filled[String(cell.cell_id)];
            const isSelected = selectedCell === cell.cell_id;
            return (
              <motion.button
                key={cell.cell_id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setSelectedCell((current) =>
                    current === cell.cell_id ? null : cell.cell_id,
                  )
                }
                className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center transition-all ${
                  entry
                    ? 'border-accent-primary/40 bg-accent-primary/10'
                    : isSelected
                      ? 'border-accent-primary bg-accent-primary/15 ring-2 ring-accent-primary/40'
                      : 'border-border bg-bg-card hover:border-accent-primary/40'
                }`}
              >
                <span className="rounded-full bg-bg-hover px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                  {cell.position}
                </span>
                <span className="max-w-full truncate text-[10px] text-text-muted">
                  {cell.nationality}
                </span>
                {entry ? (
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-accent-primary">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{entry.player_name}</span>
                  </span>
                ) : (
                  <span className="mt-1 text-[10px] text-text-muted">
                    {isSelected ? 'Выбрано' : 'Свободно'}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-text-primary">
              {selected
                ? `Футболист: ${selected.position} · ${selected.nationality}`
                : 'Выберите ячейку на сетке'}
            </p>
            {selected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedCell(null);
                  setSearch('');
                }}
              >
                Сбросить
              </Button>
            )}
          </div>
          <Input
            placeholder={
              selected
                ? 'Начните вводить имя футболиста...'
                : 'Сначала выберите ячейку'
            }
            value={search}
            disabled={!selected}
            leftIcon={<Search className="h-4 w-4" />}
            onChange={(event) => setSearch(event.target.value)}
          />
          {selected && search.trim().length >= 2 && (
            <div className="mt-3 space-y-1.5">
              {isFetching && (
                <p className="text-xs text-text-muted">Поиск...</p>
              )}
              {(players?.data ?? []).map((player) => (
                <button
                  key={player.id}
                  type="button"
                  disabled={acting}
                  onClick={() => void placePlayer(player.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2 text-left transition-colors hover:border-accent-primary/50 hover:bg-bg-hover disabled:opacity-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-text-primary">
                      {player.full_name}
                    </span>
                    <span className="block truncate text-[11px] text-text-muted">
                      {player.primary_position} · {player.current_club}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-text-secondary">
                    {player.nationality}
                  </span>
                </button>
              ))}
              {!isFetching && players?.data.length === 0 && (
                <p className="text-xs text-text-muted">Ничего не найдено.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
