import type { ReactNode } from 'react';
import { HeartHandshake } from 'lucide-react';
import { ResourceList } from './ResourceList';
import { useProfile } from '../../app/auth';
import { en } from '../../copy/en';

export function CrisisCard({ title = en.support.inlineTitle, children, testId = 'crisis-card' }: { title?: string; children?: ReactNode; testId?: string }) {
  const { data } = useProfile();
  return (
    <section data-testid={testId} aria-label={en.support.title} className="rounded-4xl border border-line bg-surface p-5 shadow-soft animate-rise sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lavender/35">
          <HeartHandshake className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-base font-semibold leading-relaxed">{title}</p>
      </div>
      <ResourceList country={data?.country_code ?? null} compact />
      {children}
    </section>
  );
}
