import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChatInput } from '../components/chat/ChatInput';
import { SuggestionChips } from '../components/chat/SuggestionChips';
import { FinishBanner } from '../components/chat/FinishBanner';
import { SunShape } from '../components/decor/Illustrations';
import { useProfile } from '../app/auth';
import { useUi } from '../app/store';
import { getServices } from '../services';
import { toast } from 'sonner';
import { en } from '../copy/en';
import type { InputMode } from '../types/api';

export default function Chat() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useProfile();
  const [seed, setSeed] = useState<{ text: string; n: number }>();
  const [busy, setBusy] = useState(false);
  const name = me?.display_name?.trim() || en.chat.friend;

  const start = async (content: string, input_mode: InputMode) => {
    setBusy(true);
    try {
      const s = await getServices().chatService.createSession();
      useUi.getState().setPending({ sessionId: s.id, content, input_mode });
      qc.invalidateQueries({ queryKey: ['sessions'] });
      navigate(`/app/chat/${s.id}`);
    } catch {
      toast(en.chat.failed);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="new-chat-page">
      <FinishBanner />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-5 py-10 text-center">
        <SunShape className="h-14 w-14 text-butter animate-rise" />
        <h1 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl lg:text-5xl animate-rise" data-testid="new-chat-greeting">
          {en.chat.greeting(name)}
        </h1>
        <SuggestionChips onPick={(t) => setSeed({ text: t, n: Date.now() })} />
      </div>
      <ChatInput draftId="new" seed={seed} onSend={start} streaming={busy} autoSendVoice={!!me?.auto_send_voice} autoFocus />
    </div>
  );
}
