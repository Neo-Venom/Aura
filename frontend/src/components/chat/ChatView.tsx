import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { BreakReminderCard, RestCard } from './BreakReminderCard';
import { FinishBanner } from './FinishBanner';
import { StreamingMessage } from './StreamingMessage';
import { useChat } from './useChat';
import { ErrorState } from '../common/ErrorState';
import { BreathingOrb } from '../calm/BreathingOrb';
import { useProfile } from '../../app/auth';
import { en } from '../../copy/en';

const BREAK_MS = 45 * 60_000;
const BREAK_MSGS = 40;

function useBreakReminder(sessionId: string, firstAt: string | undefined, userCount: number) {
  const key = `aura.break.${sessionId}`;
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(key) === 'dismissed');
  const [now, setNow] = useState(Date.now());
  const mountedAt = useRef(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const start = firstAt ? new Date(firstAt).getTime() : mountedAt.current;
  const show = !dismissed && (now - start >= BREAK_MS || userCount >= BREAK_MSGS);
  return { show, dismiss: () => { localStorage.setItem(key, 'dismissed'); setDismissed(true); } };
}

export function ChatView({ sessionId }: { sessionId: string }) {
  const { data: me } = useProfile();
  const { query, items, phase, resting, send, stop, retry } = useChat(sessionId);
  const scroller = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const userCount = items.filter((m) => m.role === 'user').length;
  const brk = useBreakReminder(sessionId, items[0]?.created_at, userCount);
  const waiting = phase === 'waiting';

  const toBottom = (smooth = true) => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => { if (atBottom) toBottom(false); }, [items, waiting, resting, brk.show, atBottom]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  if (query.isError) return <ErrorState body={en.chat.loadFailed} onRetry={() => query.refetch()} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="chat-view">
      <FinishBanner />
      <div ref={scroller} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto" data-testid="chat-scroll">
        <div className="mx-auto flex w-full max-w-chat flex-col gap-5 px-4 py-6" aria-live="polite" aria-busy={phase !== 'idle'} data-testid="chat-messages">
          {query.isLoading && <div className="flex justify-center py-10"><BreathingOrb label={en.common.loading} /></div>}
          {items.map((m) => <MessageBubble key={m.id} m={m} onRetry={retry} />)}
          {waiting && (
            <div className="flex items-start" data-testid="assistant-thinking">
              <div className="rounded-[24px] rounded-bl-lg border border-line bg-surface px-5 py-3"><StreamingMessage text="" /></div>
            </div>
          )}
          {resting && <RestCard />}
          {brk.show && <BreakReminderCard onDismiss={brk.dismiss} />}
        </div>
      </div>
      {!atBottom && (
        <button
          type="button"
          onClick={() => toBottom()}
          data-testid="jump-to-latest"
          className="absolute bottom-36 left-1/2 z-10 inline-flex min-h-[44px] -translate-x-1/2 items-center gap-2 rounded-full bg-surface px-4 text-sm font-bold shadow-lift animate-rise"
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />{en.chat.jump}
        </button>
      )}
      <ChatInput
        draftId={sessionId}
        onSend={(c, mode) => { setAtBottom(true); send(c, mode); }}
        onStop={stop}
        streaming={phase !== 'idle'}
        autoSendVoice={!!me?.auto_send_voice}
        voiceLang={me?.stt_language}
        autoFocus
      />
    </div>
  );
}
