import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { DimensionResult } from '../../types/api';

export function WeatherRadar({ dims, mini }: { dims: DimensionResult[]; mini?: boolean }) {
  const data = dims.map((d) => ({ label: en.weather.dims[d.key], value: Math.max(d.score_pct, 4) }));
  return (
    <div className={cn('w-full', mini ? 'h-[150px]' : 'h-[300px] sm:h-[360px]')} data-testid={mini ? 'weather-radar-mini' : 'weather-radar'} role="img"
      aria-label={dims.map((d) => `${en.weather.dims[d.key]}: ${en.weather.bands[d.band]}`).join(', ')}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={mini ? '78%' : '66%'} margin={mini ? { top: 4, right: 4, bottom: 4, left: 4 } : { top: 8, right: 36, bottom: 8, left: 36 }}>
          <PolarGrid stroke="rgb(var(--c-lavender))" strokeOpacity={0.45} />
          <PolarAngleAxis dataKey="label" tick={mini ? false : { fill: 'rgb(var(--c-ink))', fontSize: 13, fontWeight: 600, fontFamily: 'Nunito' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="rgb(var(--c-terracotta))" strokeWidth={mini ? 1.5 : 2.5} fill="rgb(var(--c-apricot))" fillOpacity={0.35}
            strokeLinejoin="round" isAnimationActive={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
