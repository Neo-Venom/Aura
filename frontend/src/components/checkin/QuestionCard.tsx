import { OptionCard } from './OptionCard';
import { en } from '../../copy/en';
import type { QuestionItem } from '../../types/api';

interface Props {
  item: QuestionItem;
  options: { value: number; label: string; short_label: string }[];
  value: number | null | undefined;
  onAnswer(v: number | null): void;
}

export function QuestionCard({ item, options, value, onAnswer }: Props) {
  const prompt = item.scale === 'frequency_2wk' ? en.checkin.prompt2wk : en.checkin.promptWeek;
  return (
    <section className="card p-6 sm:p-10 animate-rise" key={item.id} data-testid={`question-card-${item.id}`} aria-labelledby={`q-${item.id}`}>
      <p className="text-sm font-bold uppercase tracking-wider text-muted">{prompt}</p>
      <h1 id={`q-${item.id}`} className="mt-3 text-2xl font-bold leading-snug sm:text-3xl" data-testid="question-text">{item.text}</h1>
      <div role="radiogroup" aria-labelledby={`q-${item.id}`} className="mt-8 grid gap-3">
        {options.map((o, i) => (
          <OptionCard key={o.value} index={i} label={o.short_label} selected={value === o.value} onSelect={() => onAnswer(o.value)} />
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => onAnswer(null)} data-testid="checkin-prefer-not"
          className="min-h-[44px] rounded-full px-2 text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
          {en.checkin.preferNot}
        </button>
        <span className="hidden text-xs text-muted sm:inline">{en.checkin.shortcut}</span>
      </div>
    </section>
  );
}
