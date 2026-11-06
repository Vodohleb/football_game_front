import type { Card, CardSnapshot, Rarity } from '@/types/api';

export interface PlayerCardStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerCardData {
  id: string;
  name: string;
  fullName: string;
  position: string;
  nationality: string;
  club: string;
  league: string;
  rarity: Rarity;
  rating: number;
  stats: PlayerCardStats;
  cardName?: string;
}

export function cardToData(card: Card): PlayerCardData {
  return {
    id: card.id,
    name: card.player_name,
    fullName: card.player_full_name,
    position: card.position,
    nationality: card.nationality,
    club: card.club,
    league: card.league,
    rarity: card.rarity,
    rating: card.overall_rating,
    cardName: card.card_name,
    stats: {
      pace: card.pace,
      shooting: card.shooting,
      passing: card.passing,
      dribbling: card.dribbling,
      defending: card.defending,
      physical: card.physical,
    },
  };
}

export function snapshotToData(snapshot: CardSnapshot): PlayerCardData {
  return {
    id: snapshot.card_id,
    name: snapshot.player_name,
    fullName: snapshot.player_full_name,
    position: snapshot.position,
    nationality: snapshot.nationality,
    club: snapshot.club,
    league: snapshot.league,
    rarity: snapshot.rarity,
    rating: snapshot.overall_rating,
    stats: {
      pace: snapshot.stats.pace,
      shooting: snapshot.stats.shooting,
      passing: snapshot.stats.passing,
      dribbling: snapshot.stats.dribbling,
      defending: snapshot.stats.defending,
      physical: snapshot.stats.physical,
    },
  };
}

export function normalizeCard(card: Card | CardSnapshot): PlayerCardData {
  return 'stats' in card ? snapshotToData(card) : cardToData(card);
}
