import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
  recentGameCodes: string[];
  markGamePlayed: (code: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      recentGameCodes: [],
      markGamePlayed: (code) =>
        set((state) => ({
          recentGameCodes: [
            code,
            ...state.recentGameCodes.filter((item) => item !== code),
          ].slice(0, 6),
        })),
      reset: () => set({ recentGameCodes: [] }),
    }),
    {
      name: 'football-arena-user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
