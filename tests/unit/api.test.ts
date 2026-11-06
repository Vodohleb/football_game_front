import { describe, expect, it } from 'vitest';

import { buildQuery } from '@/services/api';

describe('buildQuery', () => {
  it('serializes defined values only', () => {
    expect(
      buildQuery({
        page: 1,
        limit: 20,
        search: 'messi',
        rarity: undefined,
        club: '',
      }),
    ).toBe('?page=1&limit=20&search=messi');
  });

  it('returns an empty string when no params are present', () => {
    expect(buildQuery({})).toBe('');
  });
});
