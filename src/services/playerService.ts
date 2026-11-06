import { buildQuery, getData, getEnvelope } from '@/services/api';
import type { Card, Player, PlayerDetail } from '@/types/api';

export interface PlayerFilters {
  name?: string;
  position?: string;
  nationality?: string;
  club?: string;
  league?: string;
  min_rating?: number;
  max_rating?: number;
  rarity?: string;
  page?: number;
  limit?: number;
}

export const playerService = {
  list(filters: PlayerFilters = {}) {
    return getEnvelope<Player[]>(`/players${buildQuery(filters)}`);
  },
  detail(playerId: string) {
    return getData<PlayerDetail>(`/players/${playerId}`);
  },
  cards(playerId: string) {
    return getData<Card[]>(`/players/${playerId}/cards`);
  },
  positions() {
    return getData<string[]>('/players/positions');
  },
  nationalities() {
    return getData<string[]>('/players/nationalities');
  },
  leagues() {
    return getData<string[]>('/players/leagues');
  },
  clubs() {
    return getData<string[]>('/players/clubs');
  },
};
