import { getData, patchData } from '@/services/api';
import type {
  MeData,
  PublicProfile,
  UserSettings,
  UserStatistics,
} from '@/types/api';

export const userService = {
  me() {
    return getData<MeData>('/users/me');
  },
  updateMe(body: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
  }) {
    return patchData<MeData>('/users/me', body);
  },
  settings() {
    return getData<UserSettings>('/users/me/settings');
  },
  updateSettings(body: Partial<UserSettings>) {
    return patchData<UserSettings>('/users/me/settings', body);
  },
  publicProfile(userId: string) {
    return getData<PublicProfile>(`/users/${userId}/profile`);
  },
  statistics(userId: string) {
    return getData<UserStatistics>(`/users/${userId}/statistics`);
  },
};
