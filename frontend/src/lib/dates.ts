import type { ChatSession } from '../types/api';

export type SessionGroup = 'today' | 'yesterday' | 'week' | 'older';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function groupOf(iso: string, now = new Date()): SessionGroup {
  const day = startOfDay(new Date(iso));
  const today = startOfDay(now);
  const diff = Math.round((today - day) / 86_400_000);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return 'week';
  return 'older';
}

export function groupSessions(sessions: ChatSession[]) {
  const groups: Record<SessionGroup, ChatSession[]> = { today: [], yesterday: [], week: [], older: [] };
  sessions.forEach((s) => groups[groupOf(s.last_message_at)].push(s));
  return groups;
}

export const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
