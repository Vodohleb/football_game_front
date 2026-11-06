import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Search, Shield, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CardPlaceholder, PlayerCard } from '@/components/cards/PlayerCard';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cardService } from '@/services/cardService';
import { squadService } from '@/services/squadService';
import { notify } from '@/stores/notificationStore';
import type { Formation, Squad } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatNumber } from '@/utils/format';

const SLOT_COORDS: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 90 },
  LB: { x: 12, y: 72 },
  CB1: { x: 36, y: 74 },
  CB2: { x: 64, y: 74 },
  CB3: { x: 50, y: 74 },
  RB: { x: 88, y: 72 },
  LWB: { x: 10, y: 58 },
  RWB: { x: 90, y: 58 },
  CDM: { x: 50, y: 60 },
  CDM1: { x: 38, y: 60 },
  CDM2: { x: 62, y: 60 },
  CM1: { x: 30, y: 48 },
  CM2: { x: 50, y: 48 },
  CM3: { x: 70, y: 48 },
  LM: { x: 12, y: 48 },
  RM: { x: 88, y: 48 },
  CAM: { x: 50, y: 36 },
  LW: { x: 15, y: 22 },
  RW: { x: 85, y: 22 },
  ST: { x: 50, y: 12 },
  ST1: { x: 36, y: 12 },
  ST2: { x: 64, y: 12 },
};

function slotCoords(slotId: string, index: number) {
  return SLOT_COORDS[slotId] ?? { x: 20 + (index % 4) * 20, y: 15 + Math.floor(index / 4) * 25 };
}

