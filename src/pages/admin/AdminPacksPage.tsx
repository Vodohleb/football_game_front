import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Coins, PackageOpen, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { notify } from '@/stores/notificationStore';
import type { Pack } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatNumber } from '@/utils/format';
import { RARITY_ORDER, rarityStyle } from '@/utils/rarity';

interface ProbabilityDraft {
  rarity: string;
  probability: number;
  guaranteed: boolean;
}

interface PackForm {
  code: string;
  name: string;
  description: string;
  price: string;
  cards_count: string;
  image_url: string;
  is_active: boolean;
}

const EMPTY_FORM: PackForm = {
  code: '',
  name: '',
  description: '',
  price: '500',
  cards_count: '3',
  image_url: '',
  is_active: true,
};

const DEFAULT_PROBABILITIES: ProbabilityDraft[] = [
  { rarity: 'common', probability: 100, guaranteed: false },
];

export default function AdminPacksPage() {
  useDocumentTitle('Администрирование: паки');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pack | null>(null);
  const [form, setForm] = useState<PackForm>(EMPTY_FORM);
  const [probabilities, setProbabilities] = useState<ProbabilityDraft[]>(
    DEFAULT_PROBABILITIES,
  );

  const packsQuery = useQuery({
    queryKey: ['admin', 'packs'],
    queryFn: () => adminService.packs(1, 50),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const packBody = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number.parseInt(form.price, 10) || 0,
        cards_count: Number.parseInt(form.cards_count, 10) || 1,
        image_url: form.image_url.trim() || null,
        is_active: form.is_active,
      };
      const pack = editing
        ? await adminService.updatePack(editing.id, packBody)
        : await adminService.createPack(packBody);
      await adminService.replacePackProbabilities(
        pack.id,
        probabilities.map((probability) => ({
          rarity: probability.rarity,
          probability: probability.probability,
          guaranteed: probability.guaranteed,
        })),
      );
      return pack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'packs'] });
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      notify.success(editing ? 'Пак обновлён' : 'Пак создан');
      setOpen(false);
      setEditing(null);
    },
    onError: (error) => notify.error('Не удалось сохранить пак', errorMessage(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setProbabilities(DEFAULT_PROBABILITIES);
    setOpen(true);
  };

  const openEdit = (pack: Pack) => {
    setEditing(pack);
    setForm({
      code: pack.code,
      name: pack.name,
      description: pack.description ?? '',
      price: String(pack.price),
      cards_count: String(pack.cards_count),
      image_url: pack.image_url ?? '',
      is_active: pack.is_active,
    });
    setProbabilities(
      pack.probabilities.map((probability) => ({
        rarity: probability.rarity,
        probability: probability.probability,
        guaranteed: probability.guaranteed,
      })),
    );
    setOpen(true);
  };

  const probabilitySum = probabilities.reduce(
    (sum, probability) => sum + probability.probability,
    0,
  );
  const valid =
    (editing || form.code.trim().length > 0) &&
    form.name.trim().length > 0 &&
    Number.parseInt(form.price, 10) >= 0 &&
    Number.parseInt(form.cards_count, 10) > 0 &&
    probabilities.length > 0;

  const packs = packsQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Паки"
        subtitle="Цены, количество карточек, вероятности редкостей и сроки доступности."
        actions={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Новый пак
          </Button>
        }
      />

      {packsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      ) : packsQuery.isError ? (
        <ErrorState error={packsQuery.error} onRetry={() => packsQuery.refetch()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl border border-border bg-bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-text-muted">
                    {pack.code}
                  </p>
                  <h2 className="text-base font-bold text-text-primary">
                    {pack.name}
                  </h2>
                </div>
                <Badge variant={pack.is_active ? 'success' : 'default'}>
                  {pack.is_active ? 'active' : 'off'}
                </Badge>
              </div>
              <p className="mt-1 min-h-9 text-xs text-text-secondary">
                {pack.description ?? 'Без описания'}
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-gold">
                  <Coins className="h-3.5 w-3.5" />
                  {formatNumber(pack.price)}
                </span>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <PackageOpen className="h-3.5 w-3.5" />
                  {pack.cards_count} карт
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pack.probabilities.map((probability) => (
                  <span
                    key={probability.rarity}
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                      rarityStyle(probability.rarity).chip
                    }`}
                  >
                    {rarityStyle(probability.rarity).label} {probability.probability}%
                  </span>
                ))}
              </div>
              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                fullWidth
                onClick={() => openEdit(pack)}
              >
                Редактировать
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Изменить пак' : 'Новый пак'}
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
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Код"
              value={form.code}
              disabled={Boolean(editing)}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
            />
            <Input
              label="Название"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <Input
              label="Цена"
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
            />
            <Input
              label="Карточек в паке"
              type="number"
              min={1}
              value={form.cards_count}
              onChange={(event) =>
                setForm({ ...form, cards_count: event.target.value })
              }
            />
            <Input
              label="Описание"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="sm:col-span-2"
            />
            <Input
              label="Image URL"
              value={form.image_url}
              onChange={(event) => setForm({ ...form, image_url: event.target.value })}
              className="sm:col-span-2"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                Вероятности
              </p>
              <span
                className={`text-xs font-bold ${
                  Math.abs(probabilitySum - 100) < 0.001
                    ? 'text-accent-primary'
                    : 'text-red'
                }`}
              >
                Сумма: {probabilitySum}%
              </span>
            </div>
            <div className="space-y-2">
              {probabilities.map((probability, index) => (
                <div
                  key={`${probability.rarity}-${index}`}
                  className="grid grid-cols-[1fr_90px_70px_40px] items-center gap-2"
                >
                  <Select
                    options={RARITY_ORDER.map((rarity) => ({
                      value: rarity,
                      label: rarityStyle(rarity).label,
                    }))}
                    value={probability.rarity}
                    onChange={(event) =>
                      setProbabilities((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, rarity: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={probability.probability}
                    onChange={(event) =>
                      setProbabilities((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                probability: Number(event.target.value) || 0,
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <label className="flex items-center justify-center gap-1.5 text-[10px] text-text-secondary">
                    <input
                      type="checkbox"
                      checked={probability.guaranteed}
                      onChange={(event) =>
                        setProbabilities((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, guaranteed: event.target.checked }
                              : item,
                          ),
                        )
                      }
                      className="h-4 w-4 accent-accent-primary"
                    />
                    guar.
                  </label>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red hover:bg-red/10"
                    onClick={() =>
                      setProbabilities((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="Удалить вероятность"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() =>
                setProbabilities((current) => [
                  ...current,
                  { rarity: 'rare', probability: 0, guaranteed: false },
                ])
              }
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Добавить редкость
            </Button>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary">
            Пак активен
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
