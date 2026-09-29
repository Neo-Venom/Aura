import * as S from '@radix-ui/react-switch';
import * as T from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Switch({ checked, onCheckedChange, id, testId, label }: { checked: boolean; onCheckedChange(v: boolean): void; id: string; testId: string; label?: string }) {
  return (
    <S.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      data-testid={testId}
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200',
        checked ? 'bg-sage' : 'bg-line',
      )}
    >
      <S.Thumb className="block h-6 w-6 translate-x-1 rounded-full bg-white shadow-soft transition-transform duration-200 data-[state=checked]:translate-x-7" />
    </S.Root>
  );
}

export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content sideOffset={6} className="z-50 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-canvas shadow-soft animate-in fade-in-0">
          {label}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}

export function Segmented<V extends string>({ value, onChange, options, name, testId }: {
  value: V; onChange(v: V): void; options: { value: V; label: string }[]; name: string; testId: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="inline-flex flex-wrap gap-1 rounded-full bg-soft p-1" data-testid={testId}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          data-testid={`${testId}-${o.value}`}
          onClick={() => onChange(o.value)}
          className={cn(
            'min-h-[44px] rounded-full px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200',
            value === o.value ? 'bg-surface text-ink shadow-soft ring-1 ring-lavender/60' : 'text-ink/80 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
