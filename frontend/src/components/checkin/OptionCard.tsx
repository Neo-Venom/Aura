import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export function OptionCard({ index, label, selected, onSelect }: { index: number; label: string; selected: boolean; onSelect(): void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      data-testid={`checkin-option-${index}`}
      className={cn(
        'group flex min-h-[56px] w-full items-center gap-4 rounded-3xl border px-5 py-3 text-left text-base font-semibold',
        'transition-[background-color,border-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender',
        selected ? 'border-lavender bg-lavender/35 shadow-soft' : 'border-line bg-surface hover:border-lavender/70 hover:shadow-soft',
      )}
    >
      <kbd className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold transition-colors',
        selected ? 'bg-sage text-on-accent' : 'bg-soft text-ink',
      )} aria-hidden="true">
        {selected ? <Check className="h-4 w-4" /> : index + 1}
      </kbd>
      <span className="flex-1">{label}</span>
    </button>
  );
}
