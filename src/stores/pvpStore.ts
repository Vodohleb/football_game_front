import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PvpState {
  lastRoomId: string | null;
  lastMatchId: string | null;
  lastGameCode: string | null;
  lastResult: {
    scores: Record<string, number>;
    winner: string | null;
    gameCode: string;
  } | null;
  setLastRoom: (roomId: string, gameCode?: string | null) => void;
  setLastMatch: (matchId: string) => void;
  setLastResult: (
    result: {
      scores: Record<string, number>;
      winner: string | null;
      gameCode: string;
    } | null,
  ) => void;
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
  ),
);
