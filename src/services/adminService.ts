import {
  buildQuery,
  getData,
  getEnvelope,
  patchData,
  postData,
  putData,
} from '@/services/api';
import type {
  AdminQuestion,
  AdminTransaction,
  AdminUser,
  AnalyticsOverview,
  AntiCheatEvent,
  AppSetting,
  AuditLog,
  Card,
  Pack,
  Player,
} from '@/types/api';

export interface AdminPlayer extends Player {
  external_id: string | null;
  created_at: string;
}

export interface AdminCard extends Omit<Card, 'player_full_name' | 'nationality' | 'position' | 'club' | 'league' | 'season'> {
  season: string | null;
}

export const adminService = {
  users(search: string, page = 1, limit = 20) {
    return getEnvelope<AdminUser[]>(
      `/admin/users${buildQuery({ search, page, limit })}`,
    );
  },
  updateUser(
    userId: string,
    body: { role?: string; status?: string; email_verified?: boolean },
  ) {
    return patchData<AdminUser>(`/admin/users/${userId}`, body);
  },
  adjustBalance(body: {
    user_id: string;
    amount: number;
    reason: string;
    idempotency_key?: string;
  }) {
    return postData<AdminTransaction>('/admin/economy/adjust', body);
  },
  transactions(
    page = 1,
    limit = 20,
    userId?: string,
    type?: string,
  ) {
    return getEnvelope<AdminTransaction[]>(
      `/admin/economy/transactions${buildQuery({
        page,
        limit,
        user_id: userId,
        type,
      })}`,
    );
  },
  auditLogs(page = 1, limit = 20) {
    return getEnvelope<AuditLog[]>(
      `/admin/audit-logs${buildQuery({ page, limit })}`,
    );
  },
  antiCheatEvents(page = 1, limit = 20) {
    return getEnvelope<AntiCheatEvent[]>(
      `/admin/anti-cheat/events${buildQuery({ page, limit })}`,
    );
  },
  analytics() {
    return getData<AnalyticsOverview>('/admin/analytics/overview');
  },
  settings() {
    return getData<AppSetting[]>('/admin/settings');
  },
  updateSetting(key: string, value: unknown, description?: string) {
    return putData<AppSetting>(
      `/admin/settings/${encodeURIComponent(key)}`,
      { value, description: description ?? null },
    );
  },
  players(search = '', page = 1, limit = 20) {
    return getEnvelope<AdminPlayer[]>(
      `/admin/players${buildQuery({ search, page, limit })}`,
    );
  },
  createPlayer(body: Record<string, unknown>) {
    return postData<AdminPlayer>('/admin/players', body);
  },
  updatePlayer(playerId: string, body: Record<string, unknown>) {
    return patchData<AdminPlayer>(`/admin/players/${playerId}`, body);
  },
  cards(search = '', page = 1, limit = 20) {
    return getEnvelope<AdminCard[]>(
      `/admin/cards${buildQuery({ search, page, limit })}`,
    );
  },
  createCard(body: Record<string, unknown>) {
    return postData<AdminCard>('/admin/cards', body);
  },
  updateCard(cardId: string, body: Record<string, unknown>) {
    return patchData<AdminCard>(`/admin/cards/${cardId}`, body);
  },
  packs(page = 1, limit = 20) {
    return getEnvelope<Pack[]>(`/admin/packs${buildQuery({ page, limit })}`);
  },
  createPack(body: Record<string, unknown>) {
    return postData<Pack>('/admin/packs', body);
  },
  updatePack(packId: string, body: Record<string, unknown>) {
    return patchData<Pack>(`/admin/packs/${packId}`, body);
  },
  replacePackProbabilities(packId: string, body: unknown[]) {
    return putData<Pack>(`/admin/packs/${packId}/probabilities`, body);
  },
  questions(gameCode?: string, page = 1, limit = 20) {
    return getEnvelope<AdminQuestion[]>(
      `/admin/questions${buildQuery({ game_code: gameCode, page, limit })}`,
    );
  },
  createQuestion(body: Record<string, unknown>) {
    return postData<AdminQuestion>('/admin/questions', body);
  },
  updateQuestion(questionId: string, body: Record<string, unknown>) {
    return patchData<AdminQuestion>(
      `/admin/questions/${questionId}`,
      body,
    );
  },
};
