import { describe, expect, it } from 'vitest';

import {
  formatNumber,
  formatPercent,
  formatSeconds,
  titleCase,
} from '@/utils/format';

describe('format utils', () => {
  it('formats numbers for the ru locale', () => {
    expect(formatNumber(12500)).toMatch(/12\s?500/);
    expect(formatNumber(null)).toBe('0');
  });

  it('formats seconds as mm:ss', () => {
    expect(formatSeconds(65)).toBe('01:05');
    expect(formatSeconds(-5)).toBe('00:00');
    expect(formatSeconds(0)).toBe('00:00');
  });

  it('formats percentages', () => {
    expect(formatPercent(34.56)).toBe('34.56%');
    expect(formatPercent(undefined)).toBe('0%');
  });

  it('turns snake_case into title case', () => {
    expect(titleCase('game_reward')).toBe('Game Reward');
  });
});
