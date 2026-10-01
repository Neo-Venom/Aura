import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { MicButton } from './MicButton';
import { useVoiceInput } from './useVoiceInput';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { InputMode } from '../../types/api';

const MAX = 4000;
const COUNTER_AT = 3500;
const draftKey = (k: string) => `aura.draft.${k}`;

interface Props {
  onSend(content: string, mode: InputMode): void;
  onStop?(): void;
  streaming?: boolean;
  draftId: string;
  seed?: { text: string; n: number };
  autoSendVoice: boolean;
  voiceLang?: string | null;
  autoFocus?: boolean;
}

export function ChatInput({ onSend, onStop, streaming, draftId, seed, autoSendVoice, voiceLang, autoFocus }: Props) {
  const [value, setValue] = useState(() => localStorage.getItem(draftKey(draftId)) ?? '');
  const [mode, setMode] = useState<InputMode>('text');
  const ref = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const submit = (text = valueRef.current) => {
    const t = text.trim();
    if (!t || streaming) return;
    onSend(t.slice(0, MAX), mode);
    setValue('');
    setMode('text');
  };

  const voice = useVoiceInput({
    getValue: () => valueRef.current,
    setValue: (v) => { setValue(v.slice(0, MAX)); setMode('voice'); },
    autoSend: autoSendVoice,
    lang: voiceLang,
    onAutoSend: (t) => submit(t),
  });

  useEffect(() => {
    if (value) localStorage.setItem(draftKey(draftId), value);
    else localStorage.removeItem(draftKey(draftId));
  }, [value, draftId]);

  useEffect(() => {
    if (!seed) return;
    setValue(seed.text);
    ref.current?.focus();
  }, [seed]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    el.style.height = `${Math.min(el.scrollHeight, line * 6 + 16)}px`;
  }, [value]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (voice.listening) voice.stop();
      submit();
    }
  };

  const empty = !value.trim();

  return (
    <div className="mx-auto w-full max-w-chat px-3 pb-safe sm:px-4" data-testid="chat-input-region">
      <div className="flex items-end gap-1 rounded-[28px] border border-line bg-surface p-2 pl-4 shadow-soft transition-[border-color,box-shadow] duration-200 focus-within:border-lavender focus-within:shadow-lift">
        <label htmlFor="chat-input" className="sr-only">{en.chat.placeholder}</label>
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={value}
          maxLength={MAX}
          autoFocus={autoFocus}
          onChange={(e) => { setValue(e.target.value); if (!voice.listening) setMode(e.target.value ? mode : 'text'); }}
          onKeyDown={onKeyDown}
          placeholder={voice.listening ? en.chat.listening : en.chat.placeholder}
          className="max-h-[40vh] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-base leading-[1.6] text-ink placeholder:text-muted focus:outline-none"
          data-testid="chat-input"
        />
        <MicButton listening={voice.listening} onToggle={voice.toggle} />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label={en.chat.stop}
            data-testid="chat-stop-button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-canvas transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { if (voice.listening) voice.stop(); submit(); }}
            disabled={empty}
            aria-label={en.chat.send}
            data-testid="chat-send-button"
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[background-color,transform,opacity] duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender',
              empty ? 'bg-soft text-muted' : 'bg-accent-strong text-white',
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-3 pt-2">
        <p className="text-xs text-muted" data-testid="chat-disclaimer">{en.chatDisclaimer}</p>
        {value.length >= COUNTER_AT && (
          <p className="shrink-0 text-xs tabular-nums text-muted" data-testid="chat-char-counter" aria-live="polite">{en.chat.counter(value.length)}</p>
        )}
      </div>
    </div>
  );
}
