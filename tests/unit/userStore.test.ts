import { beforeEach, describe, expect, it } from 'vitest';

import { bestScoreKey, useUserStore } from '@/stores/userStore';

beforeEach(() => {
  useUserStore.setState({ recentGameCodes: [], bestScores: {} });
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
    useUserStore.getState().reset();

    const state = useUserStore.getState();
    expect(state.recentGameCodes).toEqual([]);
    expect(state.bestScores[bestScoreKey('user-1', 'draft')]).toBe(100);
  });
});
