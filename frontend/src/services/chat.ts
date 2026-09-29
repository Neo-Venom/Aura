import { apiFetch, apiFetchRaw } from './http';
import { parseSSE } from '../lib/stream';
import type { ChatMessage, ChatSession, InputMode, StreamEvent } from '../types/api';

export interface SendInput { content: string; input_mode: InputMode; client_message_id: string }
export interface SessionPage { items: ChatSession[]; next_cursor: string | null }
export interface SessionDetail { session: ChatSession; messages: ChatMessage[] }

export interface ChatService {
  listSessions(p: { cursor?: string | null; q?: string }): Promise<SessionPage>;
  createSession(): Promise<ChatSession>;
  getSession(id: string): Promise<SessionDetail>;
  renameSession(id: string, title: string): Promise<ChatSession>;
  deleteSession(id: string): Promise<void>;
  deleteAll(): Promise<void>;
  sendMessage(sessionId: string, input: SendInput, signal: AbortSignal): AsyncIterable<StreamEvent>;
}

export const httpChatService: ChatService = {
  // TODO(Antigravity): GET /v1/chat/sessions?cursor=&q=
  listSessions: ({ cursor, q }) => {
    const p = new URLSearchParams();
    if (cursor) p.set('cursor', cursor);
    if (q) p.set('q', q);
    return apiFetch<SessionPage>(`/v1/chat/sessions?${p.toString()}`);
  },
  // TODO(Antigravity): POST /v1/chat/sessions
  createSession: () => apiFetch<ChatSession>('/v1/chat/sessions', { method: 'POST' }),
  // TODO(Antigravity): GET /v1/chat/sessions/:id -> { session, messages }
  getSession: (id) => apiFetch<SessionDetail>(`/v1/chat/sessions/${id}`),
  // TODO(Antigravity): PATCH /v1/chat/sessions/:id { title }
  renameSession: (id, title) => apiFetch<ChatSession>(`/v1/chat/sessions/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  // TODO(Antigravity): DELETE /v1/chat/sessions/:id
  deleteSession: (id) => apiFetch<void>(`/v1/chat/sessions/${id}`, { method: 'DELETE' }),
  // TODO(Antigravity): DELETE /v1/chat/sessions
  deleteAll: () => apiFetch<void>('/v1/chat/sessions', { method: 'DELETE' }),
  // TODO(Antigravity): POST /v1/chat/sessions/:id/messages -> text/event-stream of StreamEvent JSON in `data:` lines.
  // Must be idempotent on client_message_id so the Retry button is safe.
  async *sendMessage(sessionId, input, signal) {
    const res = await apiFetchRaw(`/v1/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: { Accept: 'text/event-stream' },
      signal,
    });
    if (!res.body) throw new Error('empty stream');
    yield* parseSSE(res.body, signal);
  },
};
