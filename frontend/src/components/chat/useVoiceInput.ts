import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getServices } from '../../services';
import { en } from '../../copy/en';

const join = (...parts: string[]) => parts.filter(Boolean).join(' ');
const buzz = () => { try { navigator.vibrate?.(10); } catch { /* unsupported */ } };

// Streams speech into the input; optionally auto-sends ~1.5s after speech stops.
export function useVoiceInput(opts: { getValue(): string; setValue(v: string): void; autoSend: boolean; onAutoSend(text: string): void }) {
  const { sttService } = getServices();
  const [listening, setListening] = useState(false);
  const base = useRef('');
  const finals = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const o = useRef(opts);
  o.current = opts;

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };

  const stop = useCallback(() => { clearTimer(); sttService.stop(); }, [sttService]);

  const start = useCallback(async () => {
    if (!sttService.isSupported()) { toast(en.chat.micUnavailable); return; }
    base.current = o.current.getValue().trim();
    finals.current = '';
    setListening(true);
    buzz();
    await sttService.start({
      onInterim: (t) => o.current.setValue(join(base.current, finals.current, t)),
      onFinal: (t) => {
        finals.current = join(finals.current, t);
        const full = join(base.current, finals.current);
        o.current.setValue(full);
        if (o.current.autoSend) {
          clearTimer();
          timer.current = setTimeout(() => { sttService.stop(); o.current.onAutoSend(full); }, 1500);
        }
      },
      onEnd: () => { setListening(false); buzz(); },
      onError: () => { setListening(false); toast(en.chat.micUnavailable); },
    });
  }, [sttService]);

  useEffect(() => () => { clearTimer(); sttService.stop(); }, [sttService]);

  return { listening, toggle: () => (listening ? stop() : start()), stop };
}
