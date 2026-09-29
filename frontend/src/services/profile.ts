import { apiFetch } from './http';
import type { Profile } from '../types/api';

export type ProfilePatch = Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>;

export interface ProfileService {
  getMe(): Promise<Profile>;
  updateMe(patch: ProfilePatch): Promise<Profile>;
  giveConsent(): Promise<Profile>;
  deleteAccount(): Promise<void>;
  exportData(): Promise<unknown>;
}

export const httpProfileService: ProfileService = {
  // TODO(Antigravity): GET /v1/me
  getMe: () => apiFetch<Profile>('/v1/me'),
  // TODO(Antigravity): PATCH /v1/me
  updateMe: (patch) => apiFetch<Profile>('/v1/me', { method: 'PATCH', body: JSON.stringify(patch) }),
  // TODO(Antigravity): POST /v1/me/consent (record age 18+ and AI-companion acknowledgement)
  giveConsent: () => apiFetch<Profile>('/v1/me/consent', { method: 'POST' }),
  // TODO(Antigravity): DELETE /v1/me (hard delete account + data)
  deleteAccount: () => apiFetch<void>('/v1/me', { method: 'DELETE' }),
  // TODO(Antigravity): GET /v1/me/export -> JSON bundle of all user data
  exportData: () => apiFetch<unknown>('/v1/me/export'),
};
