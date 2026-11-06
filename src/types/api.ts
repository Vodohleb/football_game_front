export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta: ApiMeta | null;
}

export type Rarity =
  | 'common'
  | 'rare'
  | 'special'
  | 'world_class'
  | 'icon'
  | 'legend';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'blocked' | 'deleted';
  email_verified: boolean;
  created_at: string;
}

export interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  total_games: number;
  wins: number;
  losses: number;
}

export interface Wallet {
  balance: number;
}

export interface WalletDetail extends Wallet {
  updated_at: string;
}

export interface MeData {
  user: User;
  profile: Profile | null;
  wallet: Wallet | null;
}

export interface UserSettings {
  language: string;
  theme: 'dark' | 'light' | 'system';
  email_notifications: boolean;
  push_notifications: boolean;
  show_online_status: boolean;
}

export interface GameStatistics {
  game_code: string;
  games_played: number;
  wins: number;
  losses: number;
  rating: number | null;
}

export interface UserStatistics {
  username: string;
  overall: {
    total_games: number;
    wins: number;
    losses: number;
    win_rate: number;
    level: number;
    xp: number;
  };
  overall_rating: number | null;
  games: GameStatistics[];
  achievements: { code: string; title: string; unlocked_at: string }[];
}

export interface PublicProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  total_games: number;
  wins: number;
  losses: number;
  win_rate: number;
  achievements_count: number;
  overall_rating: number | null;
}

export interface Tokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthData {
  user: User;
  tokens: Tokens;
  verification_token?: string | null;
}

export interface Card {
  id: string;
  player_id: string;
  player_name: string;
  player_full_name: string;
  nationality: string;
  position: string;
  club: string;
  league: string;
  card_name: string;
  rarity: Rarity;
  overall_rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  card_design: string | null;
  season: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CardDetail extends Card {
  player: {
    id: string;
    full_name: string;
    short_name: string;
    nationality: string;
    primary_position: string;
    current_club: string;
    league: string;
    photo_url: string | null;
  };
}

export interface UserCard {
  id: string;
  card_id: string;
  acquired_from: string;
  acquired_at: string;
  is_active: boolean;
  card: Card;
}

export interface DuplicateGroup {
  card: Card;
  count: number;
  instances: {
    id: string;
    acquired_from: string;
    acquired_at: string;
    is_active: boolean;
  }[];
}

export interface PackProbability {
  rarity: Rarity;
  probability: number;
  guaranteed: boolean;
  min_rating: number | null;
  max_rating: number | null;
}

export interface Pack {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  cards_count: number;
  image_url: string | null;
  is_active: boolean;
  available_from: string | null;
  available_to: string | null;
  probabilities: PackProbability[];
}

export interface PackOpening {
  id: string;
  pack_id: string;
  pack_name: string;
  coins_spent: number;
  balance_after: number;
  cards: UserCard[];
  created_at: string;
}

export interface PackOpenResult {
  opening_id: string;
  pack_id: string;
  pack_name: string;
  coins_spent: number;
  balance: number;
  cards: UserCard[];
}

export interface FormationSlot {
  slot_id: string;
  position: string;
}

export interface Formation {
  code: string;
  name: string;
  slots: FormationSlot[];
}

export interface SquadPlayer {
  id: string;
  slot_id: string;
  position: string;
  user_card_id: string;
  card: Card;
}

export interface Squad {
  id: string;
  name: string;
  formation: string;
  is_active: boolean;
  players: SquadPlayer[];
  rating: number;
  filled_slots: number;
  total_slots: number;
  created_at: string;
  updated_at: string;
}

export interface SquadSummary {
  id: string;
  name: string;
  formation: string;
  is_active: boolean;
  players_count: number;
  created_at: string;
  updated_at: string;
}

export interface GameType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface GameSession {
  session_id: string;
  game: GameType;
  mode: string | null;
  status: string;
  started_at: string;
  expires_at: string;
  time_limit_seconds: number;
  server_time: string;
  state: Record<string, unknown> | null;
}

export interface GameResult {
  session_id: string;
  game_code: string;
  game_name: string;
  status: string;
  score: number;
  coins_earned: number;
  xp_earned: number;
  duration_seconds: number;
  completed_at: string;
  result_data: Record<string, unknown>;
  replayed: boolean;
}

export interface GameActionResponse {
  session_id: string;
  game_code: string;
  status: string;
  finished: boolean;
  message: string | null;
  state: Record<string, unknown> | null;
  result: GameResult | null;
}

export interface CardSnapshot {
  card_id: string;
  card_name: string;
  player_id: string;
  player_name: string;
  player_full_name: string;
  nationality: string;
  position: string;
  club: string;
  league: string;
  rarity: Rarity;
  overall_rating: number;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    overall_rating: number;
  };
}

export interface DraftState {
  mode: string;
  round: number;
  total_rounds: number;
  positions: string[];
  picks: CardSnapshot[];
  options: CardSnapshot[];
  score: number;
  finished: boolean;
}

export interface HintGameState {
  mode: string;
  hints: string[];
  hints_total: number;
  hints_revealed: number;
  attempts: number;
  max_attempts: number;
  score: number;
  finished: boolean;
  answer?: string;
}

export interface PenaltyShot {
  shot: number;
  sector: number;
  keeper_sector: number;
  goal: boolean;
}

