import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { GameResult } from '@/types/api';

export interface ActiveGameSession {
  sessionId: string;
  gameCode: string;
  mode: string | null;
  state: Record<string, unknown> | null;
  startedAt: string;
  expiresAt: string;
  timeLimitSeconds: number;
  result?: GameResult | null;
}

interface GameState {
  sessions: Record<string, ActiveGameSession>;
  setSession: (gameCode: string, session: ActiveGameSession) => void;
  updateSessionState: (
    gameCode: string,
    state: Record<string, unknown> | null,
  ) => void;
  setResult: (gameCode: string, result: GameResult) => void;
  clearSession: (gameCode: string) => void;
  clearAll: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      sessions: {},
      setSession: (gameCode, session) =>
        set((store) => ({
          sessions: { ...store.sessions, [gameCode]: session },
        })),
      updateSessionState: (gameCode, state) =>
        set((store) => {
          const existing = store.sessions[gameCode];
          if (!existing) {
            return store;
          }
          return {
            sessions: {
              ...store.sessions,
              [gameCode]: { ...existing, state },
            },
          };
        }),
      setResult: (gameCode, result) =>
        set((store) => {
          const existing = store.sessions[gameCode];
          if (!existing) {
            return store;
          }
          return {
            sessions: {
              ...store.sessions,
              [gameCode]: { ...existing, result },
            },
          };
        }),
      clearSession: (gameCode) =>
        set((store) => {
          const next = { ...store.sessions };
          delete next[gameCode];
          return { sessions: next };
        }),
      clearAll: () => set({ sessions: {} }),
    }),
    {
      name: 'football-arena-games',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
