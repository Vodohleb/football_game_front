import { describe, expect, it } from 'vitest';

import { RARITY_ORDER, rarityStyle } from '@/utils/rarity';

describe('rarity styles', () => {
  it('contains all six rarities', () => {
    expect(RARITY_ORDER).toHaveLength(6);
  });

  it('returns a style for every rarity', () => {
    RARITY_ORDER.forEach((rarity) => {
      const style = rarityStyle(rarity);
      expect(style.label.length).toBeGreaterThan(0);
      expect(style.gradient).toContain('from-');
    });
  });

  it('falls back to common for unknown rarity', () => {
    expect(rarityStyle('unknown').label).toBe('Common');
  });
});
