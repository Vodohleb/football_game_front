import { buildQuery, getData, getEnvelope } from '@/services/api';
import type {
  Card,
  CardDetail,
  DuplicateGroup,
  UserCard,
} from '@/types/api';

export interface CardFilters {
  search?: string;
  position?: string;
  nationality?: string;
  club?: string;
  league?: string;
  rarity?: string;
  min_rating?: number;
  max_rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const cardService = {
  list(filters: CardFilters = {}) {
    return getEnvelope<Card[]>(`/cards${buildQuery(filters)}`);
  },
  detail(cardId: string) {
    return getData<CardDetail>(`/cards/${cardId}`);
  },
  collection(filters: CardFilters = {}) {
    return getEnvelope<UserCard[]>(`/users/me/cards${buildQuery(filters)}`);
  },
  collectionItem(userCardId: string) {
    return getData<UserCard>(`/users/me/cards/${userCardId}`);
  },
  duplicates(page = 1, limit = 20) {
    return getEnvelope<DuplicateGroup[]>(
      `/users/me/cards/duplicates${buildQuery({ page, limit })}`,
    );
  },
};
