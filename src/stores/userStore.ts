import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
  recentGameCodes: string[];
  bestScores: Record<string, number>;
  markGamePlayed: (code: string) => void;
  recordScore: (userId: string, gameCode: string, score: number) => void;
  reset: () => void;
}

export function bestScoreKey(userId: string, gameCode: string): string {
  return `${userId}:${gameCode}`;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      recentGameCodes: [],
      bestScores: {},
      markGamePlayed: (code) =>
        set((state) => ({
          recentGameCodes: [
            code,
            ...state.recentGameCodes.filter((item) => item !== code),
          ].slice(0, 6),
        })),
      recordScore: (userId, gameCode, score) => {
        const key = bestScoreKey(userId, gameCode);
        const previous = get().bestScores[key] ?? 0;
        if (score > previous) {
          set((state) => ({
            bestScores: { ...state.bestScores, [key]: score },
          }));
        }
      },
      reset: () => set({ recentGameCodes: [] }),
    }),
    {
      name: 'football-arena-user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
