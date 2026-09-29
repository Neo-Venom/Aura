import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { WeatherRadar } from './WeatherRadar';
import { BrightnessGauge } from './BrightnessGauge';
import { DimensionRow } from './DimensionRow';
import { CrisisCard } from '../safety/CrisisCard';
import { Button } from '../ui-kit/Button';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { BreathingOrb } from '../calm/BreathingOrb';
import { useAuth } from '../../app/auth';
import { getServices } from '../../services';
import { en } from '../../copy/en';

export const useLatestResult = () => {
  const { session } = useAuth();
  return useQuery({ queryKey: ['assessment', 'latest', session?.user_id], queryFn: () => getServices().assessmentService.getLatest() });
};

export function WeatherView({ inApp }: { inApp?: boolean }) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useLatestResult();

  if (isLoading) return <div className="flex justify-center py-24"><BreathingOrb size={48} label={en.common.loading} /></div>;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data) {
    return (
      <EmptyState title={en.weather.emptyTitle} body={en.weather.emptyBody} testId="weather-empty"
        action={<Button onClick={() => { getServices().assessmentService.clearDraft(); navigate('/onboarding/checkin'); }} data-testid="weather-take-checkin">{en.weather.emptyCta}</Button>} />
    );
  }

  const heavy = data.dimensions.filter((d) => d.key !== 'brightness');
  const bright = data.dimensions.find((d) => d.key === 'brightness');
  const taken = new Date(data.created_at).toLocaleDateString([], { day: 'numeric', month: 'long' });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6" data-testid="weather-view">
      <header className="space-y-3 animate-rise">
        <h1 className="font-display text-4xl sm:text-5xl">{en.weather.title}</h1>
        <p className="max-w-xl text-base text-muted md:text-lg">{en.weather.sub}</p>
        <p className="text-sm text-muted">{en.weather.taken(taken)}</p>
      </header>
      {data.show_support_card && (
        <CrisisCard title={en.support.resultsCard} testId="results-support-card">
          <Button className="mt-5" onClick={() => navigate('/app/chat')} data-testid="support-card-continue">{en.support.continueToChat}</Button>
        </CrisisCard>
      )}
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section className="card p-4 sm:p-6" aria-labelledby="heavy-h">
          <h2 id="heavy-h" className="px-2 text-base font-bold md:text-lg">{en.weather.heaviness}</h2>
          <WeatherRadar dims={heavy} />
        </section>
        {bright && (
          <section className="card flex flex-col justify-center p-6" aria-labelledby="bright-h">
            <h2 id="bright-h" className="mb-2 text-center text-base font-bold md:text-lg">{en.weather.brightness}</h2>
            <BrightnessGauge dim={bright} />
          </section>
        )}
      </div>
      <ul className="grid gap-2" data-testid="dimension-list">
        {heavy.map((d) => <DimensionRow key={d.key} dim={d} />)}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={() => navigate('/app/chat')} data-testid="weather-start-talking">{en.weather.cta}</Button>
        {inApp && (
          <Link to="/onboarding/checkin" onClick={() => getServices().assessmentService.clearDraft()} data-testid="weather-retake-link"
            className="inline-flex min-h-[44px] items-center rounded-full px-4 font-semibold underline-offset-4 hover:underline">
            {en.weather.retake}
          </Link>
        )}
      </div>
    </div>
  );
}
