import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AuthProvider, useAuth } from './auth';
import { ThemeSync } from './theme';
import { ToastProvider } from '../components/common/ToastProvider';
import { CrisisModal } from '../components/safety/CrisisModal';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } },
});

function GlobalCrisis() {
  const { session } = useAuth();
  return session ? <CrisisModal /> : null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Tooltip.Provider delayDuration={300}>
          <ThemeSync />
          {children}
          <GlobalCrisis />
          <ToastProvider />
        </Tooltip.Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
