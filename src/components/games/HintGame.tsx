import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  Lightbulb,
  Search,
  Sparkles,
  UserRound,
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
import type { HintGameState } from '@/types/api';
import { formatNumber } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';

interface HintGameProps {
  gameCode: 'guess_player' | 'mystery_player';
  variant: 'guess' | 'mystery';
}

export function HintGame({ gameCode, variant }: HintGameProps) {
  const meta = GAME_META[gameCode];
  useDocumentTitle(meta.title);
  const [mode, setMode] = useState(meta.defaultMode);
  const [answer, setAnswer] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedAnswer = useDebouncedValue(answer, 300);
  const { session, state, result, starting, acting, start, act, replay } =
    useMiniGame(gameCode);

  const { data: suggestions } = useQuery({
    queryKey: ['players', 'search', debouncedAnswer],
    queryFn: () =>
      playerService.list({ name: debouncedAnswer.trim(), limit: 6 }),
    enabled: debouncedAnswer.trim().length >= 2 && showSuggestions,
    staleTime: 60_000,
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
          'Игра загадывает одного футболиста и открывает первую подсказку.',
          'Каждая новая подсказка снижает возможные очки.',
          'На ответ даётся три попытки. Регистр и кириллица/латиница не важны.',
        ]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">Classic</Badge>
          <Badge variant="success">Daily</Badge>
          <Badge variant="gold">До 100 очков</Badge>
        </div>
      </GameStartCard>
    );
  }

  const game = (state as unknown as HintGameState) ?? null;
  const potentialScore = Math.max(10, 100 - 20 * ((game?.hints_revealed ?? 1) - 1));
  const attemptsLeft = (game?.max_attempts ?? 3) - (game?.attempts ?? 0);

  if (result) {
    const answerName = String(result.result_data.answer ?? game?.answer ?? '—');
    return (
      <GameShell
        title={meta.title}
        subtitle="Результат"
        backTo="/app/games"
        expiresAt={session.expiresAt}
        totalSeconds={session.timeLimitSeconds}
      >
        <GameResultPanel
          result={result}
          onReplay={() => replay(game?.mode ?? mode)}
          replayLoading={starting}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">
                Загаданный футболист
              </p>
              <p className="mt-1 text-lg font-bold text-accent-primary">
                {answerName}
              </p>
            </div>
            <div className="text-right text-xs text-text-secondary">
              <p>Подсказок открыто: {game?.hints_revealed ?? '—'}</p>
              <p>Попыток использовано: {game?.attempts ?? 0}</p>
            </div>
          </div>
        </GameResultPanel>
      </GameShell>
    );
  }

  const submitAnswer = async () => {
    if (!answer.trim() || acting) {
      return;
    }
    const response = await act('answer', { answer: answer.trim() });
    if (!response) {
      return;
    }
    if (response.finished) {
      setShowSuggestions(false);
      return;
    }
    if (response.message === 'Wrong answer') {
      notify.warning('Неверный ответ', `Осталось попыток: ${attemptsLeft - 1}`);
    }
    setAnswer('');
    setShowSuggestions(false);
  };

  return (
    <GameShell
      title={meta.title}
      subtitle={
        variant === 'mystery'
          ? 'Раскрывайте подсказки и угадайте игрока'
          : 'Угадайте футболиста по подсказкам'
      }
      backTo="/app/games"
      expiresAt={session.expiresAt}
      totalSeconds={session.timeLimitSeconds}
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant="info">
            <Sparkles className="h-3 w-3" />
            {formatNumber(potentialScore)}
          </Badge>
          <Badge variant="danger">
            {Array.from({ length: Math.max(0, attemptsLeft) }).map((_, index) => (
              <Heart key={index} className="h-3 w-3 fill-current" />
            ))}
          </Badge>
        </div>
      }
      aside={
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-text-primary">
                Подсказки
              </p>
              <span className="ml-auto text-xs text-text-muted">
                {game?.hints_revealed}/{game?.hints_total}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {(game?.hints ?? []).map((hint, index) => (
                <motion.div
                  key={`${hint}-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs text-text-secondary"
                >
                  {hint}
                </motion.div>
              ))}
            </div>
            <Button
              className="mt-3"
              fullWidth
              variant="secondary"
              size="sm"
              disabled={
                acting ||
                (game?.hints_revealed ?? 0) >= (game?.hints_total ?? 0)
              }
              onClick={() => void act('reveal_hint')}
              leftIcon={<Eye className="h-3.5 w-3.5" />}
            >
              {(game?.hints_revealed ?? 0) >= (game?.hints_total ?? 0)
                ? 'Все подсказки открыты'
                : 'Открыть подсказку'}
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-bg-card p-4 text-xs text-text-secondary">
            <p className="font-semibold text-text-primary">Правила</p>
            <ul className="mt-2 space-y-1.5">
              <li>• 1 подсказка — 100 очков</li>
              <li>• 2 подсказки — 80 очков</li>
              <li>• 3 подсказки — 60 очков</li>
              <li>• 4 подсказки — 40 очков</li>
              <li>• 5 подсказок — 20 очков</li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {variant === 'mystery' && (
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/50 via-bg-card to-bg-secondary p-6 text-center">
            <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
            <div className="relative mx-auto flex h-32 w-28 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30">
              <UserRound className="h-16 w-16 text-white/20" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Mystery
              </span>
            </div>
            <p className="relative mt-4 text-sm font-semibold text-text-primary">
              Кто этот футболист?
            </p>
            <p className="relative mt-1 text-xs text-text-secondary">
              Открыто подсказок: {game?.hints_revealed} из {game?.hints_total}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-text-primary">
              Ваш ответ
            </p>
            <span className="text-xs text-text-muted">
              Попытки: {game?.attempts ?? 0}/{game?.max_attempts ?? 3}
            </span>
          </div>
          <div className="relative flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Input
                placeholder="Введите имя футболиста..."
                value={answer}
                autoComplete="off"
                leftIcon={<Search className="h-4 w-4" />}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void submitAnswer();
                  }
                }}
              />
              {showSuggestions &&
                suggestions &&
                suggestions.data.length > 0 &&
                answer.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-2xl">
                    {suggestions.data.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => {
                          setAnswer(player.full_name);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-bg-hover"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-text-primary">
                            {player.full_name}
                          </span>
                          <span className="block truncate text-[10px] text-text-muted">
                            {player.current_club} · {player.primary_position}
                          </span>
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {player.nationality}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <Button
              size="lg"
              className="sm:w-36"
              loading={acting}
              disabled={!answer.trim()}
              onClick={() => void submitAnswer()}
            >
              Ответить
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            Поддерживаются латиница и кириллица. Можно ответить только фамилией.
          </p>
        </div>
      </div>
    </GameShell>
  );
}
