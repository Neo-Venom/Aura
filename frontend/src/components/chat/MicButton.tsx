import { Mic, Square } from 'lucide-react';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';

export function MicButton({ listening, onToggle, disabled }: { listening: boolean; onToggle(): void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? en.chat.micStop : en.chat.micStart}
      data-testid="chat-mic-button"
      className={cn(
        'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,color] duration-200',
        listening ? 'bg-sage text-on-accent' : 'text-muted hover:bg-soft hover:text-ink',
        'disabled:opacity-50',
      )}
    >
      {listening && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0" data-testid="mic-ripple">
          <span className="absolute inset-0 rounded-full bg-sage/40 animate-ripple" />
          <span className="absolute inset-0 rounded-full bg-sage/30 animate-ripple" style={{ animationDelay: '0.8s' }} />
          <span className="absolute inset-0 rounded-full bg-sage/20 animate-ripple" style={{ animationDelay: '1.6s' }} />
        </span>
      )}
      {listening ? <Square className="relative h-4 w-4 fill-current" /> : <Mic className="relative h-5 w-5" />}
    </button>
  );
}
