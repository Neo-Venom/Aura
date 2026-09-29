import { useQuery } from '@tanstack/react-query';
import { Sun } from 'lucide-react';
import { WeatherRadar } from './WeatherRadar';
import { useAuth } from '../../app/auth';
import { getServices } from '../../services';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { AssessmentResult } from '../../types/api';

const MAX = 4;

function SnapshotCard({ r, latest }: { r: AssessmentResult; latest: boolean }) {
  const heavy = r.dimensions.filter((d) => d.key !== 'brightness');
  const bright = r.dimensions.find((d) => d.key === 'brightness');
  const date = new Date(r.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' });
  return (
    <li className={cn('min-w-0 rounded-4xl bg-surface p-4 shadow-soft', latest && 'ring-2 ring-lavender/70')} data-testid={`history-card-${r.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-1 px-1">
        <time dateTime={r.created_at} className="text-sm font-bold">{date}</time>
        {latest && <span className="rounded-full bg-lavender/35 px-2.5 py-0.5 text-xs font-bold">{en.weather.latest}</span>}
      </div>
      <WeatherRadar dims={heavy} mini />
      {bright && (
        <p className="flex flex-wrap items-center gap-x-1.5 px-1 text-sm">
          <Sun className="h-4 w-4 shrink-0 text-apricot" aria-hidden="true" />
          <span className="font-semibold">{en.weather.brightness}:</span> {en.weather.brightBands[bright.band]}
        </p>
      )}
    </li>
  );
}

export function WeatherHistory() {
  const { session } = useAuth();
  const { data } = useQuery({
    queryKey: ['assessment', 'history', session?.user_id],
    queryFn: () => getServices().assessmentService.getHistory(),
  });
  if (!data || data.length < 2) return null;
  const list = data.slice(0, MAX).reverse();
  return (
    <section aria-labelledby="history-h" className="space-y-3" data-testid="weather-history">
      <div>
        <h2 id="history-h" className="text-base font-bold md:text-lg">{en.weather.history}</h2>
        <p className="text-sm text-muted">{en.weather.historyHint}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {list.map((r, i) => <SnapshotCard key={r.id} r={r} latest={i === list.length - 1} />)}
      </ul>
    </section>
  );
}
