import { Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { EmptyState } from '@/components/ui/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePvpStore } from '@/stores/pvpStore';
import { formatNumber } from '@/utils/format';

export default function MatchPage() {
  const { matchId = '' } = useParams();
  useDocumentTitle('PvP матч');
  const navigate = useNavigate();
  const lastRoomId = usePvpStore((state) => state.lastRoomId);
  const lastResult = usePvpStore((state) => state.lastResult);

  useEffect(() => {
    if (lastRoomId) {
      navigate(`/app/competitions/rooms/${lastRoomId}`, { replace: true });
    }
  }, [lastRoomId, navigate]);

  if (lastRoomId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-primary">
          Матч {matchId || '—'}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-text-primary">
          PvP матч
        </h1>
      </div>

      {lastResult ? (
        <div className="rounded-3xl border border-border bg-bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Trophy className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Последний результат
              </h2>
              <p className="text-xs text-text-secondary">
                {lastResult.winner
                  ? `Победитель: ${lastResult.winner}`
                  : 'Ничья'}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(lastResult.scores).map(([username, score]) => (
              <div
                key={username}
                className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-center"
              >
                <p className="text-sm font-semibold text-text-primary">
                  {username}
                </p>
                <p className="font-display text-2xl font-extrabold text-text-primary">
                  {formatNumber(score)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Матч недоступен"
          description="Откройте комнату, чтобы посмотреть актуальное состояние матча."
          action={
            <Link
              to="/app/competitions/rooms"
              className="text-sm font-semibold text-accent-primary hover:underline"
            >
              Перейти к комнатам
            </Link>
          }
        />
      )}
    </div>
  );
}
