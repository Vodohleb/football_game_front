import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

import { GameResultPanel } from '@/components/games/GameResultPanel';
import { GameShell } from '@/components/games/GameShell';
import { GameStartCard } from '@/components/games/GameStartCard';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GAME_META, STAT_LABELS } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMiniGame } from '@/hooks/useMiniGame';
import type { HigherLowerState, GameActionResponse } from '@/types/api';
import { formatNumber } from '@/utils/format';

export default function HigherLowerPage() {
  useDocumentTitle('Higher or Lower');
  const meta = GAME_META.higher_lower;
  const [mode, setMode] = useState(meta.defaultMode);
  const [lastResponse, setLastResponse] = useState<GameActionResponse | null>(
    null,
  );
  const { session, state, result, starting, acting, start, act, replay } =
    useMiniGame('higher_lower');

  if (!session) {
    return (
      <GameStartCard
        meta={meta}
        mode={mode}
        onModeChange={setMode}
        onStart={() => start(mode)}
        loading={starting}
        rules={[
          'Сравните двух футболистов по выбранной характеристике.',
          'Higher — у следующего игрока значение выше, Lower — ниже.',
          'Classic: 7 раундов и одна ошибка. Endless: игра до 3 ошибок.',
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Classic</Badge>
          <Badge variant="info">Endless</Badge>
          <Badge variant="purple">Daily</Badge>
        </div>
      </GameStartCard>
    );
  }

  const game = (state as unknown as HigherLowerState) ?? null;
  const stat = game?.stat ?? 'overall_rating';
  const statLabel = STAT_LABELS[stat] ?? stat;
  const currentValue = game?.current?.stats?.[stat as keyof typeof game.current.stats];
  const lastLog = lastResponse?.state
    ? ((lastResponse.state as unknown as HigherLowerState).log ?? []).slice(-1)[0]
    : undefined;

  if (result) {
    return (
      <GameShell
        title={meta.title}
        subtitle="Серия завершена"
        backTo="/app/games"
        expiresAt={session.expiresAt}
        totalSeconds={session.timeLimitSeconds}
      >
        <GameResultPanel
          result={result}
          onReplay={() => {
            setLastResponse(null);
            replay(game?.mode ?? mode);
          }}
          replayLoading={starting}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-text-secondary">
              Раундов сыграно:{' '}
              <span className="font-bold text-text-primary">
                {game?.log.length ?? 0}
              </span>
            </span>
            <span className="text-text-secondary">
              Ошибок:{' '}
              <span className="font-bold text-red">{game?.mistakes ?? 0}</span>
            </span>
            <span className="text-text-secondary">
              Режим:{' '}
              <span className="font-bold text-accent-primary">
                {game?.mode ?? mode}
              </span>
            </span>
          </div>
        </GameResultPanel>
      </GameShell>
    );
  }

  const guess = async (choice: 'higher' | 'lower') => {
    const response = await act('guess', { choice });
    if (response) {
      setLastResponse(response);
    }
  };

  return (
    <GameShell
      title={meta.title}
      subtitle={`У кого выше ${statLabel}?`}
      backTo="/app/games"
      expiresAt={session.expiresAt}
      totalSeconds={session.timeLimitSeconds}
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" />
            {formatNumber(game?.score ?? 0)}
          </Badge>
          <Badge variant="danger">
            Ошибки {game?.mistakes ?? 0}/{game?.max_mistakes ?? 1}
          </Badge>
        </div>
      }
      aside={
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">Раунд</p>
              <span className="text-xs text-text-secondary">
                {game?.round ?? 1} / {game?.total_rounds ?? 7}
              </span>
            </div>
            <ProgressBar
              value={game?.round ?? 1}
              max={game?.total_rounds ?? 7}
              className="mt-3"
            />
            <p className="mt-3 text-xs text-text-secondary">
              Ошибок допустимо: {game?.max_mistakes ?? 1}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">
              Последние раунды
            </p>
            <div className="space-y-1.5">
              {(game?.log ?? [])
                .slice(-5)
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.round}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary px-2.5 py-1.5 text-[11px]"
                  >
                    <span className="text-text-muted">#{entry.round}</span>
                    <span className="truncate px-2 text-text-secondary">
                      {entry.current_value} → {entry.next_value}
                    </span>
                    {entry.correct ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent-primary" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red" />
                    )}
                  </div>
                ))}
              {(game?.log?.length ?? 0) === 0 && (
                <p className="text-xs text-text-muted">
                  Сделайте первый выбор.
                </p>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Игрок A
            </p>
            {game?.current ? (
              <PlayerCard card={game.current} size="md" highlightStat={stat} />
            ) : null}
          </div>

          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <div className="rounded-2xl border border-border bg-bg-card px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wide text-text-muted">
                Показатель
              </p>
              <p className="text-sm font-bold text-accent-primary">{statLabel}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-text-primary">
                {typeof currentValue === 'number' ? currentValue : '—'}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
              vs
            </span>
          </div>

          <div>
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Игрок B
            </p>
            {game?.next ? (
              <PlayerCard card={game.next} size="md" highlightStat={stat} />
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            size="lg"
            variant="secondary"
            loading={acting}
            onClick={() => void guess('higher')}
            leftIcon={<ArrowUp className="h-5 w-5 text-accent-primary" />}
          >
            Higher · значение выше
          </Button>
          <Button
            size="lg"
            variant="secondary"
            loading={acting}
            onClick={() => void guess('lower')}
            leftIcon={<ArrowDown className="h-5 w-5 text-red" />}
          >
            Lower · значение ниже
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {lastLog && (
            <motion.div
              key={`${lastLog.round}-${lastLog.correct}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${
                lastLog.correct
                  ? 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary'
                  : 'border-red/30 bg-red/10 text-red'
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                {lastLog.correct ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {lastLog.correct ? 'Верно!' : 'Неверно'}
              </span>
              <span className="text-xs">
                {lastLog.current_player}: {lastLog.current_value} ·{' '}
                {lastLog.next_player}: {lastLog.next_value}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
