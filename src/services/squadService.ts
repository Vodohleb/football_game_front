import {
  deleteData,
  getData,
  patchData,
  postData,
  putData,
} from '@/services/api';
import type {
  Formation,
  Squad,
  SquadPlayer,
  SquadSummary,
} from '@/types/api';

export const squadService = {
  formations() {
    return getData<Formation[]>('/formations');
  },
  list() {
    return getData<SquadSummary[]>('/users/me/squads');
  },
  create(body: { name: string; formation: string; is_active?: boolean }) {
    return postData<Squad>('/users/me/squads', body);
  },
  detail(squadId: string) {
    return getData<Squad>(`/users/me/squads/${squadId}`);
  },
  update(
    squadId: string,
    body: { name?: string; formation?: string; is_active?: boolean },
  ) {
    return patchData<Squad>(`/users/me/squads/${squadId}`, body);
  },
  remove(squadId: string) {
    return deleteData<{ message: string }>(`/users/me/squads/${squadId}`);
  },
  replacePlayers(squadId: string, players: SquadPlayer[]) {
    return putData<Squad>(`/users/me/squads/${squadId}/players`, {
      players: players.map((player) => ({
        slot_id: player.slot_id,
        user_card_id: player.user_card_id,
      })),
    });
  },
  updateSlot(
    squadId: string,
    slotId: string,
    userCardId: string | null,
  ) {
    return patchData<Squad>(
      `/users/me/squads/${squadId}/players/${encodeURIComponent(slotId)}`,
      { user_card_id: userCardId },
    );
  },
  rating(squadId: string) {
    return getData<{ rating: number; filled_slots: number; total_slots: number }>(
      `/users/me/squads/${squadId}/rating`,
    );
  },
};
