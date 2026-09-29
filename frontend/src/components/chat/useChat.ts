import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getServices } from '../../services';
import { useUi } from '../../app/store';
import { uid } from '../../lib/cn';
import type { InputMode, SafetyLevel } from '../../types/api';
import type { UiMessage } from './MessageBubble';

export function useChat(sessionId: string) {
  const { chatService } = getServices();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['session', sessionId], queryFn: () => chatService.getSession(sessionId), staleTime: 0 });
  const [items, setItems] = useState<UiMessage[]>([]);
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'streaming'>('idle');
  const [resting, setResting] = useState(false);
  const ctrl = useRef<AbortController | null>(null);
  const initialized = useRef(false);
  const crisisOpened = useRef(false);

  useEffect(() => {
    if (query.data && !initialized.current) {
      initialized.current = true;
      setItems(query.data.messages);
    }
  }, [query.data]);

  useEffect(() => () => ctrl.current?.abort(), []);

  const send = useCallback(async (content: string, input_mode: InputMode, retryId?: string) => {
    initialized.current = true;
    const clientId = retryId ?? uid();
    const now = new Date().toISOString();
    setResting(false);
    setItems((list) => retryId
      ? list.map((m) => (m.id === clientId ? { ...m, status: undefined } : m))
      : [...list, { id: clientId, session_id: sessionId, role: 'user', content, input_mode, safety_level: 'none', created_at: now }]);

    const c = new AbortController();
    ctrl.current = c;
    setPhase('waiting');
    let aId = `pending-${clientId}`;
    let text = '';
    let level: SafetyLevel = 'none';
    let started = false;
    const aTime = new Date().toISOString();
    const upsert = (status?: 'streaming') => setItems((list) => {
      const a: UiMessage = { id: aId, session_id: sessionId, role: 'assistant', content: text, input_mode: 'text', safety_level: level, created_at: aTime, status };
      return list.some((m) => m.id === aId) ? list.map((m) => (m.id === aId ? a : m)) : [...list, a];
    });
    const fail = () => setItems((list) => list.map((m) => (m.id === clientId ? { ...m, status: 'failed' } : m)));

    try {
      for await (const ev of chatService.sendMessage(sessionId, { content, input_mode, client_message_id: clientId }, c.signal)) {
        if (ev.type === 'meta') aId = ev.assistant_message_id;
        else if (ev.type === 'token') {
          text += ev.delta;
          if (!started) { started = true; setPhase('streaming'); }
          upsert('streaming');
        } else if (ev.type === 'safety') {
          level = ev.level;
          if (ev.level === 'imminent' && !crisisOpened.current) {
            crisisOpened.current = true;
            useUi.getState().setCrisisOpen(true);
          }
        } else if (ev.type === 'title') {
          qc.invalidateQueries({ queryKey: ['sessions'] });
        } else if (ev.type === 'error') {
          if (ev.code === 'rate_limited' || ev.code === 'daily_limit_reached') setResting(true);
          else if (!started) fail();
          break;
        }
      }
      if (started) upsert();
    } catch {
      if (started) upsert();
      else if (!c.signal.aborted) fail();
    } finally {
      ctrl.current = null;
      setPhase('idle');
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['session', sessionId] });
    }
  }, [chatService, qc, sessionId]);

  const stop = useCallback(() => ctrl.current?.abort(), []);
  const retry = useCallback((m: UiMessage) => send(m.content, m.input_mode, m.id), [send]);

  // Consume a first message handed over from the new-chat screen (timer survives StrictMode double effects).
  useEffect(() => {
    const p = useUi.getState().pending;
    if (!p || p.sessionId !== sessionId) return;
    const t = setTimeout(() => {
      useUi.getState().setPending(null);
      send(p.content, p.input_mode);
    }, 0);
    return () => clearTimeout(t);
  }, [sessionId, send]);

  return { query, items, phase, resting, send, stop, retry };
}
