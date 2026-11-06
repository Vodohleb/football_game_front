import { buildQuery, getData, getEnvelope } from '@/services/api';
import type {
  WalletDetail,
  WalletTransaction,
  XpProgress,
} from '@/types/api';

export const economyService = {
  wallet() {
    return getData<WalletDetail>('/economy/wallet');
  },
  transactions(page = 1, limit = 20, type?: string) {
    return getEnvelope<WalletTransaction[]>(
      `/economy/transactions${buildQuery({ page, limit, type })}`,
    );
  },
  progress() {
    return getData<XpProgress>('/economy/progress');
  },
};
