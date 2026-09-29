import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { Profile } from '../../types/api';

const SWATCHES: { key: Profile['accent']; cls: string }[] = [
  { key: 'apricot', cls: 'bg-apricot' }, { key: 'sage', cls: 'bg-sage' }, { key: 'lavender', cls: 'bg-lavender' },
  { key: 'butter', cls: 'bg-butter' }, { key: 'sky', cls: 'bg-sky' },
];

export function AccentPicker({ value, onChange }: { value: Profile['accent']; onChange(v: Profile['accent']): void }) {
  return (
    <div role="radiogroup" aria-label={en.settings.accent} className="flex flex-wrap gap-3" data-testid="accent-picker">
      {SWATCHES.map((s) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={value === s.key}
          aria-label={en.accents[s.key]}
          onClick={() => onChange(s.key)}
          data-testid={`accent-swatch-${s.key}`}
          className="group flex flex-col items-center gap-1.5"
        >
          <span className={cn(
            'inline-flex h-12 w-12 items-center justify-center rounded-full transition-[transform,box-shadow] duration-200 group-hover:scale-105',
            s.cls, value === s.key && 'ring-2 ring-ink ring-offset-2 ring-offset-surface',
          )}>
            {value === s.key && <Check className="h-5 w-5 text-on-accent" aria-hidden="true" />}
          </span>
          <span className="text-xs font-semibold">{en.accents[s.key]}</span>
        </button>
      ))}
    </div>
  );
}
