import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getServices } from '../../services';
import { useAuth } from '../../app/auth';

export function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function useSessions(q: string) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['sessions', session?.user_id, q],
    queryFn: () => getServices().chatService.listSessions({ q }),
    enabled: !!session,
  });
}

export function useSessionMutations() {
  const qc = useQueryClient();
  const { chatService } = getServices();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['sessions'] });
  const rename = useMutation({ mutationFn: (p: { id: string; title: string }) => chatService.renameSession(p.id, p.title), onSettled: invalidate });
  const remove = useMutation({ mutationFn: (id: string) => chatService.deleteSession(id), onSettled: invalidate });
  return { rename, remove };
}
