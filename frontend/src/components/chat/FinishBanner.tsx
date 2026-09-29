import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, X } from 'lucide-react';
import { useProfile } from '../../app/auth';
import { getServices } from '../../services';
import { en } from '../../copy/en';

const KEY = 'aura.finishBannerDismissed';

export function FinishBanner() {
  const { data: me } = useProfile();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(KEY) === '1');
  const draft = getServices().assessmentService.loadDraft();
  const partial = !!draft && Object.keys(draft.answers).length > 0 && me?.assessment_status !== 'completed';
  if (!partial || hidden) return null;
  return (
    <div className="mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-chat items-center gap-3 rounded-full bg-lavender/25 py-1.5 pl-4 pr-1.5 text-sm animate-rise" data-testid="finish-checkin-banner">
      <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1 font-semibold">{en.chat.finishBanner}</p>
      <Link to="/onboarding/checkin" data-testid="finish-checkin-link" className="inline-flex min-h-[44px] items-center rounded-full bg-surface px-4 font-bold shadow-soft">
        {en.chat.finishCta}
      </Link>
      <button type="button" aria-label={en.chat.dismiss} data-testid="finish-checkin-dismiss"
        onClick={() => { sessionStorage.setItem(KEY, '1'); setHidden(true); }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface/60">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
