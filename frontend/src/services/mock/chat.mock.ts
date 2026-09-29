import type { ChatService } from '../chat';
import { ApiError } from '../http';
import { sleep } from '../../lib/stream';
import { currentUserId, db, latency, nowIso, uid } from './db';
import { REPLIES } from './seed';
import type { ChatMessage, SafetyLevel, StreamEvent } from '../../types/api';

const DEFAULT_TITLE = 'Quiet moment';

const titleFrom = (text: string) =>
  text.replace(/\[test-[a-z]+\]/gi, '').trim().split(/\s+/).slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || DEFAULT_TITLE;

function ownSession(id: string) {
  const uidv = currentUserId();
  const s = (db.load().sessions[uidv] ?? []).find((x) => x.id === id);
  if (!s) throw new ApiError('not_found', 'Session not found', 404);
  return { userId: uidv, session: s };
}

function touch(userId: string, sessionId: string, patch: { title?: string; last_message_at?: string }) {
  db.update((d) => {
    d.sessions[userId] = (d.sessions[userId] ?? []).map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
  });
}

function pushMessage(m: ChatMessage) {
  db.update((d) => { d.messages[m.session_id] = [...(d.messages[m.session_id] ?? []).filter((x) => x.id !== m.id), m]; });
}

export const mockChatService: ChatService = {
  async listSessions({ q }) {
    await latency();
    const d = db.load();
    let items = [...(d.sessions[currentUserId()] ?? [])];
    const needle = q?.trim().toLowerCase();
    if (needle) {
      items = items.filter((s) => s.title.toLowerCase().includes(needle)
        || (d.messages[s.id] ?? []).some((m) => m.content.toLowerCase().includes(needle)));
    }
    items.sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
    return { items, next_cursor: null };
  },
  async createSession() {
    await latency();
    const id = currentUserId();
    const t = nowIso();
    const s = { id: uid(), title: DEFAULT_TITLE, created_at: t, last_message_at: t };
    db.update((d) => { d.sessions[id] = [s, ...(d.sessions[id] ?? [])]; });
    return s;
  },
  async getSession(id) {
    await latency();
    const { session } = ownSession(id);
    return { session, messages: db.load().messages[id] ?? [] };
  },
  async renameSession(id, title) {
    await latency();
    const { userId } = ownSession(id);
    touch(userId, id, { title });
    return ownSession(id).session;
  },
  async deleteSession(id) {
    await latency();
    const { userId } = ownSession(id);
    db.update((d) => {
      d.sessions[userId] = (d.sessions[userId] ?? []).filter((s) => s.id !== id);
      delete d.messages[id];
    });
  },
  async deleteAll() {
    await latency();
    const userId = currentUserId();
    db.update((d) => {
      (d.sessions[userId] ?? []).forEach((s) => delete d.messages[s.id]);
      d.sessions[userId] = [];
    });
  },
  async *sendMessage(sessionId, input, signal): AsyncGenerator<StreamEvent> {
    const { userId, session } = ownSession(sessionId);
    await sleep(250, signal);
    if (signal.aborted) return;
    const text = input.content;
    // NOTE: extra QA triggers for error states (mock only): [test-error], [test-limit]
    if (/\[test-error\]/i.test(text)) throw new ApiError('internal', 'Mock failure');
    if (/\[test-limit\]/i.test(text)) {
      yield { type: 'error', code: 'daily_limit_reached', message: 'Daily limit reached' };
      return;
    }
    const prior = db.load().messages[sessionId] ?? [];
    const isFirst = !prior.some((m) => m.role === 'user');
    const userMsg: ChatMessage = {
      id: input.client_message_id, session_id: sessionId, role: 'user', content: text,
      input_mode: input.input_mode, safety_level: 'none', created_at: nowIso(),
    };
    pushMessage(userMsg);
    const assistantId = uid();
    yield { type: 'meta', user_message_id: userMsg.id, assistant_message_id: assistantId };

    let level: SafetyLevel = 'none';
    if (/\[test-imminent\]/i.test(text)) level = 'imminent';
    else if (/\[test-high\]/i.test(text)) level = 'high';

    let reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    if (level !== 'none') reply = "I'm really glad you told me. What you're feeling matters, and you deserve support right now from someone who can be there with you.";
    else if (Math.random() < 1 / 6) reply += ' [[tool:breathing]]';

    await sleep(700 + Math.random() * 600, signal);
    let acc = '';
    const persist = () => pushMessage({
      id: assistantId, session_id: sessionId, role: 'assistant', content: acc,
      input_mode: 'text', safety_level: level, created_at: nowIso(),
    });
    for (const part of reply.split(/(\s+)/)) {
      if (signal.aborted) break;
      acc += part;
      yield { type: 'token', delta: part };
      await sleep(30 + Math.random() * 30, signal);
    }
    persist();
    touch(userId, sessionId, { last_message_at: nowIso() });
    if (signal.aborted) return;
    if (level !== 'none') yield { type: 'safety', level, show_crisis_card: true };
    if (isFirst && session.title === DEFAULT_TITLE) {
      const title = titleFrom(text);
      touch(userId, sessionId, { title });
      yield { type: 'title', title };
    }
    yield { type: 'done', finish_reason: 'stop' };
  },
};