export interface PenaltyState {
  mode: string;
  shots: number;
  max_shots: number;
  goals: number;
  score: number;
  log: PenaltyShot[];
  finished: boolean;
}

export interface HigherLowerState {
  mode: string;
  round: number;
  total_rounds: number;
  score: number;
  mistakes: number;
  max_mistakes: number;
  stat: string;
  current: CardSnapshot;
  next: CardSnapshot;
  log: {
    round: number;
    stat: string;
    current_player: string;
    current_value: number;
    next_player: string;
    next_value: number;
    choice: string;
    correct: boolean;
  }[];
  finished: boolean;
}

export interface TikiCell {
  cell_id: number;
  position: string;
  nationality: string;
}

export interface TikiState {
  mode: string;
  cells: TikiCell[];
  filled: Record<
    string,
    { player_id: string; player_name: string; player_full_name: string }
  >;
  score: number;
  mistakes: number;
  max_mistakes: number;
  finished: boolean;
}

export interface Player {
  id: string;
  full_name: string;
  short_name: string;
  nationality: string;
  birth_date: string | null;
  primary_position: string;
  secondary_positions: string[];
  current_club: string;
  league: string;
  photo_url: string | null;
  is_active: boolean;
}

export interface PlayerDetail extends Player {
  career: {
    team_name: string;
    team_type: string;
    league: string | null;
    start_date: string | null;
    end_date: string | null;
    appearances: number | null;
    goals: number | null;
    trophies: string[];
    source: string;
    verified_at: string | null;
  }[];
  facts: {
    fact_type: string;
    text: string;
    source: string;
    source_url: string | null;
    verified_at: string | null;
  }[];
}

export interface Quest {
  user_quest_id: string;
  code: string;
  title: string;
  description: string | null;
  event_type: string;
  period: string;
  target_value: number;
  reward_coins: number;
  reward_xp: number;
  progress: number;
  status: string;
  period_key: string;
  assigned_at: string;
  completed_at: string | null;
  claimed_at: string | null;
}

export interface ClaimResult {
  user_quest_id: string;
  status: string;
  coins_earned: number;
  xp_earned: number;
}

export interface Achievement {
  code: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  condition_type: string;
  condition_value: number;
  reward_coins: number;
  reward_xp: number;
}

export interface UserAchievement {
  code: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  unlocked_at: string;
  reward_coins: number;
  reward_xp: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name: string | null;
  level: number;
  rating: number;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
}

export interface WeeklyLeaderboardEntry {
  rank: number;
  username: string;
  display_name: string | null;
  level: number;
  rating_delta: number;
  matches: number;
}

export interface GameRatingEntry {
  game_code: string;
  game_name: string;
  rating: number;
  rank: number;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface Season {
  id: string;
  code: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface MyLeaderboard {
  global_rating: number;
  global_rank: number;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  season: Season | null;
  season_rank: number | null;
  weekly_delta: number;
  weekly_rank: number | null;
  games: GameRatingEntry[];
}

export interface WalletTransaction {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface XpProgress {
  level: number;
  xp: number;
  current_level_xp: number;
  next_level_xp: number | null;
  xp_to_next_level: number;
  progress_percent: number;
  max_level: number;
}

export interface PvpMember {
  username: string;
  status: string;
  ready: boolean;
}

export interface PvpPlayer {
  user_id: string;
  username: string;
}

export interface PvpMatchState {
  match_id: string;
  game_code: string;
  status: string;
  round: number;
  total_rounds: number;
  players: PvpPlayer[];
  scores: Record<string, number>;
  submitted: string[];
  log: {
    round: number;
    results: {
      username: string;
      sector?: number;
      keeper_sector?: number;
      goal?: boolean;
      option?: number;
      correct_option?: number;
      correct?: boolean;
    }[];
  }[];
  finished: boolean;
  winner: string | null;
  question?: { text: string; options: string[] };
}

export interface PvpRoom {
  id: string;
  code: string;
  game_code: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED' | 'EXPIRED';
  host_username: string | null;
  members: PvpMember[];
  match_id: string | null;
  match_state: PvpMatchState | null;
  created_at: string;
  expires_at: string;
}

export interface PvpQuickMatch {
  matched: boolean;
  room_id: string | null;
  match_id: string | null;
  opponent_username: string | null;
  queue_position: number | null;
  waiting_seconds: number | null;
  message: string;
}

export interface PvpEvent<T = unknown> {
  type: string;
  data: T;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  username: string;
  email: string;
  amount: number;
  balance_after: number;
  type: string;
  description: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  admin_username: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AntiCheatEvent {
  id: string;
  user_id: string | null;
  username: string | null;
  event_type: string;
  severity: string;
  details: Record<string, unknown>;
  resolved: boolean;
  created_at: string;
}

export interface AnalyticsOverview {
  users_total: number;
  users_active: number;
  users_blocked: number;
  new_users_today: number;
  game_sessions_total: number;
  games_completed: number;
  active_sessions: number;
  pvp_matches_finished: number;
  packs_opened_total: number;
  coins_total: number;
  anti_cheat_events_total: number;
  anti_cheat_events_unresolved: number;
}

export interface AdminPack extends Pack {
  probabilities: PackProbability[];
}

export interface AdminQuestion {
  id: string;
  game_code: string;
  question_data: Record<string, unknown>;
  correct_answer: unknown;
  difficulty: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}