export default function SquadPage() {
  useDocumentTitle('Мой состав');
  const queryClient = useQueryClient();
  const [selectedSquadId, setSelectedSquadId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState('My Squad');
  const [newFormation, setNewFormation] = useState('4-3-3');
  const [playerSearch, setPlayerSearch] = useState('');
  const [showAllPositions, setShowAllPositions] = useState(false);

  const { data: formations } = useQuery({
    queryKey: ['formations'],
    queryFn: squadService.formations,
    staleTime: 10 * 60_000,
  });
  const squadsQuery = useQuery({
    queryKey: ['squads'],
    queryFn: squadService.list,
  });
  const collectionQuery = useQuery({
    queryKey: ['collection', 'squad-picker'],
    queryFn: () => cardService.collection({ page: 1, limit: 100, sort: 'rating_desc' }),
  });
  const squadQuery = useQuery({
    queryKey: ['squads', selectedSquadId],
    queryFn: () => squadService.detail(selectedSquadId as string),
    enabled: Boolean(selectedSquadId),
  });

  const squads = squadsQuery.data ?? [];
  const squad = squadQuery.data;
  const formation = useMemo(
    () => formations?.find((item) => item.code === squad?.formation),
    [formations, squad?.formation],
  );
  const collection = collectionQuery.data?.data ?? [];

  useEffect(() => {
    if (!selectedSquadId && squads.length > 0) {
      const active = squads.find((item) => item.is_active) ?? squads[0];
      setSelectedSquadId(active.id);
    }
  }, [squads, selectedSquadId]);

  const invalidate = (squadId?: string) => {
    queryClient.invalidateQueries({ queryKey: ['squads'] });
    if (squadId) {
      queryClient.invalidateQueries({ queryKey: ['squads', squadId] });
    }
  };

  const createMutation = useMutation({
    mutationFn: () =>
      squadService.create({
        name: newName.trim(),
        formation: newFormation,
        is_active: squads.length === 0,
      }),
    onSuccess: (data) => {
      setSelectedSquadId(data.id);
      setCreateOpen(false);
      invalidate();
      notify.success('Состав создан', data.name);
    },
    onError: (error) => notify.error('Не удалось создать состав', errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => squadService.remove(selectedSquadId as string),
    onSuccess: () => {
      setSelectedSquadId(null);
      setDeleteOpen(false);
      invalidate();
      notify.success('Состав удалён');
    },
    onError: (error) => notify.error('Не удалось удалить состав', errorMessage(error)),
  });

  const slotMutation = useMutation({
    mutationFn: ({ slotId, userCardId }: { slotId: string; userCardId: string | null }) =>
      squadService.updateSlot(selectedSquadId as string, slotId, userCardId),
    onSuccess: () => {
      invalidate(selectedSquadId ?? undefined);
      setSelectedSlot(null);
      notify.success('Состав обновлён');
    },
    onError: (error) => notify.error('Не удалось изменить состав', errorMessage(error)),
  });

  const formationMutation = useMutation({
    mutationFn: (code: string) =>
      squadService.update(selectedSquadId as string, { formation: code }),
    onSuccess: () => {
      invalidate(selectedSquadId ?? undefined);
      notify.success('Схема изменена');
    },
    onError: (error) => notify.error('Не удалось изменить схему', errorMessage(error)),
  });

  const createModal = (
    <Modal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      title="Новый состав"
      description="Дайте составу имя и выберите схему. Игроков добавите на поле."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
            disabled={!newName.trim()}
          >
            Создать
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Название"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          maxLength={64}
        />
        <Select
          label="Схема"
          options={(formations ?? []).map((item: Formation) => ({
            value: item.code,
            label: item.name,
          }))}
          value={newFormation}
          onChange={(event) => setNewFormation(event.target.value)}
        />
      </div>
    </Modal>
  );

  if (squadsQuery.isLoading) {
    return <LoadingScreen label="Загружаем составы..." />;
  }

  if (squadsQuery.isError) {
    return (
      <ErrorState
        error={squadsQuery.error}
        onRetry={() => squadsQuery.refetch()}
      />
    );
  }

  if (squads.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Мой клуб"
          title="Мой состав"
          subtitle="Создайте состав, выберите схему и расставьте карточки."
        />
        <EmptyState
          icon={<Shield className="h-6 w-6" />}
          title="У вас пока нет состава"
          description="Создайте первый состав и заполните его карточками из коллекции."
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Создать состав
            </Button>
          }
        />
        {createModal}
      </div>
    );
  }

  const selectedSlotData = formation?.slots.find(
    (slot) => slot.slot_id === selectedSlot,
  );
  const usedUserCardIds = new Set(
    (squad?.players ?? []).map((player) => player.user_card_id),
  );
  const compatibleCards = collection
    .filter((userCard) => !usedUserCardIds.has(userCard.id))
    .filter((userCard) =>
      playerSearch.trim()
        ? userCard.card.player_full_name
            .toLowerCase()
            .includes(playerSearch.trim().toLowerCase())
        : true,
    )
    .filter((userCard) =>
      showAllPositions || !selectedSlotData
        ? true
        : userCard.card.position === selectedSlotData.position,
    )
    .sort((a, b) => {
      if (!selectedSlotData) return 0;
      const aMatch = a.card.position === selectedSlotData.position ? 1 : 0;
      const bMatch = b.card.position === selectedSlotData.position ? 1 : 0;
      return bMatch - aMatch || b.card.overall_rating - a.card.overall_rating;
    });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Мой клуб"
        title="Мой состав"
        subtitle="Изменения сохраняются на сервере автоматически."
        actions={
          <>
            <Link to="/app/club/collection">
              <Button variant="secondary" size="sm" leftIcon={<Users className="h-4 w-4" />}>
                Коллекция
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Новый состав
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            Состав
          </p>
          <Select
            className="mt-1"
            options={squads.map((item) => ({
              value: item.id,
              label: `${item.name}${item.is_active ? ' · активный' : ''}`,
            }))}
            value={selectedSquadId ?? ''}
            onChange={(event) => setSelectedSquadId(event.target.value)}
            aria-label="Выбор состава"
          />
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            Схема
          </p>
          <Select
            className="mt-1"
            options={(formations ?? []).map((item: Formation) => ({
              value: item.code,
              label: item.name,
            }))}
            value={squad?.formation ?? '4-3-3'}
            onChange={(event) => formationMutation.mutate(event.target.value)}
            disabled={formationMutation.isPending}
            aria-label="Схема"
          />
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <p className="text-[10px] uppercase tracking-wide text-text-muted">
            Средний OVR
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-accent-primary">
            {(squad?.rating ?? 0).toFixed(1)}
          </p>
          <ProgressBar
            value={squad?.filled_slots ?? 0}
            max={squad?.total_slots ?? 11}
            className="mt-2"
          />
          <p className="mt-1 text-[11px] text-text-muted">
            {squad?.filled_slots ?? 0} из {squad?.total_slots ?? 11} позиций
          </p>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-bg-card p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              Управление
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {squad?.name ?? '—'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 justify-start text-red hover:bg-red/10 hover:text-red"
            onClick={() => setDeleteOpen(true)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Удалить состав
          </Button>
        </div>
      </div>

      {squadQuery.isLoading ? (
        <LoadingScreen label="Загружаем состав..." />
      ) : squadQuery.isError ? (
        <ErrorState error={squadQuery.error} onRetry={() => squadQuery.refetch()} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="pitch relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 p-3 sm:min-h-[600px]">
            <div className="pointer-events-none absolute inset-3 rounded-2xl border border-white/15" />
            <div className="pointer-events-none absolute left-1/2 top-3 h-24 w-48 -translate-x-1/2 rounded-b-2xl border border-white/15 sm:w-64" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 h-24 w-48 -translate-x-1/2 rounded-t-2xl border border-white/15 sm:w-64" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />

            {(formation?.slots ?? []).map((slot, index) => {
              const coords = slotCoords(slot.slot_id, index);
              const placed = squad?.players.find(
                (player) => player.slot_id === slot.slot_id,
              );
              return (
                <div
                  key={slot.slot_id}
                  className="absolute w-[19%] max-w-28 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  {placed ? (
                    <PlayerCard
                      card={placed.card}
                      size="xs"
                      showStats={false}
                      onClick={() => setSelectedSlot(slot.slot_id)}
                    />
                  ) : (
                    <CardPlaceholder
                      position={slot.position}
                      className="h-20 sm:h-24"
                      onClick={() => {
                        setSelectedSlot(slot.slot_id);
                        setPlayerSearch('');
                        setShowAllPositions(false);
                      }}
                    />
                  )}
                  <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-wider text-white/50">
                    {slot.position}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">
                  Заполнение
                </p>
                <Badge variant="success">
                  {squad?.filled_slots ?? 0}/{squad?.total_slots ?? 11}
                </Badge>
              </div>
              <div className="mt-3 space-y-1.5">
                {(formation?.slots ?? []).map((slot) => {
                  const placed = squad?.players.find(
                    (player) => player.slot_id === slot.slot_id,
                  );
                  return (
                    <button
                      key={slot.slot_id}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot.slot_id);
                        setPlayerSearch('');
                        setShowAllPositions(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-bg-secondary px-2.5 py-1.5 text-left text-xs transition-colors hover:border-accent-primary/40"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-9 font-bold text-text-muted">
                          {slot.position}
                        </span>
                        <span
                          className={
                            placed
                              ? 'truncate text-text-primary'
                              : 'text-text-muted'
                          }
                        >
                          {placed ? placed.card.player_name : 'Пусто'}
                        </span>
                      </span>
                      {placed ? (
                        <Check className="h-3.5 w-3.5 text-accent-primary" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-text-muted" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4 text-xs text-text-secondary">
              <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Shield className="h-4 w-4 text-accent-primary" />
                Правила состава
              </p>
              <ul className="mt-2 space-y-1.5">
                <li>• 11 позиций по выбранной схеме.</li>
                <li>• Нельзя использовать одну карточку дважды.</li>
                <li>• Позиция карточки должна подходить ячейке.</li>
                <li>• Используются только ваши карточки.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-4">
              <p className="text-sm font-semibold text-text-primary">
                Стоимость состава
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-text-primary">
                {formatNumber(
                  (squad?.players ?? []).reduce(
                    (sum, player) => sum + player.card.overall_rating,
                    0,
                  ),
                )}
              </p>
              <p className="text-[11px] text-text-muted">суммарный OVR</p>
            </div>
          </div>
        </div>
      )}

      {createModal}

      <Modal
        open={selectedSlot !== null}
        onClose={() => setSelectedSlot(null)}
        title={`Позиция ${selectedSlotData?.position ?? ''}`}
        description="Выберите карточку из коллекции или снимите игрока с позиции."
        size="lg"
        footer={
          selectedSlot &&
          squad?.players.some((player) => player.slot_id === selectedSlot) ? (
            <Button
              variant="danger"
              onClick={() =>
                slotMutation.mutate({ slotId: selectedSlot, userCardId: null })
              }
              loading={slotMutation.isPending}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Убрать игрока
            </Button>
          ) : null
        }
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Поиск карточки..."
              value={playerSearch}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => setPlayerSearch(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => setShowAllPositions((value) => !value)}
            >
              {showAllPositions ? 'Только подходящие' : 'Показать все'}
            </Button>
          </div>
          {compatibleCards.length === 0 ? (
            <EmptyState
              title="Нет подходящих карточек"
              description="Откройте пак или покажите все позиции."
              className="py-8"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {compatibleCards.slice(0, 30).map((userCard) => {
                const matches =
                  !selectedSlotData ||
                  userCard.card.position === selectedSlotData.position;
                return (
                  <PlayerCard
                    key={userCard.id}
                    card={userCard.card}
                    size="xs"
                    badge={
                      matches ? (
                        <span className="rounded bg-accent-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-accent-primary">
                          {userCard.card.position}
                        </span>
                      ) : (
                        <span className="rounded bg-black/20 px-1.5 py-0.5 text-[9px] text-white/50">
                          {userCard.card.position}
                        </span>
                      )
                    }
                    disabled={slotMutation.isPending}
                    onClick={() =>
                      selectedSlot &&
                      slotMutation.mutate({
                        slotId: selectedSlot,
                        userCardId: userCard.id,
                      })
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Удалить состав?"
        description={squad ? `Состав «${squad.name}» будет удалён.` : undefined}
        confirmLabel="Удалить"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
