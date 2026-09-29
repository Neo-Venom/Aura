import { en } from '../../copy/en';
import type { DimensionResult } from '../../types/api';

const COLORS: Record<DimensionResult['key'], string> = {
  stress: 'bg-apricot', anxiety: 'bg-lavender', low_mood: 'bg-sky', anger: 'bg-terracotta',
  tiredness: 'bg-butter', grief: 'bg-sage', sadness: 'bg-mint', brightness: 'bg-butter',
};
const FILL: Record<DimensionResult['band'], string> = { low: 'w-1/4', mild: 'w-2/4', moderate: 'w-3/4', high: 'w-full' };

export function DimensionRow({ dim }: { dim: DimensionResult }) {
  return (
    <li className="flex items-center gap-4 rounded-3xl bg-surface px-5 py-3" data-testid={`dimension-row-${dim.key}`}>
      <span className={`h-3 w-3 shrink-0 rounded-full ${COLORS[dim.key]}`} aria-hidden="true" />
      <span className="w-24 shrink-0 font-bold">{en.weather.dims[dim.key]}</span>
      <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-soft sm:block" aria-hidden="true">
        <span className={`block h-full rounded-full opacity-70 ${COLORS[dim.key]} ${FILL[dim.band]}`} />
      </span>
      <span className="ml-auto text-right text-ink/80 sm:w-36" data-testid={`dimension-word-${dim.key}`}>{en.weather.bands[dim.band]}</span>
    </li>
  );
}
