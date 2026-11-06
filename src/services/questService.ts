import { buildQuery, getEnvelope, postData } from '@/services/api';
import type { ClaimResult, Quest } from '@/types/api';

export const questService = {
  daily() {
    return getEnvelope<Quest[]>('/quests/daily');
  },
  weekly() {
    return getEnvelope<Quest[]>('/quests/weekly');
  },
  history(page = 1, limit = 20) {
    return getEnvelope<Quest[]>(
      `/quests/history${buildQuery({ page, limit })}`,
    );
  },
  claim(userQuestId: string) {
    return postData<ClaimResult>(`/quests/${userQuestId}/claim`, {});
  },
};
