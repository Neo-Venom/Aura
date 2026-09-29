import type { ReactNode } from 'react';
import { BreathingOrb } from '../calm/BreathingOrb';
import { CloudShape } from '../decor/Illustrations';
import { en } from '../../copy/en';

export function EmptyState({ title, body, action, testId = 'empty-state' }: { title: string; body?: string; action?: ReactNode; testId?: string }) {
  return (
    <div data-testid={testId} className="flex flex-col items-center gap-3 px-6 py-12 text-center animate-rise">
      <CloudShape className="h-16 w-24 text-sky" />
      <h2 className="text-lg font-bold">{title}</h2>
      {body && <p className="max-w-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function Splash() {
  return (
    <div className="flex min-h-dvh-screen items-center justify-center" data-testid="splash" role="status" aria-label={en.common.loading}>
      <BreathingOrb size={56} />
    </div>
  );
}
