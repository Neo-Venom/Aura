import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useProfile } from './auth';
import { Splash } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Splash />;
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  if (!ready) return <Splash />;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

// stage: 'consent' page, 'onboarding' (checkin/results) or 'app'
export function Gate({ stage, children }: { stage: 'consent' | 'onboarding' | 'app'; children: ReactNode }) {
  const { data: p, isLoading, isError, refetch } = useProfile();
  if (isLoading) return <Splash />;
  if (isError || !p) return <ErrorState onRetry={() => refetch()} />;
  if (stage !== 'consent' && !p.consent_given) return <Navigate to="/onboarding/consent" replace />;
  if (stage === 'consent' && p.consent_given) {
    return <Navigate to={p.assessment_status === 'not_started' ? '/onboarding/checkin' : '/app'} replace />;
  }
  // NOTE: 'in_progress' (saved to finish later) is allowed into the app; the chat banner invites them back.
  if (stage === 'app' && p.assessment_status === 'not_started') return <Navigate to="/onboarding/checkin" replace />;
  return <>{children}</>;
}
