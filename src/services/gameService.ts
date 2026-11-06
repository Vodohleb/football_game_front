import { getData, postData } from '@/services/api';
import type {
  GameActionResponse,
  GameResult,
  GameSession,
  GameType,
} from '@/types/api';

export const gameService = {
  list() {
    return getData<GameType[]>('/games');
  },
  start(gameCode: string, mode?: string) {
    return postData<GameSession>(`/games/${gameCode}/start`, {
      mode: mode ?? null,
    });
  },
  action(
    sessionId: string,
    action: string,
    payload: Record<string, unknown> = {},
  ) {
    return postData<GameActionResponse>(
      `/games/sessions/${sessionId}/action`,
      { action, payload },
    );
  },
  complete(sessionId: string, score: number, resultData?: Record<string, unknown>) {
    return postData<GameResult>(`/games/sessions/${sessionId}/complete`, {
      score,
      result_data: resultData ?? null,
    });
  },
};
