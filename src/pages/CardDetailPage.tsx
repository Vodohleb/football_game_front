import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Coins, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { PlayerCard } from '@/components/cards/PlayerCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cardService } from '@/services/cardService';
import { formatDate } from '@/utils/format';
import { rarityStyle } from '@/utils/rarity';

export default function CardDetailPage() {
  const { cardId = '' } = useParams();
  useDocumentTitle('Карточка игрока');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['collection', 'item', cardId],
    queryFn: () => cardService.collectionItem(cardId),
    enabled: Boolean(cardId),
  });

  if (isLoading) {
    return <LoadingScreen label="Загружаем карточку..." />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        error={error ?? new Error('Карточка не найдена')}
        onRetry={() => refetch()}
      />
    );
  }

  const card = data.card;
  const style = rarityStyle(card.rarity);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app/club/collection"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к коллекции
        </Link>
        <Link to="/app/club/squad">
          <Button variant="secondary" size="sm" leftIcon={<Shield className="h-4 w-4" />}>
            В состав
          </Button>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <PlayerCard card={card} size="lg" />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  {card.card_name}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-text-primary">
                  {card.player_full_name}
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  {card.position} · {card.club} · {card.league}
                </p>
              </div>
              <div className="text-right">
                <Badge className={style.chip}>{style.label}</Badge>
                <p className="mt-2 font-display text-4xl font-extrabold text-accent-primary">
                  {card.overall_rating}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-text-muted">
                  Overall
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[
                ['PAC', card.pace],
                ['SHO', card.shooting],
                ['PAS', card.passing],
                ['DRI', card.dribbling],
                ['DEF', card.defending],
                ['PHY', card.physical],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-bg-secondary px-2 py-2 text-center"
                >
                  <p className="text-[10px] text-text-muted">{label}</p>
                  <p className="font-display text-lg font-bold text-text-primary">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <Badge variant="info">Национальность</Badge>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {card.nationality}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <Badge variant="purple">Сезон</Badge>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {card.season ?? '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <Badge variant="success">Источник</Badge>
              <p className="mt-2 text-sm font-semibold text-text-primary">
                {data.acquired_from ?? '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-bg-card px-5 py-4 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-text-muted" />
              Получена {formatDate(data.acquired_at)}
            </span>
            <span className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gold" />
              {card.is_active ? 'Активна' : 'Неактивна'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
