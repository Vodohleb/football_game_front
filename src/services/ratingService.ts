import { buildQuery, getData, getEnvelope } from '@/services/api';
import type {
  LeaderboardEntry,
  MyLeaderboard,
  WeeklyLeaderboardEntry,
} from '@/types/api';

export const ratingService = {
  global(page = 1, limit = 20) {
    return getEnvelope<LeaderboardEntry[]>(
      `/leaderboard/global${buildQuery({ page, limit })}`,
    );
  },
  game(gameCode: string, page = 1, limit = 20) {
    return getEnvelope<LeaderboardEntry[]>(
      `/leaderboard/game/${gameCode}${buildQuery({ page, limit })}`,
    );
  },
  weekly(page = 1, limit = 20) {
    return getEnvelope<WeeklyLeaderboardEntry[]>(
      `/leaderboard/weekly${buildQuery({ page, limit })}`,
    );
  },
  season(page = 1, limit = 20) {
    return getEnvelope<LeaderboardEntry[]>(
      `/leaderboard/season${buildQuery({ page, limit })}`,
    );
  },
  me() {
    return getData<MyLeaderboard>('/leaderboard/me');
  },
};
