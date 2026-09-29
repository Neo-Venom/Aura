import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy, Flower2, RotateCcw, Wind } from 'lucide-react';
import { toast } from 'sonner';
import { StreamingMessage } from './StreamingMessage';
import { CrisisCard } from '../safety/CrisisCard';
import { useUi } from '../../app/store';
import { extractTools } from '../../lib/stream';
import { timeLabel } from '../../lib/dates';
import { cn } from '../../lib/cn';
import { en } from '../../copy/en';
import type { ChatMessage } from '../../types/api';

export type UiMessage = ChatMessage & { status?: 'streaming' | 'failed' };

function Time({ iso, show }: { iso: string; show: boolean }) {
  return (
    <time dateTime={iso} className={cn('px-2 text-[11px] text-muted transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100', show ? 'opacity-100' : 'opacity-0')}>
      {timeLabel(iso)}
    </time>
  );
}

function AssistantBody({ m }: { m: UiMessage }) {
  const setTool = useUi((s) => s.setTool);
  const [copied, setCopied] = useState(false);
  const { clean, tools } = extractTools(m.content);
  const copy = async () => {
    try { await navigator.clipboard.writeText(clean); setCopied(true); toast(en.common.copied); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  if (m.status === 'streaming') return <StreamingMessage text={clean} />;
  return (
    <>
      <div className="chat-prose"><ReactMarkdown>{clean}</ReactMarkdown></div>
      {tools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tools.map((t) => (
            <button key={t} type="button" onClick={() => setTool(t)} data-testid={`inline-tool-${t}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sage/25 px-4 text-sm font-bold transition-colors duration-200 hover:bg-sage/40">
              {t === 'breathing' ? <Wind className="h-4 w-4" aria-hidden="true" /> : <Flower2 className="h-4 w-4" aria-hidden="true" />}
              {en.chat.tools[t]}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={copy} aria-label={en.common.copy} data-testid={`copy-message-${m.id}`}
        className="mt-1 -mb-2 -ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-soft hover:text-ink">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </>
  );
}

export function MessageBubble({ m, onRetry }: { m: UiMessage; onRetry?(m: UiMessage): void }) {
  const [showTime, setShowTime] = useState(false);
  const isUser = m.role === 'user';
  const crisis = !isUser && m.status !== 'streaming' && (m.safety_level === 'high' || m.safety_level === 'imminent');

  return (
    <div className={cn('group flex flex-col gap-1 animate-rise', isUser ? 'items-end' : 'items-start')} data-testid={`message-${m.role}`}>
      <div
        onClick={() => setShowTime((s) => !s)}
        className={cn(
          'max-w-[85%] px-5 py-3 text-base leading-[1.6] sm:max-w-[80%]',
          isUser ? 'whitespace-pre-wrap rounded-[24px] rounded-br-lg bg-soft' : 'rounded-[24px] rounded-bl-lg border border-line bg-surface',
        )}
      >
        {isUser ? m.content : <AssistantBody m={m} />}
      </div>
      <Time iso={m.created_at} show={showTime} />
      {isUser && m.status === 'failed' && (
        <div role="alert" className="flex flex-wrap items-center justify-end gap-2 text-sm" data-testid="message-failed">
          <span>{en.chat.failed}</span>
          <button type="button" onClick={() => onRetry?.(m)} data-testid="message-retry-button"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-soft px-4 font-bold transition-colors hover:bg-line">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />{en.chat.retry}
          </button>
        </div>
      )}
      {crisis && <div className="mt-2 w-full"><CrisisCard /></div>}
    </div>
  );
}
