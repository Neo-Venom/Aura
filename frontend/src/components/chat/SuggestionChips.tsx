import { en } from '../../copy/en';

const TINTS = ['hover:bg-apricot/25', 'hover:bg-sage/25', 'hover:bg-lavender/30', 'hover:bg-butter/40'];

export function SuggestionChips({ onPick }: { onPick(text: string): void }) {
  return (
    <div className="flex flex-wrap justify-center gap-2" data-testid="suggestion-chips">
      {en.chat.chips.map((c, i) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          data-testid={`suggestion-chip-${i}`}
          className={`min-h-[44px] rounded-full border border-line bg-surface px-5 text-sm font-semibold shadow-soft transition-[background-color,transform] duration-200 hover:-translate-y-0.5 animate-rise ${TINTS[i]}`}
          style={{ animationDelay: `${120 + i * 60}ms` }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
