import { authStore, type AuthService, type AuthSession } from '../auth';
import { db, latency, nowIso, uid } from './db';
import type { Profile } from '../../types/api';

const newProfile = (email: string, display_name: string | null, country_code: string | null): Profile => ({
  id: uid(), email, display_name, country_code, consent_given: false, assessment_status: 'not_started',
  accent: 'apricot', theme_mode: 'light', text_size: 'md', auto_send_voice: false, stt_language: null, created_at: nowIso(),
});

const findByEmail = (email: string) =>
  Object.values(db.load().users).find((u) => u.email.toLowerCase() === email.toLowerCase());

const open = (p: Profile): AuthSession => {
  const s = { token: `mock.${uid()}`, user_id: p.id, email: p.email };
  authStore.set(s);
  return s;
};

export const mockAuthService: AuthService = {
  async signUp({ email, display_name, country_code }) {
    await latency();
    const existing = findByEmail(email);
    if (existing) return open(existing);
    const p = newProfile(email, display_name, country_code);
    db.update((d) => { d.users[p.id] = p; });
    return open(p);
  },
  async logIn(email) {
    await latency();
    // NOTE: any valid-looking email/password works; unknown emails get a fresh profile.
    const p = findByEmail(email) ?? newProfile(email, null, null);
    db.update((d) => { d.users[p.id] = p; });
    return open(p);
  },
  async logInWithGoogle() {
    return this.logIn('google.user@example.com', 'mock');
  },
  async logOut() { authStore.set(null); },
  async getSession() { return authStore.get(); },
  onAuthChange: authStore.subscribe,
};
