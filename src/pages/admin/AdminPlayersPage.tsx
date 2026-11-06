import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserRound } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService, type AdminPlayer } from '@/services/adminService';
import { notify } from '@/stores/notificationStore';
import { errorMessage } from '@/utils/errors';

interface PlayerForm {
  full_name: string;
  short_name: string;
  nationality: string;
  birth_date: string;
  primary_position: string;
  secondary_positions: string;
  current_club: string;
  league: string;
  photo_url: string;
  is_active: boolean;
}

const EMPTY_FORM: PlayerForm = {
  full_name: '',
  short_name: '',
  nationality: '',
  birth_date: '',
  primary_position: 'ST',
  secondary_positions: '',
  current_club: '',
  league: '',
  photo_url: '',
  is_active: true,
};

export default function AdminPlayersPage() {
  useDocumentTitle('Администрирование: футболисты');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlayer | null>(null);
  const [form, setForm] = useState<PlayerForm>(EMPTY_FORM);

  const playersQuery = useQuery({
    queryKey: ['admin', 'players', page, debouncedSearch],
    queryFn: () => adminService.players(debouncedSearch, page, 20),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = {
        full_name: form.full_name.trim(),
        short_name: form.short_name.trim(),
        nationality: form.nationality.trim(),
        birth_date: form.birth_date || null,
        primary_position: form.primary_position.trim().toUpperCase(),
        secondary_positions: form.secondary_positions
          .split(',')
          .map((value) => value.trim().toUpperCase())
          .filter(Boolean),
        current_club: form.current_club.trim(),
        league: form.league.trim(),
        photo_url: form.photo_url.trim() || null,
        is_active: form.is_active,
      };
      return editing
        ? adminService.updatePlayer(editing.id, body)
        : adminService.createPlayer(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] });
      notify.success(editing ? 'Футболист обновлён' : 'Футболист создан');
      setOpen(false);
      setEditing(null);
    },
    onError: (error) => notify.error('Не удалось сохранить футболиста', errorMessage(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (player: AdminPlayer) => {
    setEditing(player);
    setForm({
      full_name: player.full_name,
      short_name: player.short_name,
      nationality: player.nationality,
      birth_date: player.birth_date ?? '',
      primary_position: player.primary_position,
      secondary_positions: player.secondary_positions.join(', '),
      current_club: player.current_club,
      league: player.league,
      photo_url: player.photo_url ?? '',
      is_active: player.is_active,
    });
    setOpen(true);
  };

  const valid =
    form.full_name.trim().length > 0 &&
    form.short_name.trim().length > 0 &&
    form.nationality.trim().length > 0 &&
    form.primary_position.trim().length > 0 &&
    form.current_club.trim().length > 0 &&
    form.league.trim().length > 0;

  const players = playersQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Футболисты"
        subtitle="База футболистов для карточек и игровых заданий."
        actions={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Добавить
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
        <Badge variant="info">{playersQuery.data?.meta?.total ?? 0} записей</Badge>
      </div>

      {playersQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : playersQuery.isError ? (
        <ErrorState error={playersQuery.error} onRetry={() => playersQuery.refetch()} />
      ) : (
        <div className="space-y-1.5">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-hover text-text-secondary">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {player.full_name}
                  </p>
                  <p className="truncate text-[11px] text-text-muted">
                    {player.primary_position} · {player.current_club} · {player.league}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{player.nationality}</Badge>
                <Badge variant={player.is_active ? 'success' : 'default'}>
                  {player.is_active ? 'active' : 'archived'}
                </Badge>
                <Button size="sm" variant="secondary" onClick={() => openEdit(player)}>
                  Изменить
                </Button>
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
              Футболисты не найдены
            </div>
          )}
        </div>
      )}

      <Pagination meta={playersQuery.data?.meta} onPageChange={setPage} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Изменить футболиста' : 'Новый футболист'}
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
            label="Полное имя"
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
          />
          <Input
            label="Короткое имя"
            value={form.short_name}
            onChange={(event) => setForm({ ...form, short_name: event.target.value })}
          />
          <Input
            label="Национальность"
            value={form.nationality}
            onChange={(event) => setForm({ ...form, nationality: event.target.value })}
          />
          <Input
            label="Дата рождения"
            type="date"
            value={form.birth_date}
            onChange={(event) => setForm({ ...form, birth_date: event.target.value })}
          />
          <Input
            label="Основная позиция"
            value={form.primary_position}
            onChange={(event) =>
              setForm({ ...form, primary_position: event.target.value.toUpperCase() })
            }
          />
          <Input
            label="Доп. позиции (через запятую)"
            value={form.secondary_positions}
            onChange={(event) =>
              setForm({ ...form, secondary_positions: event.target.value })
            }
          />
          <Input
            label="Клуб"
            value={form.current_club}
            onChange={(event) => setForm({ ...form, current_club: event.target.value })}
          />
          <Input
            label="Лига"
            value={form.league}
            onChange={(event) => setForm({ ...form, league: event.target.value })}
          />
          <Input
            label="Фото URL"
            value={form.photo_url}
            onChange={(event) => setForm({ ...form, photo_url: event.target.value })}
            className="sm:col-span-2"
          />
          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary sm:col-span-2">
            Активен
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
