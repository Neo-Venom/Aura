import { authStore } from '../auth';
import { ApiError } from '../http';
import type { ProfileService } from '../profile';
import { currentUserId, db, latency } from './db';

export const mockProfileService: ProfileService = {
  async getMe() {
    await latency();
    const p = db.load().users[currentUserId()];
    if (!p) { authStore.set(null); throw new ApiError('unauthorized', 'No profile', 401); }
    return p;
  },
  async updateMe(patch) {
    await latency();
    const id = currentUserId();
    return db.update((d) => (d.users[id] = { ...d.users[id], ...patch }));
  },
  async giveConsent() {
    return this.updateMe({ consent_given: true });
  },
  async deleteAccount() {
    await latency();
    const id = currentUserId();
    db.update((d) => {
      (d.sessions[id] ?? []).forEach((s) => delete d.messages[s.id]);
      delete d.sessions[id];
      delete d.assessments[id];
      delete d.users[id];
    });
    authStore.set(null);
  },
  async exportData() {
    await latency();
    const id = currentUserId();
    const d = db.load();
    const sessions = d.sessions[id] ?? [];
    return {
      exported_at: new Date().toISOString(),
      profile: d.users[id],
      check_ins: d.assessments[id] ?? [],
      chats: sessions.map((s) => ({ ...s, messages: d.messages[s.id] ?? [] })),
    };
  },
};
