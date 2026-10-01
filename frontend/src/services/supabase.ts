import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../lib/env';
import { authStore, type AuthService, type AuthSession, type SignUpInput } from './auth';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

export const supabaseAuthService: AuthService = {
  async signUp(input: SignUpInput): Promise<AuthSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          display_name: input.display_name,
          country_code: input.country_code,
        },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.session) {
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }
      throw new Error('Confirmation email sent! Please check your email to confirm your account, or disable "Confirm email" in Supabase Dashboard.');
    }
    const session: AuthSession = {
      token: data.session.access_token,
      user_id: data.user?.id || '',
      email: data.user?.email || input.email,
    };
    authStore.set(session);
    return session;
  },

  async logIn(email: string, password: string): Promise<AuthSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const session: AuthSession = {
      token: data.session?.access_token || '',
      user_id: data.user?.id || '',
      email: data.user?.email || email,
    };
    authStore.set(session);
    return session;
  },

  async logInWithGoogle(): Promise<AuthSession> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app/chat` },
    });
    if (error) throw new Error(error.message);
    const current = await this.getSession();
    if (!current) throw new Error('Google sign in pending');
    return current;
  },

  async logOut(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    authStore.set(null);
  },

  async getSession(): Promise<AuthSession | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return authStore.get();
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    return {
      token: data.session.access_token,
      user_id: data.session.user.id,
      email: data.session.user.email || '',
    };
  },

  onAuthChange(cb: (s: AuthSession | null) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) return authStore.subscribe(cb);
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const s: AuthSession = {
          token: session.access_token,
          user_id: session.user.id,
          email: session.user.email || '',
        };
        authStore.set(s);
        cb(s);
      } else {
        authStore.set(null);
        cb(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  },
};
