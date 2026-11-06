export interface League {
  name: string;
  short: string;
  minRating: number;
  className: string;
}

const LEAGUES: League[] = [
  {
    name: 'Bronze',
    short: 'III',
    minRating: 0,
    className: 'bg-amber-700/15 text-amber-500 border-amber-700/30',
  },
  {
    name: 'Silver',
    short: 'II',
    minRating: 1100,
    className: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
  },
  {
    name: 'Gold',
    short: 'I',
    minRating: 1300,
    className: 'bg-gold/15 text-gold border-gold/30',
  },
  {
    name: 'Platinum',
    short: 'III',
    minRating: 1500,
    className: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
  },
  {
    name: 'Diamond',
    short: 'II',
    minRating: 1750,
    className: 'bg-blue/15 text-blue border-blue/30',
  },
  {
    name: 'Elite',
    short: 'I',
    minRating: 2000,
    className: 'bg-purple/15 text-purple border-purple/30',
  },
  {
    name: 'Legend',
    short: '★',
    minRating: 2300,
    className: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  },
];

export function leagueForRating(
  rating: number | null | undefined,
): League {
  if (!rating) {
    return LEAGUES[0];
  }
  let current = LEAGUES[0];
  for (const league of LEAGUES) {
    if (rating >= league.minRating) {
      current = league;
    }
  }
  return current;
}
