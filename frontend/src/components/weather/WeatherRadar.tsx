import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { en } from '../../copy/en';
import type { DimensionResult } from '../../types/api';

export function WeatherRadar({ dims }: { dims: DimensionResult[] }) {
  const data = dims.map((d) => ({ label: en.weather.dims[d.key], value: Math.max(d.score_pct, 4) }));
  return (
    <div className="h-[300px] w-full sm:h-[360px]" data-testid="weather-radar" role="img"
      aria-label={dims.map((d) => `${en.weather.dims[d.key]}: ${en.weather.bands[d.band]}`).join(', ')}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="66%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
          <PolarGrid stroke="rgb(var(--c-lavender))" strokeOpacity={0.45} />
          <PolarAngleAxis dataKey="label" tick={{ fill: 'rgb(var(--c-ink))', fontSize: 13, fontWeight: 600, fontFamily: 'Nunito' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="rgb(var(--c-terracotta))" strokeWidth={2.5} fill="rgb(var(--c-apricot))" fillOpacity={0.35}
            strokeLinejoin="round" isAnimationActive={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
