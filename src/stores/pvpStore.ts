import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PvpResultPlayer {
  username: string;
  rating_delta: number;
  score?: number;
  result?: string;
}

export interface PvpLastResult {
  scores: Record<string, number>;
  winner: string | null;
  gameCode: string;
  players?: PvpResultPlayer[];
}

interface PvpState {
  lastRoomId: string | null;
  lastMatchId: string | null;
  lastGameCode: string | null;
  lastResult: PvpLastResult | null;
  setLastRoom: (roomId: string, gameCode?: string | null) => void;
  setLastMatch: (matchId: string) => void;
  setLastResult: (result: PvpLastResult | null) => void;
  clear: () => void;
}

export const usePvpStore = create<PvpState>()(
  persist(
    (set) => ({
      lastRoomId: null,
      lastMatchId: null,
      lastGameCode: null,
      lastResult: null,
      setLastRoom: (roomId, gameCode = null) =>
        set({ lastRoomId: roomId, lastGameCode: gameCode }),
      setLastMatch: (matchId) => set({ lastMatchId: matchId }),
      setLastResult: (result) => set({ lastResult: result }),
      clear: () =>
        set({
          lastRoomId: null,
          lastMatchId: null,
          lastGameCode: null,
          lastResult: null,
        }),
    }),
    {
      name: 'football-arena-pvp',
      storage: createJSONStorage(() => sessionStorage),
    },
  )
);
