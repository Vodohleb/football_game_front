import { AnimatePresence, motion } from 'framer-motion';
import { Crosshair, Goal, Shield, Target, X } from 'lucide-react';
import { useState } from 'react';

import { GameResultPanel } from '@/components/games/GameResultPanel';
import { GameShell } from '@/components/games/GameShell';
import { GameStartCard } from '@/components/games/GameStartCard';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GAME_META } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMiniGame } from '@/hooks/useMiniGame';
import type { PenaltyState } from '@/types/api';
import { formatNumber, formatPercent } from '@/utils/format';

export default function PenaltyPage() {
  useDocumentTitle('Penalty Shootout');
  const meta = GAME_META.penalty;
  const [mode, setMode] = useState(meta.defaultMode);
  const { session, state, result, starting, acting, start, act, replay } =
    useMiniGame('penalty');

  if (!session) {
    return (
      <GameStartCard
        meta={meta}
        mode={mode}
        onStart={() => start(mode)}
        onModeChange={setMode}
        loading={starting}
        rules={[
          'Ворота разделены на 9 секторов. Выберите сектор удара.',
          'Normal: вратарь закрывает один случайный сектор. Hard: чаще угадывает.',
          'Серия состоит из 5 ударов. За 5 голов начисляется бонус.',
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="danger">Normal</Badge>
          <Badge variant="gold">Hard</Badge>
          <Badge variant="info">5 ударов</Badge>
        </div>
      </GameStartCard>
    );
  }

  const game = (state as unknown as PenaltyState) ?? null;
  const shots = game?.shots ?? 0;
  const goals = game?.goals ?? 0;
  const lastShot = game?.log?.[game.log.length - 1];
  const accuracy = shots > 0 ? (goals / shots) * 100 : 0;

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
          onReplay={() => replay(game?.mode ?? mode)}
          replayLoading={starting}
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-2xl font-extrabold text-accent-primary">
                {goals}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-text-muted">
                Голов
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-red">
                {shots - goals}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-text-muted">
                Сейвов
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-blue">
                {formatPercent(accuracy)}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-text-muted">
                Точность
              </p>
            </div>
          </div>
        </GameResultPanel>
      </GameShell>
    );
  }

  return (
    <GameShell
      title={meta.title}
      subtitle="Выберите сектор для удара"
      backTo="/app/games"
      expiresAt={session.expiresAt}
      totalSeconds={session.timeLimitSeconds}
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant="success">{game?.mode ?? mode}</Badge>
          <Badge variant="info">
            <Target className="h-3 w-3" />
            {formatNumber(game?.score ?? 0)}
          </Badge>
        </div>
      }
      aside={
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                Серия
              </p>
              <span className="text-xs text-text-secondary">
                {shots} / {game?.max_shots ?? 5}
              </span>
            </div>
            <ProgressBar
              value={shots}
              max={game?.max_shots ?? 5}
              className="mt-3"
            />
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-accent-primary/20 bg-accent-primary/5 py-2.5">
                <p className="font-display text-2xl font-extrabold text-accent-primary">
                  {goals}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-text-muted">
                  Голы
                </p>
              </div>
              <div className="rounded-xl border border-red/20 bg-red/5 py-2.5">
                <p className="font-display text-2xl font-extrabold text-red">
                  {shots - goals}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-text-muted">
                  Сейвы
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">
              История ударов
            </p>
            <div className="space-y-1.5">
              {(game?.log ?? []).map((shot) => (
                <div
                  key={shot.shot}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary px-2.5 py-1.5 text-xs"
                >
                  <span className="text-text-muted">#{shot.shot}</span>
                  <span className="text-text-secondary">
                    сектор {shot.sector + 1}
                  </span>
                  <span
                    className={
                      shot.goal
                        ? 'font-semibold text-accent-primary'
                        : 'font-semibold text-red'
                    }
                  >
                    {shot.goal ? 'Гол' : 'Сейв'}
                  </span>
                </div>
              ))}
              {shots === 0 && (
                <p className="text-xs text-text-muted">
                  Ударов пока нет. Выберите сектор на воротах.
                </p>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#0d2018] to-bg-primary p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-t-2xl border-x-4 border-t-4 border-white/70 bg-[#0b1712] p-2 sm:p-3">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
              }}
            />
            <div className="relative grid aspect-[3/2] grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2">
              {Array.from({ length: 9 }).map((_, index) => {
                const selected = lastShot?.sector === index;
                const keeper = lastShot?.keeper_sector === index;
                const goal = selected && lastShot?.goal;
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={acting || Boolean(game?.finished)}
                    onClick={() => void act('shoot', { sector: index })}
                    className={`group relative flex items-center justify-center rounded-lg border transition-all ${
                      selected
                        ? goal
                          ? 'border-accent-primary bg-accent-primary/25'
                          : 'border-red bg-red/25'
                        : 'border-white/10 bg-white/[0.03] hover:border-accent-primary/50 hover:bg-accent-primary/10'
                    } disabled:cursor-not-allowed`}
                    aria-label={`Сектор ${index + 1}`}
                  >
                    <Crosshair className="h-6 w-6 text-white/10 transition-colors group-hover:text-accent-primary/60" />
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        {goal ? (
                          <Goal className="h-8 w-8 text-accent-primary drop-shadow" />
                        ) : (
                          <Shield className="h-8 w-8 text-red drop-shadow" />
                        )}
                      </span>
                    )}
                    {keeper && (
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-blue/20 px-1.5 py-0.5 text-[9px] font-bold text-blue">
                        GK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="h-1 rounded-b bg-white/70" />
          <div className="mx-auto mt-3 h-16 w-10 rounded-b-full bg-gradient-to-b from-transparent to-accent-primary/10" />
        </div>

        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg-card/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Crosshair className="h-4 w-4 text-accent-primary" />
            {shots >= (game?.max_shots ?? 5)
              ? 'Серия завершена'
              : `Удар ${shots + 1} из ${game?.max_shots ?? 5}`}
          </div>
          <AnimatePresence mode="wait">
            {lastShot && (
              <motion.div
                key={lastShot.shot}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-1.5 text-sm font-bold ${
                  lastShot.goal ? 'text-accent-primary' : 'text-red'
                }`}
              >
                {lastShot.goal ? (
                  <>
                    <Goal className="h-4 w-4" /> ГОЛ!
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" /> СЕЙВ
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameShell>
  );
}
