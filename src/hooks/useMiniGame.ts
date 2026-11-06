import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { gameService } from '@/services/gameService';
import { useGameStore } from '@/stores/gameStore';
import { notify } from '@/stores/notificationStore';
import type { GameActionResponse } from '@/types/api';
import { errorMessage, normalizeError } from '@/utils/errors';

const INVALIDATE_KEYS = [
  ['users', 'me'],
  ['leaderboard', 'me'],
  ['quests'],
  ['achievements'],
  ['economy'],
];

export function useMiniGame(gameCode: string) {
  const queryClient = useQueryClient();
  const session = useGameStore((state) => state.sessions[gameCode]);
  const setSession = useGameStore((state) => state.setSession);
  const updateState = useGameStore((state) => state.updateSessionState);
  const setResult = useGameStore((state) => state.setResult);
  const clearSession = useGameStore((state) => state.clearSession);
  const [acting, setActing] = useState(false);

  const invalidate = () => {
    INVALIDATE_KEYS.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  const startMutation = useMutation({
    mutationFn: (mode?: string) => gameService.start(gameCode, mode),
    onSuccess: (data) => {
      setSession(gameCode, {
        sessionId: data.session_id,
        gameCode,
        mode: data.mode,
        state: data.state,
        startedAt: data.started_at,
        expiresAt: data.expires_at,
        timeLimitSeconds: data.time_limit_seconds,
        result: null,
      });
    },
    onError: (error) => {
      notify.error('Не удалось начать игру', errorMessage(error));
    },
  });

  const start = (mode?: string) => startMutation.mutate(mode);

  const act = async (
    action: string,
    payload: Record<string, unknown> = {},
  ): Promise<GameActionResponse | null> => {
    if (!session || acting) {
      return null;
    }
    setActing(true);
    try {
      const response = await gameService.action(
        session.sessionId,
        action,
        payload,
      );
      updateState(gameCode, response.state);
      if (response.finished && response.result) {
        setResult(gameCode, response.result);
        invalidate();
      }
      return response;
    } catch (error) {
      const normalized = normalizeError(error);
      if (
        normalized.code === 'SESSION_EXPIRED' ||
        normalized.code === 'SESSION_NOT_ACTIVE'
      ) {
        clearSession(gameCode);
        notify.warning('Сессия завершена', 'Начните игру заново.');
      } else {
        notify.error('Ошибка игрового действия', normalized.message);
      }
      return null;
    } finally {
      setActing(false);
    }
  };

  const reset = () => clearSession(gameCode);

  const replay = (mode?: string) => {
    reset();
    start(mode ?? session?.mode ?? undefined);
  };

  return {
    session,
    state: session?.state ?? null,
    result: session?.result ?? null,
    starting: startMutation.isPending,
    acting,
    start,
    act,
    reset,
    replay,
    invalidate,
  };
}
