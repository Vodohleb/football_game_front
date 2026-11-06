import { useQuery } from '@tanstack/react-query';
import { Filter, Layers, Search, Shield, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PlayerCard } from '@/components/cards/PlayerCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cardService } from '@/services/cardService';
import { playerService } from '@/services/playerService';
import { RARITY_ORDER, rarityStyle } from '@/utils/rarity';

export default function CollectionPage() {
  useDocumentTitle('Моя коллекция');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [rarity, setRarity] = useState('all');
  const [position, setPosition] = useState('');
  const [sort, setSort] = useState('rating_desc');

  const { data: positions } = useQuery({
    queryKey: ['players', 'positions'],
    queryFn: playerService.positions,
    staleTime: 5 * 60_000,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'collection',
      page,
      debouncedSearch,
      rarity,
      position,
      sort,
    ],
    queryFn: () =>
      cardService.collection({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        rarity: rarity === 'all' ? undefined : rarity,
        position: position || undefined,
        sort,
      }),
  });

  const cards = data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Мой клуб"
        title="Коллекция карточек"
        subtitle="Все карточки, которые вы получили из паков, игр и наград."
        actions={
          <>
            <Link to="/app/club/squad">
              <Button variant="secondary" leftIcon={<Shield className="h-4 w-4" />}>
                Мой состав
              </Button>
            </Link>
            <Link to="/app/shop/packs">
              <Button leftIcon={<ShoppingBag className="h-4 w-4" />}>
                Открыть пак
              </Button>
            </Link>
          </>
        }
      />

      <div className="rounded-2xl border border-border bg-bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Поиск по имени..."
            value={search}
            leftIcon={<Search className="h-4 w-4" />}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: '', label: 'Все позиции' },
              ...(positions ?? []).map((item) => ({
                value: item,
                label: item,
              })),
            ]}
            value={position}
            onChange={(event) => {
              setPosition(event.target.value);
              setPage(1);
            }}
            aria-label="Позиция"
          />
          <Select
            options={[
              { value: 'rating_desc', label: 'Сначала высокий OVR' },
              { value: 'rating_asc', label: 'Сначала низкий OVR' },
              { value: 'name_asc', label: 'По имени' },
              { value: 'acquired_desc', label: 'Сначала новые' },
            ]}
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            aria-label="Сортировка"
          />
          <div className="flex items-center justify-end gap-2 text-xs text-text-secondary">
            <Filter className="h-4 w-4" />
            {data?.meta ? `${data.meta.total} карточек` : '—'}
          </div>
        </div>

        <Tabs
          className="mt-4"
          scrollable
          items={[
            { value: 'all', label: 'Все' },
            ...RARITY_ORDER.map((item) => ({
              value: item,
              label: rarityStyle(item).label,
            })),
          ]}
          value={rarity}
          onChange={(value) => {
            setRarity(value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <SkeletonGrid count={10} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="Коллекция пуста"
          description="Откройте первый пак или сыграйте в мини-игру, чтобы получить карточки."
          action={
            <Link to="/app/shop/packs">
              <Button>Перейти в магазин</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((userCard) => (
              <PlayerCard
                key={userCard.id}
                card={userCard.card}
                size="sm"
                onClick={() => navigate(`/app/club/cards/${userCard.id}`)}
                badge={
                  userCard.acquired_from ? (
                    <span className="rounded bg-black/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/60">
                      {userCard.acquired_from}
                    </span>
                  ) : undefined
                }
              />
            ))}
          </div>
          <Pagination
            meta={data?.meta}
            onPageChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
}
