import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sun } from 'lucide-react';
import { WeatherRadar } from './WeatherRadar';
import { BrightnessGauge } from './BrightnessGauge';
import { DimensionRow } from './DimensionRow';
import { Modal } from '../ui-kit/Dialog';
import { Button } from '../ui-kit/Button';
import { useAuth } from '../../app/auth';
import { getServices } from '../../services';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { AssessmentResult } from '../../types/api';

const MAX = 4;

function SnapshotCard({
  r,
  latest,
  onSelect,
}: {
  r: AssessmentResult;
  latest: boolean;
  onSelect: (r: AssessmentResult) => void;
}) {
  const heavy = r.dimensions.filter((d) => d.key !== 'brightness');
  const bright = r.dimensions.find((d) => d.key === 'brightness');
  const date = new Date(r.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' });
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => onSelect(r)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(r);
        }
      }}
      aria-label={`View check-in from ${date}`}
      className={cn(
        'min-w-0 cursor-pointer rounded-4xl bg-surface p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender',
        latest && 'ring-2 ring-lavender/70',
      )}
      data-testid={`history-card-${r.id}`}
    >
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
  const [selected, setSelected] = useState<AssessmentResult | null>(null);
  const { data } = useQuery({
    queryKey: ['assessment', 'history', session?.user_id],
    queryFn: () => getServices().assessmentService.getHistory(),
  });

  if (!data || data.length < 2) return null;
  const list = data.slice(0, MAX).reverse();

  const selectedHeavy = selected?.dimensions.filter((d) => d.key !== 'brightness') ?? [];
  const selectedBright = selected?.dimensions.find((d) => d.key === 'brightness');
  const selectedDate = selected
    ? new Date(selected.created_at).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <section aria-labelledby="history-h" className="space-y-3" data-testid="weather-history">
      <div>
        <h2 id="history-h" className="text-base font-bold md:text-lg">{en.weather.history}</h2>
        <p className="text-sm text-muted">{en.weather.historyHint}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {list.map((r, i) => (
          <SnapshotCard
            key={r.id}
            r={r}
            latest={i === list.length - 1}
            onSelect={setSelected}
          />
        ))}
      </ul>

      {selected && (
        <Modal
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          title={`Check-in: ${selectedDate}`}
          description={en.weather.taken(selectedDate)}
          testId="history-detail-modal"
          className="max-w-2xl"
        >
          <div className="space-y-6 pt-2" data-testid="history-detail-content">
            <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr]">
              <div className="card p-4">
                <h3 className="px-1 text-sm font-bold text-ink/80">{en.weather.heaviness}</h3>
                <WeatherRadar dims={selectedHeavy} />
              </div>
              {selectedBright && (
                <div className="card flex flex-col justify-center p-4">
                  <h3 className="mb-2 text-center text-sm font-bold text-ink/80">{en.weather.brightness}</h3>
                  <BrightnessGauge dim={selectedBright} />
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-bold text-ink/80">{en.weather.heaviness} & {en.weather.brightness}</h3>
              <ul className="grid gap-2" data-testid="history-detail-dimensions">
                {selectedHeavy.map((d) => (
                  <DimensionRow key={d.key} dim={d} />
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="soft"
                onClick={() => setSelected(null)}
                data-testid="history-detail-close"
              >
                {en.common.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
