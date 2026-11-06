import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService, type AdminCard } from '@/services/adminService';
import { notify } from '@/stores/notificationStore';
import { errorMessage } from '@/utils/errors';
import { RARITY_ORDER, rarityStyle } from '@/utils/rarity';

interface CardForm {
  player_id: string;
  card_name: string;
  rarity: string;
  overall_rating: string;
  pace: string;
  shooting: string;
  passing: string;
  dribbling: string;
  defending: string;
  physical: string;
  card_design: string;
  season: string;
  is_active: boolean;
}

const EMPTY_FORM: CardForm = {
  player_id: '',
  card_name: '',
  rarity: 'common',
  overall_rating: '75',
  pace: '70',
  shooting: '70',
  passing: '70',
  dribbling: '70',
  defending: '70',
  physical: '70',
  card_design: '',
  season: '',
  is_active: true,
};

const STAT_FIELDS: { key: keyof CardForm; label: string }[] = [
  { key: 'pace', label: 'Pace' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defending', label: 'Defending' },
  { key: 'physical', label: 'Physical' },
];

function toNumber(value: string): number {
  return Number.parseInt(value, 10) || 0;
}

export default function AdminCardsPage() {
  useDocumentTitle('Администрирование: карточки');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCard | null>(null);
  const [form, setForm] = useState<CardForm>(EMPTY_FORM);

  const cardsQuery = useQuery({
    queryKey: ['admin', 'cards', page, debouncedSearch],
    queryFn: () => adminService.cards(debouncedSearch, page, 20),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = {
        player_id: form.player_id.trim(),
        card_name: form.card_name.trim(),
        rarity: form.rarity,
        overall_rating: toNumber(form.overall_rating),
        pace: toNumber(form.pace),
        shooting: toNumber(form.shooting),
        passing: toNumber(form.passing),
        dribbling: toNumber(form.dribbling),
        defending: toNumber(form.defending),
        physical: toNumber(form.physical),
        card_design: form.card_design.trim() || null,
        season: form.season.trim() || null,
        is_active: form.is_active,
      };
      return editing
        ? adminService.updateCard(editing.id, body)
        : adminService.createCard(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      notify.success(editing ? 'Карточка обновлена' : 'Карточка создана');
      setOpen(false);
      setEditing(null);
    },
    onError: (error) => notify.error('Не удалось сохранить карточку', errorMessage(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (card: AdminCard) => {
    setEditing(card);
    setForm({
      player_id: card.player_id,
      card_name: card.card_name,
      rarity: card.rarity,
      overall_rating: String(card.overall_rating),
      pace: String(card.pace),
      shooting: String(card.shooting),
      passing: String(card.passing),
      dribbling: String(card.dribbling),
      defending: String(card.defending),
      physical: String(card.physical),
      card_design: card.card_design ?? '',
      season: card.season ?? '',
      is_active: card.is_active,
    });
    setOpen(true);
  };

  const valid =
    (editing || form.player_id.trim().length > 0) &&
    form.card_name.trim().length > 0;

  const cards = cardsQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Карточки"
        subtitle="Создание карточек, характеристики, редкость и доступность."
        actions={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Новая карточка
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Поиск по имени..."
          value={search}
          leftIcon={<Search className="h-4 w-4" />}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Badge variant="info">{cardsQuery.data?.meta?.total ?? 0} карточек</Badge>
      </div>

      {cardsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : cardsQuery.isError ? (
        <ErrorState error={cardsQuery.error} onRetry={() => cardsQuery.refetch()} />
      ) : (
        <div className="space-y-1.5">
          {cards.map((card) => {
            const style = rarityStyle(card.rarity);
            return (
              <div
                key={card.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-secondary font-display text-lg font-extrabold text-text-primary">
                    {card.overall_rating}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {card.player_name}
                    </p>
                    <p className="truncate text-[11px] text-text-muted">
                      {card.card_name} · {card.season ?? '—'} · {card.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={style.chip}>{style.label}</Badge>
                  <Badge variant={card.is_active ? 'success' : 'default'}>
                    {card.is_active ? 'active' : 'off'}
                  </Badge>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(card)}>
                    Изменить
                  </Button>
                </div>
              </div>
            );
          })}
          {cards.length === 0 && (
            <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
              Карточки не найдены
            </div>
          )}
        </div>
      )}

      <Pagination meta={cardsQuery.data?.meta} onPageChange={setPage} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Изменить карточку' : 'Новая карточка'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              loading={saveMutation.isPending}
              disabled={!valid}
            >
              Сохранить
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="ID футболиста"
            value={form.player_id}
            disabled={Boolean(editing)}
            onChange={(event) => setForm({ ...form, player_id: event.target.value })}
            className="sm:col-span-2"
            hint="UUID из базы футболистов"
          />
          <Input
            label="Название карточки"
            value={form.card_name}
            onChange={(event) => setForm({ ...form, card_name: event.target.value })}
          />
          <Select
            label="Редкость"
            options={RARITY_ORDER.map((rarity) => ({
              value: rarity,
              label: rarityStyle(rarity).label,
            }))}
            value={form.rarity}
            onChange={(event) => setForm({ ...form, rarity: event.target.value })}
          />
          <Input
            label="Overall"
            type="number"
            min={0}
            max={99}
            value={form.overall_rating}
            onChange={(event) =>
              setForm({ ...form, overall_rating: event.target.value })
            }
          />
          <Input
            label="Сезон"
            value={form.season}
            onChange={(event) => setForm({ ...form, season: event.target.value })}
          />
          <div className="grid grid-cols-3 gap-2 sm:col-span-2">
            {STAT_FIELDS.map((stat) => (
              <Input
                key={stat.key}
                label={stat.label}
                type="number"
                min={0}
                max={99}
                value={form[stat.key] as string}
                onChange={(event) =>
                  setForm({ ...form, [stat.key]: event.target.value })
                }
              />
            ))}
          </div>
          <Input
            label="Дизайн"
            value={form.card_design}
            onChange={(event) => setForm({ ...form, card_design: event.target.value })}
          />
          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary">
            Активна
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
              className="h-4 w-4 accent-accent-primary"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
