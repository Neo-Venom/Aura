import { apiFetch, SESSION_KEY } from './http';
import { readJSON, writeJSON } from '../lib/cn';

export interface AuthSession { token: string; user_id: string; email: string }
export interface SignUpInput { email: string; password: string; display_name: string | null; country_code: string | null }

export interface AuthService {
  signUp(input: SignUpInput): Promise<AuthSession>;
  logIn(email: string, password: string): Promise<AuthSession>;
  logInWithGoogle(): Promise<AuthSession>;
  logOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthChange(cb: (s: AuthSession | null) => void): () => void;
}

const listeners = new Set<(s: AuthSession | null) => void>();

export const authStore = {
  get: () => readJSON<AuthSession | null>(SESSION_KEY, null),
  set: (s: AuthSession | null) => {
    if (s) writeJSON(SESSION_KEY, s);
    else localStorage.removeItem(SESSION_KEY);
    listeners.forEach((l) => l(s));
  },
  subscribe: (cb: (s: AuthSession | null) => void) => {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },
};

export const httpAuthService: AuthService = {
  // TODO(Antigravity): POST /v1/auth/signup -> { token, user_id, email }
  async signUp(input) {
    const s = await apiFetch<AuthSession>('/v1/auth/signup', { method: 'POST', body: JSON.stringify(input) });
    authStore.set(s);
    return s;
  },
  // TODO(Antigravity): POST /v1/auth/login -> { token, user_id, email }
  async logIn(email, password) {
    const s = await apiFetch<AuthSession>('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    authStore.set(s);
    return s;
  },
  // TODO(Antigravity): implement OAuth redirect flow; this should redirect and resolve on return.
  async logInWithGoogle() {
    const s = await apiFetch<AuthSession>('/v1/auth/google', { method: 'POST' });
    authStore.set(s);
    return s;
  },
  // TODO(Antigravity): POST /v1/auth/logout (invalidate token server-side)
  async logOut() {
    try { await apiFetch<void>('/v1/auth/logout', { method: 'POST' }); } finally { authStore.set(null); }
  },
  async getSession() { return authStore.get(); },
  onAuthChange: authStore.subscribe,
};
