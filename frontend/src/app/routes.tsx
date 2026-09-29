import { lazy, Suspense, type ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Gate, PublicOnly, RequireAuth } from './guards';
import { Splash } from '../components/common/EmptyState';
import { AppShell } from '../components/shell/AppShell';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Consent from '../pages/Consent';
import Checkin from '../pages/Checkin';
import Results from '../pages/Results';
import Chat from '../pages/Chat';
import Conversation from '../pages/Conversation';
import Crisis from '../pages/Crisis';
import { Privacy, Terms } from '../pages/Legal';

const Calm = lazy(() => import('../pages/Calm'));
const Weather = lazy(() => import('../pages/Weather'));
const Settings = lazy(() => import('../pages/Settings'));

const authed = (stage: 'consent' | 'onboarding' | 'app', el: ReactElement) => (
  <RequireAuth><Gate stage={stage}>{el}</Gate></RequireAuth>
);

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Splash />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/crisis" element={<Crisis />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/onboarding/consent" element={authed('consent', <Consent />)} />
          <Route path="/onboarding/checkin" element={authed('onboarding', <Checkin />)} />
          <Route path="/onboarding/results" element={authed('onboarding', <Results />)} />
          <Route path="/app" element={authed('app', <AppShell />)}>
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:sessionId" element={<Conversation />} />
            <Route path="calm" element={<Calm />} />
            <Route path="weather" element={<Weather />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
