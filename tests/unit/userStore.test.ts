import { beforeEach, describe, expect, it } from 'vitest';

import { bestScoreKey, useUserStore } from '@/stores/userStore';

beforeEach(() => {
  useUserStore.setState({ recentGameCodes: [], bestScores: {}, history: {} });
});

describe('userStore', () => {
  it('stores the best score per user and game', () => {
    const store = useUserStore.getState();
    store.recordScore('user-1', 'draft', 120);
    store.recordScore('user-1', 'draft', 80);
    store.recordScore('user-1', 'penalty', 50);

    const state = useUserStore.getState();
    expect(state.bestScores[bestScoreKey('user-1', 'draft')]).toBe(120);
    expect(state.bestScores[bestScoreKey('user-1', 'penalty')]).toBe(50);
  });

  it('updates the record only when the score is higher', () => {
    const store = useUserStore.getState();
    store.recordScore('user-1', 'penalty', 50);
    useUserStore.getState().recordScore('user-1', 'penalty', 75);
    expect(
      useUserStore.getState().bestScores[bestScoreKey('user-1', 'penalty')],
    ).toBe(75);

    useUserStore.getState().recordScore('user-1', 'penalty', 10);
    expect(
      useUserStore.getState().bestScores[bestScoreKey('user-1', 'penalty')],
    ).toBe(75);
  });

  it('keeps records after logout reset and clears recent games', () => {
    useUserStore.getState().markGamePlayed('draft');
    useUserStore.getState().recordScore('user-1', 'draft', 100);
    useUserStore
      .getState()
      .recordHistory('user-1', {
        gameCode: 'draft',
        gameName: 'Draft',
        score: 100,
        coins: 10,
        xp: 5,
        finishedAt: new Date().toISOString(),
        mode: 'solo',
      });
    useUserStore.getState().reset();

    const state = useUserStore.getState();
    expect(state.recentGameCodes).toEqual([]);
    expect(state.bestScores[bestScoreKey('user-1', 'draft')]).toBe(100);
    expect(state.history['user-1']).toHaveLength(1);
  });

  it('stores match history per user, newest first', () => {
    const store = useUserStore.getState();
    store.recordHistory('user-1', {
      gameCode: 'penalty',
      gameName: 'Penalty',
      score: 50,
      coins: 10,
      xp: 5,
      finishedAt: '2026-01-01T10:00:00Z',
      mode: 'solo',
    });
    store.recordHistory('user-1', {
      gameCode: 'pvp_penalty',
      gameName: 'Penalty PvP',
      score: 2,
      coins: 0,
      xp: 0,
      finishedAt: '2026-01-01T11:00:00Z',
      mode: 'pvp',
      ratingDelta: 12,
    });
    store.recordHistory('user-2', {
      gameCode: 'draft',
      gameName: 'Draft',
      score: 400,
      coins: 20,
      xp: 15,
      finishedAt: '2026-01-01T12:00:00Z',
      mode: 'solo',
    });

    const state = useUserStore.getState();
    expect(state.history['user-1']).toHaveLength(2);
    expect(state.history['user-1'][0].gameCode).toBe('pvp_penalty');
    expect(state.history['user-1'][0].ratingDelta).toBe(12);
    expect(state.history['user-2']).toHaveLength(1);
  });
});
