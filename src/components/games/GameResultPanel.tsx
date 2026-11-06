import { motion } from 'framer-motion';
import {
  Clock,
  Coins,
  Home,
  RotateCcw,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { bestScoreKey, useUserStore } from '@/stores/userStore';
import type { GameResult } from '@/types/api';
import { formatNumber } from '@/utils/format';

interface GameResultPanelProps {
  result: GameResult;
  onReplay?: () => void;
  replayLoading?: boolean;
  title?: string;
  children?: ReactNode;
}

export function GameResultPanel({
  result,
  onReplay,
  replayLoading,
  title = 'Игра завершена',
  children,
}: GameResultPanelProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const bestScore = useUserStore((state) =>
    userId
      ? state.bestScores[bestScoreKey(userId, result.game_code)]
      : undefined,
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-bg-card to-bg-secondary"
    >
      <div className="relative border-b border-border px-5 py-8 text-center sm:px-8">
        <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
        <motion.div
          initial={{ scale: 0.4, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/30 bg-gold/10 text-gold"
        >
          <Star className="h-10 w-10" />
        </motion.div>
        <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-text-muted">
          {result.game_name}
        </p>
        <h2 className="relative mt-1 text-2xl font-extrabold text-text-primary">
          {title}
        </h2>
        <div className="relative mt-5">
          <span className="font-display text-5xl font-extrabold text-text-primary">
            {formatNumber(result.score)}
          </span>
          <span className="ml-2 text-sm text-text-secondary">очков</span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-4">
        <div className="px-2 py-4 text-center">
          <Coins className="mx-auto mb-1 h-5 w-5 text-gold" />
          <p className="text-lg font-bold text-text-primary">
            +{formatNumber(result.coins_earned)}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            Монеты
          </p>
        </div>
        <div className="px-2 py-4 text-center">
          <Zap className="mx-auto mb-1 h-5 w-5 text-accent-primary" />
          <p className="text-lg font-bold text-text-primary">
            +{formatNumber(result.xp_earned)}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            XP
          </p>
        </div>
        <div className="px-2 py-4 text-center">
          <Clock className="mx-auto mb-1 h-5 w-5 text-blue" />
          <p className="text-lg font-bold text-text-primary">
            {result.duration_seconds}s
          </p>
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            Время
          </p>
        </div>
        <div className="px-2 py-4 text-center">
          <Trophy className="mx-auto mb-1 h-5 w-5 text-purple" />
          <p className="text-lg font-bold text-text-primary">
            {formatNumber(bestScore ?? result.score)}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            Рекорд
          </p>
        </div>
      </div>

      {children && <div className="border-b border-border px-5 py-4">{children}</div>}

      <div className="flex flex-col gap-2 p-5 sm:flex-row">
        {onReplay && (
          <Button
            fullWidth
            onClick={onReplay}
            loading={replayLoading}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Играть снова
          </Button>
        )}
        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate('/app/games')}
          leftIcon={<Home className="h-4 w-4" />}
        >
          К списку игр
        </Button>
      </div>
    </motion.div>
  );
}
