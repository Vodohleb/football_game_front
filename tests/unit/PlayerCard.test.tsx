import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlayerCard } from '@/components/cards/PlayerCard';
import type { CardSnapshot } from '@/types/api';

const CARD: CardSnapshot = {
  card_id: 'card-1',
  card_name: 'Arena Legend',
  player_id: 'player-1',
  player_name: 'A. Striker',
  player_full_name: 'Arena Striker',
  nationality: 'Brazil',
  position: 'ST',
  club: 'Arena FC',
  league: 'Arena League',
  rarity: 'world_class',
  overall_rating: 94,
  stats: {
    pace: 95,
    shooting: 94,
    passing: 88,
    dribbling: 93,
    defending: 45,
    physical: 86,
    overall_rating: 94,
  },
};

describe('PlayerCard', () => {
  it('renders player name, rating, position and rarity', () => {
    render(<PlayerCard card={CARD} />);

    expect(screen.getByText('A. Striker')).toBeInTheDocument();
    expect(screen.getAllByText('94').length).toBeGreaterThan(0);
    expect(screen.getByText('ST')).toBeInTheDocument();
    expect(screen.getByText('World Class')).toBeInTheDocument();
  });

  it('renders all six stats', () => {
    render(<PlayerCard card={CARD} />);

    ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('can be used as a button when onClick is provided', () => {
    render(<PlayerCard card={CARD} onClick={() => undefined} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
