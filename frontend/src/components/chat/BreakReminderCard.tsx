import { Coffee, Flower2, Wind, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUi } from '../../app/store';
import { en } from '../../copy/en';

export function BreakReminderCard({ onDismiss }: { onDismiss(): void }) {
  const setTool = useUi((s) => s.setTool);
  return (
    <div className="relative rounded-4xl bg-butter/35 p-5 pr-14 animate-rise" data-testid="break-reminder-card" role="note">
      <div className="flex items-start gap-3">
        <Coffee className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="font-semibold">{en.chat.breakTitle}</p>
      </div>
      <button type="button" onClick={() => setTool('breathing')} data-testid="break-reminder-breathe"
        className="ml-8 mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-surface px-4 text-sm font-bold shadow-soft transition-transform hover:-translate-y-0.5">
        <Wind className="h-4 w-4" aria-hidden="true" />{en.chat.breakAction}
      </button>
      <button type="button" onClick={onDismiss} aria-label={en.chat.dismiss} data-testid="break-reminder-dismiss"
        className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface/60">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RestCard() {
  return (
    <div className="rounded-4xl bg-sky/30 p-5 animate-rise" data-testid="rest-card" role="status">
      <p className="font-semibold">{en.chat.rest}</p>
      <Link to="/app/calm" data-testid="rest-card-calm-link"
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-surface px-4 text-sm font-bold shadow-soft">
        <Flower2 className="h-4 w-4" aria-hidden="true" />{en.chat.openCalm}
      </Link>
    </div>
  );
}
