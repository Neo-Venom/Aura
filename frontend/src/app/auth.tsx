import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getServices } from '../services';
import type { AuthSession } from '../services/auth';
import type { ProfilePatch } from '../services/profile';
import type { Profile } from '../types/api';

const AuthCtx = createContext<{ session: AuthSession | null; ready: boolean }>({ session: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { authService } = getServices();
  const [state, setState] = useState<{ session: AuthSession | null; ready: boolean }>({ session: null, ready: false });
  const qc = useQueryClient();

  useEffect(() => {
    authService.getSession().then((session) => setState({ session, ready: true }));
    return authService.onAuthChange((session) => {
      if (!session) qc.clear();
      setState({ session, ready: true });
    });
  }, [authService, qc]);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export function useProfile() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['me', session?.user_id],
    queryFn: () => getServices().profileService.getMe(),
    enabled: !!session,
    staleTime: Infinity,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => getServices().profileService.updateMe(patch),
    onMutate: (patch) => {
      const key = ['me', session?.user_id];
      const prev = qc.getQueryData<Profile>(key);
      if (prev) qc.setQueryData<Profile>(key, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => { if (ctx?.prev) qc.setQueryData(['me', session?.user_id], ctx.prev); },
    onSuccess: (p) => qc.setQueryData(['me', session?.user_id], p),
  });
}

export const setProfileCache = (qc: ReturnType<typeof useQueryClient>, p: Profile) => qc.setQueryData(['me', p.id], p);
