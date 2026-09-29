import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { OnboardingLayout } from '../components/common/Layouts';
import { Button } from '../components/ui-kit/Button';
import { getServices } from '../services';
import { setProfileCache } from '../app/auth';
import { useUi } from '../app/store';
import { cn } from '../lib/cn';
import { en } from '../copy/en';

const ITEMS = [
  { id: 'consent-age', text: en.consent.age },
  { id: 'consent-ai', text: en.consent.ai },
  { id: 'consent-adapt', text: en.consent.adapt },
];

export default function Consent() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const openCrisis = useUi((s) => s.setCrisisOpen);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const all = ITEMS.every((i) => checked[i.id]);

  const submit = async () => {
    setBusy(true);
    try {
      const p = await getServices().profileService.giveConsent();
      setProfileCache(qc, p);
      navigate('/onboarding/checkin');
    } finally { setBusy(false); }
  };

  return (
    <OnboardingLayout>
      <section className="card mx-auto max-w-xl p-7 sm:p-10 animate-rise" data-testid="consent-page">
        <h1 className="font-display text-3xl sm:text-4xl">{en.consent.title}</h1>
        <p className="mt-3 text-muted">{en.consent.body}</p>
        <fieldset className="mt-7 space-y-3">
          <legend className="sr-only">{en.consent.title}</legend>
          {ITEMS.map((i) => (
            <label key={i.id} htmlFor={i.id}
              className={cn('flex cursor-pointer items-start gap-4 rounded-3xl border p-4 transition-colors duration-200',
                checked[i.id] ? 'border-lavender bg-lavender/20' : 'border-line hover:border-lavender/70')}>
              <input id={i.id} type="checkbox" className="peer sr-only" checked={!!checked[i.id]}
                onChange={(e) => setChecked((c) => ({ ...c, [i.id]: e.target.checked }))} data-testid={`${i.id}-checkbox`} />
              <span aria-hidden="true" className={cn('mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[rgb(var(--c-ring))]',
                checked[i.id] ? 'border-sage bg-sage text-on-accent' : 'border-line bg-surface')}>
                {checked[i.id] && <Check className="h-4 w-4" />}
              </span>
              <span className="font-semibold">{i.text}</span>
            </label>
          ))}
        </fieldset>
        <Link to="/privacy" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4" data-testid="consent-privacy-link">{en.consent.privacy}</Link>
        <Button size="lg" className="mt-7 w-full" disabled={!all || busy} onClick={submit} data-testid="consent-submit-button">{en.consent.cta}</Button>
        <p className="mt-6 text-center text-sm text-muted">
          {en.consent.danger}{' '}
          <button type="button" onClick={() => openCrisis(true)} className="font-bold text-ink underline underline-offset-4" data-testid="consent-crisis-link">
            {en.consent.dangerLink}
          </button>
        </p>
      </section>
    </OnboardingLayout>
  );
}
