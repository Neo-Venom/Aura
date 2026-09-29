import { en } from '../../copy/en';
import type { DimensionResult } from '../../types/api';

// Half-circle gauge; a sun rises along the arc as brightness increases.
export function BrightnessGauge({ dim }: { dim: DimensionResult }) {
  const pct = dim.score_pct / 100;
  const angle = Math.PI * (1 - pct);
  const cx = 100 + 80 * Math.cos(angle);
  const cy = 100 - 80 * Math.sin(angle);
  const arcLen = Math.PI * 80;
  const word = en.weather.brightBands[dim.band];
  return (
    <div className="flex flex-col items-center" data-testid="brightness-gauge">
      <svg viewBox="0 0 200 120" className="w-full max-w-[240px]" role="img" aria-label={`${en.weather.brightness}: ${word}`}>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgb(var(--c-line))" strokeWidth="14" strokeLinecap="round" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgb(var(--c-butter))" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={arcLen} strokeDashoffset={arcLen * (1 - pct)} style={{ transition: 'stroke-dashoffset 800ms ease-out' }} />
        <circle cx={cx} cy={cy} r="16" fill="rgb(var(--c-butter))" opacity="0.5" />
        <circle cx={cx} cy={cy} r="10" fill="rgb(var(--c-apricot))" />
      </svg>
      <p className="-mt-2 text-lg font-bold" data-testid="brightness-word">{word}</p>
      <p className="text-sm text-muted">{en.weather.brightnessHint}</p>
    </div>
  );
}
