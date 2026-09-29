import ReactMarkdown from 'react-markdown';
import { BreathingOrb } from '../calm/BreathingOrb';
import { en } from '../../copy/en';

export function StreamingMessage({ text }: { text: string }) {
  if (!text) return <span className="flex h-7 items-center"><BreathingOrb size={26} label={en.chat.thinking} /></span>;
  return <div className="chat-prose" data-testid="streaming-message"><ReactMarkdown>{text}</ReactMarkdown></div>;
}
