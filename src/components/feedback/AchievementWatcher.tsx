import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { achievementService } from '@/services/achievementService';
import { useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';

export function AchievementWatcher() {
  const userId = useAuthStore((state) => state.user?.id);
  const { data } = useQuery({
    queryKey: ['achievements', 'me'],
    queryFn: achievementService.mine,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!userId || !data) {
      return;
    }
    const storageKey = `football-arena-achievements-${userId}`;
    const codes = data.map((achievement) => achievement.code);
    const raw = localStorage.getItem(storageKey);

    if (raw === null) {
      localStorage.setItem(storageKey, JSON.stringify(codes));
      return;
    }

    let previous: string[] = [];
    try {
      previous = JSON.parse(raw) as string[];
    } catch {
      previous = [];
    }

    data
      .filter((achievement) => !previous.includes(achievement.code))
      .slice(0, 3)
      .forEach((achievement, index) => {
        window.setTimeout(() => {
          notify.success('Достижение открыто!', achievement.title);
        }, index * 350);
      });

    localStorage.setItem(storageKey, JSON.stringify(codes));
  }, [data, userId]);

  return null;
}
