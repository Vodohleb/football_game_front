import { buildQuery, deleteData, getData, postData } from '@/services/api';
import type { PvpQuickMatch, PvpRoom } from '@/types/api';

export const pvpService = {
  quickMatch(gameCode: string) {
    return postData<PvpQuickMatch>('/pvp/quick-match', { game_code: gameCode });
  },
  quickMatchStatus(gameCode: string) {
    return getData<PvpQuickMatch>(
      `/pvp/quick-match/status${buildQuery({ game_code: gameCode })}`,
    );
  },
  cancelQuickMatch(gameCode: string) {
    return deleteData<PvpQuickMatch>(
      `/pvp/quick-match${buildQuery({ game_code: gameCode })}`,
    );
  },
  createRoom(gameCode: string) {
    return postData<PvpRoom>('/pvp/rooms', { game_code: gameCode });
  },
  joinRoom(code: string) {
    return postData<PvpRoom>('/pvp/rooms/join', { code });
  },
  room(roomId: string) {
    return getData<PvpRoom>(`/pvp/rooms/${roomId}`);
  },
  ready(roomId: string) {
    return postData<PvpRoom>(`/pvp/rooms/${roomId}/ready`, {});
  },
  leave(roomId: string) {
    return postData<{ message: string }>(`/pvp/rooms/${roomId}/leave`, {});
  },
};
