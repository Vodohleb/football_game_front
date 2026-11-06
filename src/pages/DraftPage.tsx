import { motion } from 'framer-motion';
import { CheckCircle2, Layers3, Trophy } from 'lucide-react';
import { useState } from 'react';

import { GameResultPanel } from '@/components/games/GameResultPanel';
import { GameShell } from '@/components/games/GameShell';
import { GameStartCard } from '@/components/games/GameStartCard';
import { Badge } from '@/components/ui/Badge';
import { CardPlaceholder, PlayerCard } from '@/components/cards/PlayerCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GAME_META } from '@/constants/games';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMiniGame } from '@/hooks/useMiniGame';
import type { DraftState } from '@/types/api';
import { formatNumber } from '@/utils/format';

const SLOT_COORDS: Record<string, { top: string; left: string }> = {
  ST: { top: '8%', left: '50%' },
  LW: { top: '8%', left: '18%' },
  CM: { top: '40%', left: '50%' },
  CB: { top: '68%', left: '28%' },
  GK: { top: '84%', left: '50%' },
};

export default function DraftPage() {
  useDocumentTitle('Draft Challenge');
  const meta = GAME_META.draft;
  const [mode, setMode] = useState(meta.defaultMode);
  const { session, state, result, starting, acting, start, act, replay } =
    useMiniGame('draft');

  if (!session) {
    return (
      <GameStartCard
        meta={meta}
        mode={mode}
        onModeChange={setMode}
        onStart={() => start(mode)}
        loading={starting}
        rules={[
          'Соберите состав из предложенных карточек: на каждую позицию — три варианта.',
          'Выбор изменить нельзя: состав формируется последовательно.',
          'Итоговый рейтинг и награды рассчитывает сервер по сумме OVR.',
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Classic</Badge>
          <Badge variant="info">Daily</Badge>
          <Badge variant="purple">5 позиций</Badge>
        </div>
      </GameStartCard>
    );
  }

  const draft = (state as unknown as DraftState) ?? null;
  const picks = draft?.picks ?? [];
  const positionList = draft?.positions ?? [];
  const activeIndex = draft ? Math.min(draft.round, positionList.length - 1) : 0;
  const totalRating = picks.reduce((sum, pick) => sum + pick.overall_rating, 0);
  const average = picks.length > 0 ? totalRating / picks.length : 0;

  if (result) {
    const resultPicks =
      (result.result_data.picks as typeof picks | undefined) ?? picks;
    return (
      <GameShell
        title={meta.title}
        subtitle="Результат драфта"
        backTo="/app/games"
        expiresAt={session.expiresAt}
        totalSeconds={session.timeLimitSeconds}
      >
        <GameResultPanel
          result={result}
          onReplay={() => replay(draft?.mode ?? mode)}
          replayLoading={starting}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">
                Собранный состав
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-text-secondary">
                  Средний OVR:{' '}
                  <span className="font-bold text-accent-primary">
                    {average.toFixed(1)}
                  </span>
                </span>
                <span className="text-text-muted">
                  {resultPicks.length} / {positionList.length} позиций
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {resultPicks.map((pick) => (
                <PlayerCard key={pick.card_id} card={pick} size="xs" showStats={false} />
              ))}
            </div>
          </div>
        </GameResultPanel>
      </GameShell>
    );
  }

  return (
    <GameShell
      title={meta.title}
      subtitle={`Выбор ${Math.min((draft?.round ?? 0) + 1, positionList.length)} из ${positionList.length}`}
      backTo="/app/games"
      expiresAt={session.expiresAt}
      totalSeconds={session.timeLimitSeconds}
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant="success">{draft?.mode ?? mode}</Badge>
          <Badge variant="info">
            <Trophy className="h-3 w-3" />
            {formatNumber(draft?.score ?? 0)}
          </Badge>
        </div>
      }
      aside={
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                Прогресс драфта
              </p>
              <span className="text-xs text-text-secondary">
                {picks.length}/{positionList.length}
              </span>
            </div>
            <ProgressBar
              value={picks.length}
              max={positionList.length}
              className="mt-3"
            />
            <div className="mt-4 space-y-1.5">
              {positionList.map((position, index) => {
                const pick = picks[index];
                const current = index === activeIndex && !draft?.finished;
                return (
                  <div
                    key={`${position}-${index}`}
                    className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
                      current
                        ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
                        : 'border-border bg-bg-secondary text-text-secondary'
                    }`}
                  >
                    <span className="font-semibold">{position}</span>
                    <span className="truncate pl-2 text-right">
                      {pick ? pick.player_name : current ? 'Выбираем...' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <p className="text-sm font-semibold text-text-primary">
              Средний OVR
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-accent-primary">
              {average.toFixed(1)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Сумма рейтингов: {formatNumber(totalRating)}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="pitch relative min-h-[430px] overflow-hidden rounded-3xl border border-white/10 p-4 sm:min-h-[480px]">
          <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/15" />
          <div className="pointer-events-none absolute left-1/2 top-3 h-20 w-40 -translate-x-1/2 rounded-b-2xl border border-white/15 sm:h-24 sm:w-56" />
          <div className="pointer-events-none absolute bottom-3 left-1/2 h-20 w-40 -translate-x-1/2 rounded-t-2xl border border-white/15 sm:h-24 sm:w-56" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 sm:h-28 sm:w-28" />

          {positionList.map((position, index) => {
            const coords = SLOT_COORDS[position] ?? {
              top: `${20 + index * 14}%`,
              left: '50%',
            };
            const pick = picks[index];
            const current = index === activeIndex && !draft?.finished;
            return (
              <div
                key={`${position}-${index}`}
                className={`absolute w-[28%] min-w-20 max-w-36 -translate-x-1/2 -translate-y-1/2 sm:w-32 ${
                  current ? 'animate-pulse-ring rounded-2xl' : ''
                }`}
                style={coords}
              >
                {pick ? (
                  <PlayerCard card={pick} size="xs" showStats={false} />
                ) : (
                  <CardPlaceholder position={position} className="h-24 sm:h-28" />
                )}
                <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wider text-white/50">
                  {position}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-accent-primary" />
              <p className="text-sm font-bold text-text-primary">
                Выберите карточку на позицию{' '}
                <span className="text-accent-primary">
                  {positionList[activeIndex]}
                </span>
              </p>
            </div>
            <span className="text-xs text-text-muted">
              {draft?.options.length ?? 0} варианта
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(draft?.options ?? []).map((option, index) => (
              <motion.div
                key={option.card_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <PlayerCard
                  card={option}
                  size="sm"
                  disabled={acting || draft?.finished}
                  onClick={async () => {
                    await act('pick', { card_id: option.card_id });
                  }}
                />
              </motion.div>
            ))}
            {(draft?.options?.length ?? 0) === 0 && (
              <p className="col-span-full flex items-center gap-2 rounded-xl border border-accent-primary/20 bg-accent-primary/5 px-3 py-3 text-sm text-accent-primary">
                <CheckCircle2 className="h-4 w-4" />
                Все позиции заполнены. Завершаем драфт...
              </p>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
