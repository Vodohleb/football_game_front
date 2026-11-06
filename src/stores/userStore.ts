import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const EMPTY_MATCH_HISTORY: LocalMatchHistoryEntry[] = [];

export interface LocalMatchHistoryEntry {
  id: string;
  gameCode: string;
  gameName: string;
  score: number;
  coins: number;
  xp: number;
  finishedAt: string;
  mode: 'solo' | 'pvp';
  ratingDelta?: number;
}

interface UserState {
  recentGameCodes: string[];
  bestScores: Record<string, number>;
  history: Record<string, LocalMatchHistoryEntry[]>;
  markGamePlayed: (code: string) => void;
  recordScore: (userId: string, gameCode: string, score: number) => void;
  recordHistory: (
    userId: string,
    entry: Omit<LocalMatchHistoryEntry, 'id'>,
  ) => void;
  reset: () => void;
}

export function bestScoreKey(userId: string, gameCode: string): string {
  return `${userId}:${gameCode}`;
}

function historyId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      recentGameCodes: [],
      bestScores: {},
      history: {},
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
      recordHistory: (userId, entry) =>
        set((state) => {
          const previous = state.history[userId] ?? [];
          return {
            history: {
              ...state.history,
              [userId]: [{ ...entry, id: historyId() }, ...previous].slice(
                0,
                50,
              ),
            },
          };
        }),
      reset: () => set({ recentGameCodes: [] }),
    }),
    {
      name: 'football-arena-user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
