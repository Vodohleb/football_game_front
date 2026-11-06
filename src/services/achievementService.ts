import { getData } from '@/services/api';
import type { Achievement, UserAchievement } from '@/types/api';

export const achievementService = {
  list() {
    return getData<Achievement[]>('/achievements');
  },
  mine() {
    return getData<UserAchievement[]>('/users/me/achievements');
  },
  forUser(userId: string) {
    return getData<UserAchievement[]>(`/users/${userId}/achievements`);
  },
};
