import { buildQuery, getData, getEnvelope, postData } from '@/services/api';
import type { Pack, PackOpenResult, PackOpening } from '@/types/api';

export const packService = {
  list(page = 1, limit = 20) {
    return getEnvelope<Pack[]>(`/packs${buildQuery({ page, limit })}`);
  },
  detail(packId: string) {
    return getData<Pack>(`/packs/${packId}`);
  },
  open(packId: string, idempotencyKey: string) {
    return postData<PackOpenResult>(
      `/packs/${packId}/open`,
      undefined,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
  },
  history(page = 1, limit = 20) {
    return getEnvelope<PackOpening[]>(
      `/users/me/packs/history${buildQuery({ page, limit })}`,
    );
  },
};

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pack-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
